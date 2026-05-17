import { z } from 'zod';

/**
 * Validation schemas for the authentication forms — sign-in, password-reset
 * request, and setting a new password. Error copy follows the brand voice:
 * warm, brief, no exclamation marks (steffny-brand / react-hook-form-zod).
 */

const email = z
  .string()
  .min(1, 'Email needed')
  .email("That email doesn't look right");

// Sign-in: any non-empty password. We never restate the strength rules on a
// login form — that only helps an attacker and nags a legitimate user.
export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password needed'),
});
export type SignInValues = z.infer<typeof signInSchema>;

// Password-reset request: just an email to send the recovery link to.
export const resetRequestSchema = z.object({ email });
export type ResetRequestValues = z.infer<typeof resetRequestSchema>;

// Setting a new password after following the recovery link. Strength rules
// apply here, and the confirmation must match.
export const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Those passwords don't match",
    path: ['confirmPassword'],
  });
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
