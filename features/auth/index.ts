/** Public surface of the auth feature. Screens import from here. */
export { AuthProvider, useAuth } from '@/features/auth/hooks/use-auth';
export { useViewOverride } from '@/features/auth/hooks/use-view-override';
export {
  signIn,
  signOut,
  sendPasswordReset,
  updatePassword,
  signUpWithMagicLink,
} from '@/features/auth/api/auth-api';
export {
  signInSchema,
  resetRequestSchema,
  newPasswordSchema,
  type SignInValues,
  type ResetRequestValues,
  type NewPasswordValues,
} from '@/features/auth/schemas/auth-schemas';
export { isStaffRole, type Profile, type UserRole } from '@/features/auth/types';
