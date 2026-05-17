// Edge Function: send-email  (CLAUDE.md §1.5)
// ---------------------------------------------------------------------------
// Renders a react-email template to HTML and sends it over SMTP via Nodemailer.
//
// Deployment (post-demo — deferred while SMTP credentials are pending):
//   supabase functions deploy send-email
//   supabase secrets set SMTP_HOST=... SMTP_PORT=... SMTP_USER=... \
//     SMTP_PASS=... SMTP_FROM_NAME="Steffny Couture" \
//     SMTP_FROM_EMAIL=bookings@steffnycouture.co.uk \
//     STUDIO_EMAIL=bookings@steffnycouture.co.uk
//
// Invoke with the service-role key:
//   POST { "type": "booking_confirmation" | "status_update" | "dress_ready"
//          | "internal_alert" | "appointment_reminder",
//          "booking_id": "<uuid>" }
// ---------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import React from 'react';

import BookingConfirmation from '../../../emails/BookingConfirmation.tsx';
import BookingStatusUpdate from '../../../emails/BookingStatusUpdate.tsx';
import DressReadyNotification from '../../../emails/DressReadyNotification.tsx';
import InternalNewBookingAlert from '../../../emails/InternalNewBookingAlert.tsx';
import AppointmentReminder from '../../../emails/AppointmentReminder.tsx';

type EmailType =
  | 'booking_confirmation'
  | 'status_update'
  | 'dress_ready'
  | 'internal_alert'
  | 'appointment_reminder';

const env = (key: string): string => Deno.env.get(key) ?? '';

const supabase = createClient(
  env('SUPABASE_URL'),
  env('SUPABASE_SERVICE_ROLE_KEY'),
);

/** Format an ISO date in the studio's timezone. */
function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00Z`));
}

/** Format an "HH:MM[:SS]" time string as "2:30 PM". */
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

const STATUS_COPY: Record<string, { label: string; message: string }> = {
  confirmed: {
    label: 'Booking confirmed',
    message: 'Steffi has confirmed your appointment — see you soon.',
  },
  in_progress: {
    label: 'Work has started',
    message: 'Steffi has started work on your garment.',
  },
  cancelled: {
    label: 'Booking cancelled',
    message: 'This booking has been cancelled. Message Steffi to rebook.',
  },
};

Deno.serve(async (req) => {
  // Only the service role (the DB trigger / a trusted caller) may send mail.
  const auth = req.headers.get('Authorization') ?? '';
  if (!auth.includes(env('SUPABASE_SERVICE_ROLE_KEY'))) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { type, booking_id } = (await req.json()) as {
      type: EmailType;
      booking_id: string;
    };

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, alteration_types(label)')
      .eq('id', booking_id)
      .single();
    if (error || !booking) {
      return Response.json({ ok: false, error: 'Booking not found' }, {
        status: 404,
      });
    }

    const alteration = booking.alteration_types?.label ?? 'Alteration';
    const customerName = booking.guest_name ?? 'there';
    const appointmentDate = formatDate(booking.appointment_date);
    const appointmentTime = formatTime(booking.appointment_time);

    let element: React.ReactElement;
    let subject: string;
    let to: string;

    switch (type) {
      case 'booking_confirmation':
        element = React.createElement(BookingConfirmation, {
          customerName,
          reference: booking.reference,
          alteration,
          appointmentDate,
          appointmentTime,
        });
        subject = `Your booking ${booking.reference} is confirmed`;
        to = booking.guest_email;
        break;
      case 'status_update': {
        const copy = STATUS_COPY[booking.status] ?? {
          label: 'Booking updated',
          message: 'The status of your booking has changed.',
        };
        element = React.createElement(BookingStatusUpdate, {
          customerName,
          reference: booking.reference,
          alteration,
          statusLabel: copy.label,
          statusMessage: copy.message,
        });
        subject = `Booking ${booking.reference}: ${copy.label}`;
        to = booking.guest_email;
        break;
      }
      case 'dress_ready':
        element = React.createElement(DressReadyNotification, {
          customerName,
          reference: booking.reference,
          alteration,
        });
        subject = `Your garment is ready — ${booking.reference}`;
        to = booking.guest_email;
        break;
      case 'appointment_reminder':
        element = React.createElement(AppointmentReminder, {
          customerName,
          reference: booking.reference,
          alteration,
          appointmentDate,
          appointmentTime,
        });
        subject = `Reminder: your fitting on ${appointmentDate}`;
        to = booking.guest_email;
        break;
      case 'internal_alert':
        element = React.createElement(InternalNewBookingAlert, {
          customerName: booking.guest_name ?? 'A customer',
          customerPhone: booking.guest_phone ?? '—',
          customerEmail: booking.guest_email ?? '',
          reference: booking.reference,
          alteration,
          appointmentDate,
          appointmentTime,
          description: booking.description,
        });
        subject = `New booking ${booking.reference}`;
        to = env('STUDIO_EMAIL');
        break;
      default:
        return Response.json({ ok: false, error: 'Unknown type' }, {
          status: 400,
        });
    }

    if (!to) {
      return Response.json({ ok: false, error: 'No recipient' }, {
        status: 422,
      });
    }

    const html = await render(element);
    const text = await render(element, { plainText: true });

    const transporter = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port: Number(env('SMTP_PORT') || '587'),
      secure: env('SMTP_PORT') === '465',
      auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
    });

    const info = await transporter.sendMail({
      from: `"${env('SMTP_FROM_NAME')}" <${env('SMTP_FROM_EMAIL')}>`,
      to,
      subject,
      html,
      text,
    });

    return Response.json({ ok: true, message_id: info.messageId });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
});
