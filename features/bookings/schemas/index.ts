import { z } from 'zod';

import { type BookingDraft } from '@/features/bookings/types';

/**
 * Validation for the booking wizard. One schema per step; the wizard gates
 * "Next" on the relevant step's schema. Error copy follows the brand voice —
 * warm, brief, no exclamation marks (steffny-brand / react-hook-form-zod).
 */

/** UK mobile: `07…`, `447…` or `+447…` — eleven national digits. */
export const UK_PHONE_REGEX = /^(?:\+?44|0)7\d{9}$/;

// Step 1 — alteration type.
export const typeStepSchema = z.object({
  alterationTypeId: z.string().min(1, 'Choose what needs altering'),
});

// Step 3 — garment details. Doubles as the React Hook Form schema for the
// details screen.
export const detailsSchema = z.object({
  dressType: z.string().min(1, 'Pick a garment type'),
  description: z
    .string()
    .trim()
    .min(10, 'A little more detail helps Steffi prepare')
    .max(1000, 'Keep this under 1000 characters'),
  brand: z.string().trim().max(80, 'That brand name is too long').optional(),
  neededBy: z.string().nullable().optional(),
});
export type DetailsValues = z.infer<typeof detailsSchema>;

// Step 4 — appointment slot.
export const scheduleStepSchema = z.object({
  appointmentDate: z.string().min(1, 'Pick a date'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Pick a time'),
});

// Step 5 — contact. Doubles as the React Hook Form schema for the contact
// screen.
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Your name, please'),
  phone: z
    .string()
    .trim()
    .regex(UK_PHONE_REGEX, "That phone number doesn't look right"),
  email: z
    .string()
    .trim()
    .min(1, 'Email needed')
    .email("That email doesn't look right"),
  saveDetails: z.boolean(),
});
export type ContactValues = z.infer<typeof contactSchema>;

/** The six wizard steps, in order. `review` has no validation of its own. */
export type WizardStep =
  | 'type'
  | 'photos'
  | 'details'
  | 'schedule'
  | 'contact'
  | 'review';

/**
 * Steps that are not yet valid in the given draft. Drives the review screen —
 * an incomplete step shows a prompt to go back rather than a summary.
 */
export function incompleteSteps(draft: BookingDraft): WizardStep[] {
  const out: WizardStep[] = [];
  if (!typeStepSchema.safeParse(draft).success) out.push('type');
  if (!draft.photos.some((p) => p.status === 'uploaded')) out.push('photos');
  if (!detailsSchema.safeParse(draft).success) out.push('details');
  if (!scheduleStepSchema.safeParse(draft).success) out.push('schedule');
  if (!contactSchema.safeParse(draft).success) out.push('contact');
  return out;
}
