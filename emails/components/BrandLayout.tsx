import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

/**
 * Shared brand shell for every Steffny Couture email (CLAUDE.md §1.6).
 * Rendered server-side in the `send-email` Edge Function — never bundled into
 * the mobile app. Fonts fall back to a web-safe serif since Fraunces cannot be
 * relied on in email clients.
 */

export const brand = {
  ivory: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F4EFE8',
  rose: '#7C2D3E',
  gold: '#C9A961',
  ink: '#1F1B1A',
  inkMuted: '#5C5551',
  border: '#E8E0D7',
} as const;

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";

type LayoutProps = {
  preview: string;
  children: React.ReactNode;
};

export function BrandLayout({ preview, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: brand.ivory,
          fontFamily: SANS,
          margin: 0,
          padding: '24px 0',
        }}>
        <Container style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
          <Section style={{ padding: '8px 0 20px', textAlign: 'center' }}>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: '24px',
                color: brand.rose,
                margin: 0,
              }}>
              Steffny Couture
            </Text>
            <Text
              style={{
                fontSize: '11px',
                color: brand.gold,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: '6px 0 0',
              }}>
              Crafted in London
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: brand.surface,
              borderRadius: '16px',
              border: `1px solid ${brand.border}`,
              padding: '28px 24px',
            }}>
            {children}
          </Section>

          <Section style={{ padding: '20px 8px', textAlign: 'center' }}>
            <Hr style={{ borderColor: brand.border, margin: '0 0 16px' }} />
            <Text style={{ fontSize: '12px', color: brand.inkMuted, margin: '0 0 4px' }}>
              255 High Street, Hounslow, London TW3 1EA
            </Text>
            <Text style={{ fontSize: '12px', color: brand.inkMuted, margin: '0 0 4px' }}>
              Mon–Fri 9:30–19:00 · Sat 10:00–19:00 · Sun 11:00–18:00
            </Text>
            <Link
              href="https://wa.me/447834877992"
              style={{ fontSize: '12px', color: brand.rose }}>
              +44 7834 877992
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/** A heading inside the card. */
export function EmailHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: SERIF,
        fontSize: '22px',
        color: brand.ink,
        margin: '0 0 12px',
      }}>
      {children}
    </Text>
  );
}

/** Body copy paragraph. */
export function EmailText({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: '15px', lineHeight: '24px', color: brand.inkMuted, margin: '0 0 12px' }}>
      {children}
    </Text>
  );
}

/** A label / value row for the booking summary block. */
export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Section style={{ padding: '6px 0' }}>
      <Text style={{ fontSize: '11px', color: brand.inkMuted, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
        {label}
      </Text>
      <Text style={{ fontSize: '15px', color: brand.ink, margin: '2px 0 0' }}>
        {value}
      </Text>
    </Section>
  );
}

/** The summary card panel that wraps DetailRows. */
export function SummaryCard({ children }: { children: React.ReactNode }) {
  return (
    <Section
      style={{
        backgroundColor: brand.surfaceAlt,
        borderRadius: '12px',
        padding: '8px 16px',
        margin: '8px 0 20px',
      }}>
      {children}
    </Section>
  );
}

/** The primary call-to-action button. */
export function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: brand.rose,
        borderRadius: '999px',
        color: brand.ivory,
        fontSize: '15px',
        padding: '13px 28px',
        textDecoration: 'none',
      }}>
      {label}
    </Button>
  );
}
