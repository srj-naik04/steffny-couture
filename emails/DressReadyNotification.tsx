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
 * Sent to the customer when their garment is marked ready (CLAUDE.md §6.3).
 */

export type DressReadyNotificationProps = {
  customerName: string;
  reference: string;
  alteration: string;
};

export default function DressReadyNotification({
  customerName,
  reference,
  alteration,
}: DressReadyNotificationProps) {
  return (
    <BrandLayout preview={`Your garment is ready to collect — ${reference}`}>
      <EmailHeading>Your garment is ready</EmailHeading>
      <EmailText>
        Good news, {customerName} — your alteration is finished and ready to
        collect from our Hounslow studio during opening hours.
      </EmailText>

      <SummaryCard>
        <DetailRow label="Reference" value={reference} />
        <DetailRow label="Alteration" value={alteration} />
        <DetailRow
          label="Collect from"
          value="255 High Street, Hounslow, London TW3 1EA"
        />
      </SummaryCard>

      <CtaButton
        href={`https://wa.me/447834877992?text=Hi%20Steffi%2C%20I%27d%20like%20to%20collect%20booking%20${reference}`}
        label="Arrange collection"
      />
    </BrandLayout>
  );
}

DressReadyNotification.PreviewProps = {
  customerName: 'Amara',
  reference: 'SC-482917',
  alteration: 'Hem',
} satisfies DressReadyNotificationProps;
