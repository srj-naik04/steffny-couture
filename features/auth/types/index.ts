import { type Database } from '@/types/database';

/** A user profile row — extends `auth.users`, created by a DB trigger. */
export type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * The four-role model (plus `admin` break-glass) from the Phase 1 schema.
 * CLAUDE.md's original spec used a single `shop` role; the database shipped
 * this finer-grained model instead — see docs/DECISIONS.md.
 */
export type UserRole = 'customer' | 'tailor' | 'manager' | 'owner' | 'admin';

/** Roles that belong in the shop route group — mirrors the DB `is_staff()`. */
export const STAFF_ROLES: readonly UserRole[] = [
  'tailor',
  'manager',
  'owner',
  'admin',
];

/** True for any staff role; false for customers and unknown/absent roles. */
export function isStaffRole(role: string | null | undefined): boolean {
  return role != null && STAFF_ROLES.includes(role as UserRole);
}
