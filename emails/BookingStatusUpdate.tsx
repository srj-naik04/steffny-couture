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
 * Sent to the customer when a booking moves to confirmed, in progress or
 * cancelled (CLAUDE.md §6.3).
 */

export type BookingStatusUpdateProps = {
  customerName: string;
  reference: string;
  alteration: string;
  statusLabel: string;
  statusMessage: string;
};

export default function BookingStatusUpdate({
  customerName,
  reference,
  alteration,
  statusLabel,
  statusMessage,
}: BookingStatusUpdateProps) {
  return (
    <BrandLayout preview={`Booking ${reference}: ${statusLabel}`}>
      <EmailHeading>{statusLabel}</EmailHeading>
      <EmailText>
        Hi {customerName}, there’s an update on your booking. {statusMessage}
      </EmailText>

      <SummaryCard>
        <DetailRow label="Reference" value={reference} />
        <DetailRow label="Alteration" value={alteration} />
        <DetailRow label="Status" value={statusLabel} />
      </SummaryCard>

      <CtaButton
        href={`https://wa.me/447834877992?text=Hi%20Steffi%2C%20re%3A%20booking%20${reference}`}
        label="Message Steffi"
      />
    </BrandLayout>
  );
}

BookingStatusUpdate.PreviewProps = {
  customerName: 'Amara',
  reference: 'SC-482917',
  alteration: 'Hem',
  statusLabel: 'Booking confirmed',
  statusMessage: 'Steffi has confirmed your appointment — see you soon.',
} satisfies BookingStatusUpdateProps;
