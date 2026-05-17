import * as React from 'react';

import {
  BrandLayout,
  CtaButton,
  DetailRow,
  EmailHeading,
  EmailText,
  SummaryCard,
} from './components/BrandLayout';

/**
 * Sent to the customer 24 hours before their appointment (CLAUDE.md §6.3) —
 * dispatched by a scheduled Edge Function.
 */

export type AppointmentReminderProps = {
  customerName: string;
  reference: string;
  alteration: string;
  appointmentDate: string;
  appointmentTime: string;
};

export default function AppointmentReminder({
  customerName,
  reference,
  alteration,
  appointmentDate,
  appointmentTime,
}: AppointmentReminderProps) {
  return (
    <BrandLayout preview={`Reminder: your fitting on ${appointmentDate}`}>
      <EmailHeading>See you tomorrow</EmailHeading>
      <EmailText>
        A gentle reminder, {customerName} — your fitting at the Hounslow studio
        is coming up. If you need to rebook, just message Steffi.
      </EmailText>

      <SummaryCard>
        <DetailRow label="Reference" value={reference} />
        <DetailRow label="Alteration" value={alteration} />
        <DetailRow
          label="Appointment"
          value={`${appointmentDate} · ${appointmentTime}`}
        />
      </SummaryCard>

      <CtaButton
        href={`https://wa.me/447834877992?text=Hi%20Steffi%2C%20re%3A%20booking%20${reference}`}
        label="Message Steffi"
      />
    </BrandLayout>
  );
}

AppointmentReminder.PreviewProps = {
  customerName: 'Amara',
  reference: 'SC-482917',
  alteration: 'Hem',
  appointmentDate: 'Wednesday, 21 May 2026',
  appointmentTime: '2:30 PM',
} satisfies AppointmentReminderProps;
