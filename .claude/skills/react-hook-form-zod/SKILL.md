---
name: react-hook-form-zod
description: Use this skill whenever building forms, validating user input, or handling form state in the Steffny Couture app. Fires for any file with React Hook Form imports, Zod schemas, or any form-heavy screen (booking wizard, login, settings, customer details). Enforces the form patterns, validation conventions, and error display rules used throughout the project.
---

# React Hook Form + Zod Conventions

## The Pairing

- **Zod** owns the schema (source of truth for shape + validation rules)
- **React Hook Form** owns the form state, dirty tracking, submission
- **`@hookform/resolvers/zod`** bridges them

## Standard Form Pattern

```ts
// features/auth/components/LoginForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@/components/ui';

const schema = z.object({
  email: z.string().email("That email doesn't look right"),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm({ onSubmit }: { onSubmit: (v: FormValues) => Promise<void> }) {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',           // validate on submit, not on every keystroke
    reValidateMode: 'onChange', // after first error, validate as they fix it
  });

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Input
            label="Password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
            secureTextEntry
          />
        )}
      />
      <Button onPress={handleSubmit(onSubmit)} loading={isSubmitting}>
        Sign in
      </Button>
    </>
  );
}
```

## The `Controller` Pattern (always use for RN)

React Native inputs aren't HTML inputs — RHF can't `register` them directly. Always wrap with `<Controller>`. Even for simple cases.

Don't `useController` + spread — `<Controller render={...}>` is clearer and matches the pattern used throughout the codebase.

## Validation Modes

| Mode | When to use |
|---|---|
| `mode: 'onSubmit'` | **Default**. Validate on submit only. Don't badger the user as they type. |
| `mode: 'onBlur'` | Long forms where blur-validation gives quick feedback per field |
| `mode: 'onChange'` | Rare — only when validation is critical mid-typing (e.g., password strength) |
| `reValidateMode: 'onChange'` | Always pair with `onSubmit` — once an error is shown, clear it as they fix it |

## Error Display Rules

- Error appears **inline below the field**, never as a toast
- Error text: `text-sm text-danger mt-1`
- Field border becomes `border-danger` while error is present
- Error icon (small `AlertCircle`) prefixes the error text
- Clear the error visually as soon as the field becomes valid (not on next submit)
- Error copy follows the brand voice (see `steffny-brand` skill):
  - ✅ "That email doesn't look right"
  - ❌ "Invalid email format!"
  - ❌ "Email is required"

## Common Schemas (reuse these)

```ts
// features/shared/schemas.ts
import { z } from 'zod';

export const ukPhone = z
  .string()
  .regex(/^(\+?44|0)7\d{9}$/, "That phone number doesn't look right");

export const email = z
  .string()
  .min(1, 'Email needed')
  .email("That email doesn't look right");

export const requiredName = z
  .string()
  .min(2, 'Your name please')
  .max(80);

export const password = z
  .string()
  .min(8, 'At least 8 characters');

export const ukPostcode = z
  .string()
  .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, "That postcode doesn't look right");

export const ukDateISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date');
```

Import these into feature-specific schemas — don't redefine validators.

## Multi-Step Forms (Booking Wizard Pattern)

For wizards, do NOT use a single `useForm` across steps — managing field arrays across screens via React Hook Form is painful. Instead:

1. **Zustand store** owns the cross-step draft (see `booking-wizard` skill)
2. **Each step has its own `useForm`** initialised from the store + saving to the store on validation
3. **Per-step Zod schema** picks the relevant fields from the master schema

```ts
// app/(customer)/book/contact.tsx
const stepSchema = bookingSchema.pick({ name: true, phone: true, email: true });
type StepValues = z.infer<typeof stepSchema>;

const draft = useBookingDraft();
const { control, handleSubmit, formState: { errors } } = useForm<StepValues>({
  resolver: zodResolver(stepSchema),
  defaultValues: {
    name: draft.draft.name,
    phone: draft.draft.phone,
    email: draft.draft.email,
  },
});

const onNext = (values: StepValues) => {
  draft.setField('name', values.name);
  draft.setField('phone', values.phone);
  draft.setField('email', values.email);
  router.push('/book/review');
};
```

This pattern means:
- Back-navigation preserves data (it's in Zustand, not in form state)
- Per-step validation is precise
- The master schema is reused for the final submission validation

## Input UX

- **Keyboard types** matched to field:
  - `keyboardType="email-address"` for email
  - `keyboardType="phone-pad"` for phone
  - `keyboardType="number-pad"` for numeric
  - `keyboardType="default"` for everything else
- **`autoCapitalize="none"`** for emails, passwords, usernames
- **`autoComplete`** set per field (`email`, `tel`, `name`, `password-new`, `password`)
- **`textContentType`** (iOS) for autofill (`emailAddress`, `telephoneNumber`, `givenName`)
- **`returnKeyType`** sequenced (`next`, `next`, `done`) and chain focuses
- **Auto-focus on first field** of forms entered via direct navigation; not on forms reached via tab change

## Async Validation

For cases where validation needs a server call (e.g., "is this email already in use"):

```ts
const schema = z.object({
  email: z.string().email().refine(
    async (email) => {
      const { data } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
      return !data;
    },
    { message: 'That email is already used' }
  ),
});
```

Use sparingly — async refines run on every validate. Better: validate sync, then let the server reject and translate the error in `onError`.

## Anti-Patterns

- ❌ **Bare RN inputs without `<Controller>`** — won't sync with RHF
- ❌ **`mode: 'onChange'`** by default — badgers the user
- ❌ **Toast errors for field validation** — must be inline
- ❌ **Re-defining validators in each form** — use `/features/shared/schemas.ts`
- ❌ **No `defaultValues`** — causes uncontrolled-to-controlled warning
- ❌ **Reading form state via `watch()` everywhere** — re-renders. Use `useWatch` selectively or rely on `formState.dirtyFields`.
- ❌ **Calling `setValue` and `trigger` manually instead of `handleSubmit`** — defeats the library
- ❌ **Disabling submit on `!isValid`** — instead, let them submit and show errors. Better UX: submit attempt teaches them what's wrong.
- ❌ **Single `useForm` for multi-step wizards** — use Zustand + per-step forms

## When Adding a New Form

1. Define schema in `/features/<feature>/schemas.ts` (or reuse from shared)
2. Build the form component with `Controller` for every field
3. Use the brand-voice error copy from `steffny-brand` skill
4. Set keyboard types, autocomplete, return-key chain
5. Handle submission errors in `onError` callback — translate server errors to user-friendly toasts
