/**
 * Alteration types — mirrors the `alteration_types` reference table
 * (CLAUDE.md §1.1). Seeded into Supabase in Phase 1; this constant lets the
 * app render the catalogue before the backend exists and stays the canonical
 * fallback. `icon` values are Lucide icon names (PascalCase).
 */

export type AlterationType = {
  id: string;
  label: string;
  description: string;
  estimatedMinPrice: number;
  estimatedMaxPrice: number;
  estimatedDays: number;
  /** Lucide icon name — see steffny-brand skill iconography. */
  icon: string;
  sortOrder: number;
};

export const ALTERATION_TYPES: readonly AlterationType[] = [
  {
    id: 'hem',
    label: 'Hem',
    description: 'Shorten or lengthen the hemline of a dress, skirt or trousers.',
    estimatedMinPrice: 15,
    estimatedMaxPrice: 45,
    estimatedDays: 5,
    icon: 'Ruler',
    sortOrder: 1,
  },
  {
    id: 'take_in',
    label: 'Take in',
    description: 'Bring a garment closer to the body for a more tailored fit.',
    estimatedMinPrice: 25,
    estimatedMaxPrice: 70,
    estimatedDays: 7,
    icon: 'Scissors',
    sortOrder: 2,
  },
  {
    id: 'take_out',
    label: 'Take out',
    description: 'Let out seams to give a garment a little more room.',
    estimatedMinPrice: 25,
    estimatedMaxPrice: 70,
    estimatedDays: 7,
    icon: 'MoveHorizontal',
    sortOrder: 3,
  },
  {
    id: 'sleeves',
    label: 'Sleeves',
    description: 'Shorten, lengthen or reshape sleeves.',
    estimatedMinPrice: 20,
    estimatedMaxPrice: 60,
    estimatedDays: 7,
    icon: 'Shirt',
    sortOrder: 4,
  },
  {
    id: 'bodice',
    label: 'Bodice',
    description: 'Reshape or restructure the bodice for fit and support.',
    estimatedMinPrice: 40,
    estimatedMaxPrice: 120,
    estimatedDays: 10,
    icon: 'Heart',
    sortOrder: 5,
  },
  {
    id: 'zipper',
    label: 'Zipper replacement',
    description: 'Replace a broken or worn zip.',
    estimatedMinPrice: 20,
    estimatedMaxPrice: 50,
    estimatedDays: 5,
    icon: 'Zap',
    sortOrder: 6,
  },
  {
    id: 'embellishment',
    label: 'Embellishment',
    description: 'Add or repair beading, lace or decorative detail.',
    estimatedMinPrice: 35,
    estimatedMaxPrice: 120,
    estimatedDays: 10,
    icon: 'Sparkles',
    sortOrder: 7,
  },
  {
    id: 'other',
    label: 'Something else',
    description: "Not sure which fits — describe it and Steffi will advise.",
    estimatedMinPrice: 15,
    estimatedMaxPrice: 120,
    estimatedDays: 7,
    icon: 'CircleHelp',
    sortOrder: 8,
  },
];

/** Garment types offered by the studio — used in the booking details step. */
export const DRESS_TYPES = [
  { id: 'wedding', label: 'Wedding' },
  { id: 'prom', label: 'Prom' },
  { id: 'evening', label: 'Evening gown' },
  { id: 'bridesmaid', label: 'Bridesmaid' },
  { id: 'birthday', label: '21st birthday' },
  { id: 'casual', label: 'Casual' },
  { id: 'other', label: 'Other' },
] as const;

export type DressTypeId = (typeof DRESS_TYPES)[number]['id'];
