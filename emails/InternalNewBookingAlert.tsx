import * as React from 'react';

import {
  BrandLayout,
  DetailRow,
  EmailHeading,
  EmailText,
  SummaryCard,
} from './components/BrandLayout';

/**
 * Sent to the studio inbox when a new booking comes in (CLAUDE.md §6.3) — so
 * Steffi sees walk-up demand without opening the app.
 */

export type InternalNewBookingAlertProps = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  reference: string;
  alteration: string;
  appointmentDate: string;
  appointmentTime: string;
  description: string;
};

export default function InternalNewBookingAlert({
  customerName,
  customerPhone,
  customerEmail,
  reference,
  alteration,
  appointmentDate,
  appointmentTime,
  description,
}: InternalNewBookingAlertProps) {
  return (
    <BrandLayout preview={`New booking ${reference} from ${customerName}`}>
      <EmailHeading>New booking</EmailHeading>
      <EmailText>
        {customerName} has booked an alteration. Reply with a quote within 24
        hours.
      </EmailText>

      <SummaryCard>
        <DetailRow label="Reference" value={reference} />
        <DetailRow label="Customer" value={customerName} />
        <DetailRow label="Phone" value={customerPhone} />
        <DetailRow label="Email" value={customerEmail || '—'} />
        <DetailRow label="Alteration" value={alteration} />
        <DetailRow
          label="Appointment"
          value={`${appointmentDate} · ${appointmentTime}`}
        />
        <DetailRow label="Notes" value={description} />
      </SummaryCard>
    </BrandLayout>
  );
}

InternalNewBookingAlert.PreviewProps = {
  customerName: 'Amara Okafor',
  customerPhone: '+44 7700 900123',
  customerEmail: 'amara@example.com',
  reference: 'SC-482917',
  alteration: 'Hem',
  appointmentDate: 'Wednesday, 21 May 2026',
  appointmentTime: '2:30 PM',
  description: 'Shorten the hem of an evening gown to ankle length.',
} satisfies InternalNewBookingAlertProps;
