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
 * Sent to the customer the moment a booking is created (CLAUDE.md §1.6).
 */

export type BookingConfirmationProps = {
  customerName: string;
  reference: string;
  alteration: string;
  appointmentDate: string;
  appointmentTime: string;
};

export default function BookingConfirmation({
  customerName,
  reference,
  alteration,
  appointmentDate,
  appointmentTime,
}: BookingConfirmationProps) {
  return (
    <BrandLayout preview={`Your booking ${reference} is confirmed`}>
      <EmailHeading>You’re booked</EmailHeading>
      <EmailText>
        Thank you, {customerName}. We’ve received your alteration booking and
        Steffi will reply with a price quote within 24 hours.
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

BookingConfirmation.PreviewProps = {
  customerName: 'Amara',
  reference: 'SC-482917',
  alteration: 'Hem',
  appointmentDate: 'Wednesday, 21 May 2026',
  appointmentTime: '2:30 PM',
} satisfies BookingConfirmationProps;
