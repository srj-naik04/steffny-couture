---
name: email-templates
description: Use this skill whenever creating, editing, or reviewing email templates for the Steffny Couture app — the booking confirmation, status update, dress ready notification, appointment reminder, or internal alert. Fires for any file in `/emails/` or the Edge Function that sends emails. Enforces react-email conventions, brand styling, deliverability rules, copy tone, and the plaintext fallback requirement.
---

# Email Template Conventions

Emails are the most visible touchpoint outside the app. They land in inboxes that include the customer's most discerning eye. Treat them like the front page of the brand.

## Stack
- **react-email** — templates as React components
- **Rendered server-side** in the Supabase Edge Function (Deno) — never in the mobile bundle
- **Nodemailer** — SMTP transport
- **Inline CSS only** — email clients strip `<style>` tags or scope them unreliably

## File Structure
```
/emails
  /components
    EmailLayout.tsx       # Header + footer wrapper
    Button.tsx            # Brand button
    InfoCard.tsx          # Reused detail card
    Divider.tsx
  BookingConfirmation.tsx
  BookingStatusUpdate.tsx
  DressReadyNotification.tsx
  AppointmentReminder.tsx
  InternalNewBookingAlert.tsx
```

## The Layout Wrapper

```tsx
// emails/components/EmailLayout.tsx
import { Html, Head, Body, Container, Section, Text, Img, Hr, Tailwind } from '@react-email/components';

export function EmailLayout({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html lang="en">
      <Head>
        <title>Steffny Couture</title>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                ivory: '#FAF7F2',
                surface: '#FFFFFF',
                rose: '#7C2D3E',
                roseDark: '#5A1F2C',
                roseSoft: '#F2D9DE',
                gold: '#C9A961',
                ink: '#1F1B1A',
                inkMuted: '#5C5551',
                border: '#E8E0D7',
              },
              fontFamily: {
                display: ['Fraunces', 'Georgia', 'serif'],
                body: ['Inter', '-apple-system', 'sans-serif'],
              },
            },
          },
        }}
      >
        <Body className="bg-ivory font-body m-0 p-0">
          {/* Hidden preview text (shows in inbox preview) */}
          <Text className="hidden">{preview}</Text>

          <Container className="max-w-[560px] mx-auto p-6">
            {/* Header */}
            <Section className="text-center pb-6 border-b border-border">
              <Text className="font-display text-2xl text-rose m-0 tracking-wide">
                Steffny Couture
              </Text>
              <Text className="text-xs text-inkMuted mt-1 uppercase tracking-widest">
                Crafted in London
              </Text>
            </Section>

            {/* Body */}
            <Section className="bg-surface rounded-2xl p-6 mt-6">
              {children}
            </Section>

            {/* Footer */}
            <Section className="mt-8 text-center">
              <Text className="text-xs text-inkMuted m-0">
                255 High Street, Hounslow, London TW3 1EA
              </Text>
              <Text className="text-xs text-inkMuted m-0 mt-1">
                Mon–Fri 9:30am–7pm · Sat 10am–7pm · Sun 11am–6pm
              </Text>
              <Text className="text-xs text-inkMuted m-0 mt-3">
                <a href="tel:+447834877992" className="text-inkMuted no-underline">+44 7834 877992</a>
                {' · '}
                <a href="https://instagram.com/steffnycouture" className="text-inkMuted no-underline">@steffnycouture</a>
              </Text>
              <Text className="text-xs text-inkSubtle m-0 mt-4">
                © Steffny Couture Ltd
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
```

## The Five Templates

### 1. Booking Confirmation
Sent: immediately on booking submission.
To: customer.
Subject: "We've got your booking, [Name]"
Preview: "Booking [REF] — Steffi will be in touch shortly with a quote."

Hero: "You're booked."
Body: appointment date + time + alteration type + reference number. WhatsApp CTA prominent.

### 2. Booking Status Update
Sent: on transitions to `confirmed` or `in_progress`.
To: customer.
Subject (confirmed): "Booking confirmed — [Date]"
Subject (in_progress): "Steffi has started on your dress"

Body: status + what happens next + estimated timeline if available.

### 3. Dress Ready Notification ⭐
The most important transactional email — gets customers to come collect.

Sent: on transition to `ready`.
To: customer.
Subject: "Your dress is ready for collection"
Preview: "Pop into the studio — [Mon-Fri hours]."

Body: warm, brief. Address + hours + tap-to-call. Single CTA: "Open in WhatsApp" to coordinate timing.

### 4. Appointment Reminder
Sent: 24 hours before `appointment_date appointment_time` (via Supabase cron / scheduled Edge Function).
To: customer.
Subject: "Tomorrow at [Time] — your fitting"
Preview: "We'll see you at 255 High Street, Hounslow."

Body: appointment details + map link + reschedule WhatsApp link.

### 5. Internal New Booking Alert
Sent: immediately on customer submission.
To: Steffi (shop owner email).
Subject: "New booking — [Alteration type] · [Date]"
Preview: "[Customer Name] · [Phone]"

Body: full booking detail. CTA: "Open in app" (deep link).

## Template Template (the example pattern)

```tsx
// emails/BookingConfirmation.tsx
import { Heading, Text, Section, Hr, Button, Img } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { format, parseISO } from 'date-fns';

type Props = {
  customerName: string;
  bookingRef: string;
  alterationLabel: string;
  appointmentDate: string;  // ISO
  appointmentTime: string;  // HH:mm
  whatsappLink: string;
};

export default function BookingConfirmation({
  customerName,
  bookingRef,
  alterationLabel,
  appointmentDate,
  appointmentTime,
  whatsappLink,
}: Props) {
  const longDate = format(parseISO(appointmentDate), 'EEEE, d MMMM yyyy');
  const niceTime = format(parseISO(`2000-01-01T${appointmentTime}`), 'h:mm a');

  return (
    <EmailLayout preview={`Booking ${bookingRef} — Steffi will be in touch shortly.`}>
      <Heading className="font-display text-3xl text-ink m-0 mb-2">
        You're booked.
      </Heading>
      <Text className="text-base text-inkMuted mt-0 mb-6">
        Thanks, {customerName}. Here's what we've got down for you.
      </Text>

      <Section className="bg-ivory rounded-xl p-5 my-2">
        <Text className="text-xs uppercase tracking-widest text-inkMuted m-0">Reference</Text>
        <Text className="font-display text-xl text-ink m-0 mb-3">{bookingRef}</Text>

        <Text className="text-xs uppercase tracking-widest text-inkMuted m-0 mt-3">Alteration</Text>
        <Text className="text-base text-ink m-0 mb-3">{alterationLabel}</Text>

        <Text className="text-xs uppercase tracking-widest text-inkMuted m-0 mt-3">Appointment</Text>
        <Text className="text-base text-ink m-0">{longDate}</Text>
        <Text className="text-base text-ink m-0">{niceTime}</Text>
      </Section>

      <Text className="text-sm text-inkMuted mt-6 mb-4">
        Steffi will follow up shortly with a price quote. If you'd like to send a message
        in the meantime, tap below.
      </Text>

      <Button
        href={whatsappLink}
        className="bg-rose text-ivory font-body font-medium text-base rounded-full px-6 py-3 no-underline"
      >
        Message on WhatsApp
      </Button>
    </EmailLayout>
  );
}
```

## Tone Rules (mirror `steffny-brand`)

- **No exclamation marks**
- **No emoji** except an optional `✓` in success contexts (sparingly)
- **British English**
- **Address by first name** when known: "Thanks, Aisha."
- **Hero line is a statement, not a question or exclamation**: "You're booked." / "Your dress is ready." / "Tomorrow at 2:30 PM."
- **Body copy is 2-4 sentences max**
- **One primary CTA per email** — extra links are smaller, secondary

## Deliverability Checklist

For every send, ensure:
- [ ] `from` header is `"Steffny Couture" <bookings@steffnycouture.co.uk>` — with display name
- [ ] `reply-to` set to a real human address (Steffi's email)
- [ ] **Plaintext fallback** generated and set on `text` field of Nodemailer message — spam filters dock HTML-only
- [ ] Subject < 60 chars, no spam triggers (no all-caps, no `$$$`, no `FREE!!`)
- [ ] Preview text (hidden first 90 chars) set explicitly — never let it fall back to "View this email in your browser…"
- [ ] No more than 3 links total
- [ ] No images larger than 100KB; all hosted on the Supabase Storage public bucket or a CDN
- [ ] `List-Unsubscribe` header for any marketing email (not needed for transactional)
- [ ] SPF + DKIM + DMARC configured on `steffnycouture.co.uk` DNS (set up at Phase 9)

## Plaintext Generation

Use `html-to-text` or similar in the Edge Function:

```ts
import { htmlToText } from 'npm:html-to-text@9.0.5';

const text = htmlToText(html, {
  wordwrap: 80,
  selectors: [
    { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
    { selector: 'img', format: 'skip' },
  ],
});

await transporter.sendMail({
  from: `"Steffny Couture" <${SMTP_FROM_EMAIL}>`,
  to: customer.email,
  replyTo: 'steffi@steffnycouture.co.uk',
  subject,
  html,
  text,
});
```

## Anti-Patterns

- ❌ `<style>` tags — email clients strip them. Inline only.
- ❌ Custom web fonts — use Fraunces/Inter with fallback to Georgia/system-sans. Many clients ignore web fonts anyway.
- ❌ Background images — Outlook desktop ignores. Use solid colours.
- ❌ Wide layouts — keep at 560px max. Mobile readers don't get horizontal scroll.
- ❌ Dark mode adaptive colours — Gmail/Outlook handle dark mode unpredictably. We set `color-scheme: light only`.
- ❌ Multiple primary CTAs — one button per email.
- ❌ Bare URLs in body — wrap in `<a>` even when the link text is the URL.
- ❌ Sending without preview text — Gmail will use the first sentence of body, which is rarely flattering.
- ❌ "Click here" — write the action.
- ❌ "Do not reply to this email" — we DO want replies. `reply-to` is a real human.

## Testing

- Use **react-email's dev server** locally: `npm run email` boots a preview at localhost:3000
- Send test emails to **Litmus** or **Email on Acid** before production (or at minimum: Gmail web, Gmail iOS, Outlook web, Apple Mail iOS — the four that matter)
- Verify dark mode renders acceptably even though we declared light-only
- Check the email source for any unintended client-injected styles

## When Adding a New Template

1. Create `emails/<Name>.tsx`
2. Use `EmailLayout` wrapper
3. Define typed Props
4. Follow the structure: heading → 1-2 paragraphs → info card → single CTA
5. Test render with `react-email dev`
6. Wire the trigger in `/supabase/functions/send-email/index.ts`
7. Add the SMTP from-name and from-address handling
8. Send a test to your own inbox before merging
