---
description: Create a new react-email template using the brand layout and conventions.
argument-hint: <TemplateName>
---

# New Email Template: $1

Create `/emails/$1.tsx` following the conventions in the `email-templates` skill.

## Required
- Wrap in `<EmailLayout preview="...">` from `/emails/components/EmailLayout`
- Define typed `Props` for the data the template accepts
- Subject line (suggest in a comment at top)
- Single primary CTA (one button only — secondary links can be small text)
- Plaintext-fallback-friendly (no critical content in images)
- Brand voice (`steffny-brand` skill): no exclamation marks, no emoji, British English, calm confident tone
- One Fraunces heading (`font-display`) as the hero line
- Inline-style-only — Tailwind classes through `@react-email/components` Tailwind wrapper

## Template

```tsx
import { Heading, Text, Section, Button } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { format, parseISO } from 'date-fns';

// Subject suggestion: "..."

type Props = {
  // ... typed inputs
};

export default function $1(props: Props) {
  return (
    <EmailLayout preview="...">
      <Heading className="font-display text-3xl text-ink m-0 mb-2">
        {/* hero line */}
      </Heading>
      <Text className="text-base text-inkMuted mt-0 mb-6">
        {/* 1-2 sentence body */}
      </Text>

      <Section className="bg-ivory rounded-xl p-5 my-2">
        {/* details */}
      </Section>

      <Button
        href={/* CTA link */}
        className="bg-rose text-ivory font-body font-medium text-base rounded-full px-6 py-3 no-underline"
      >
        {/* CTA label */}
      </Button>
    </EmailLayout>
  );
}
```

## After creating
1. Show the file
2. Wire it into `/supabase/functions/send-email/index.ts` (add the `type` case)
3. Suggest the trigger point (which mutation or DB trigger fires this)
4. Suggest a test invocation curl command for the Edge Function
5. Remind to render-test via `react-email dev` before shipping
