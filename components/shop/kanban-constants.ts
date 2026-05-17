import { type BookingStatus } from '@/components/ui';

/**
 * Kanban board geometry — shared by the board and its cards. Kept in its own
 * module so the card can read it without a circular import.
 *
 * The board has no cancelled column; a cancelled booking simply leaves it.
 */
export const KANBAN_STATUSES: BookingStatus[] = [
  'new',
  'confirmed',
  'in_progress',
  'ready',
  'collected',
];

/** Column width in px. */
export const COLUMN_WIDTH = 268;
/** Gap between columns in px. */
export const COLUMN_GAP = 12;
/** Horizontal padding inside the scrollable board in px. */
export const BOARD_PAD = 16;
