/**
 * Brand design tokens — the single source of truth for colour and type.
 * Mirrors `tailwind.config.js`; keep the two in sync. Components should prefer
 * NativeWind classes (`bg-rose`, `text-ink`) — these JS values exist for the
 * rare cases that need a raw colour string (e.g. native picker tint, status
 * bar, Lucide icon `color` props, Reanimated styles).
 */

export const colors = {
  // Backgrounds
  ivory: '#FAF7F2', // app background — warm cream
  surface: '#FFFFFF', // cards
  surfaceAlt: '#F4EFE8', // raised sections, input backgrounds

  // Brand
  rose: '#7C2D3E', // primary — deep burgundy rose (buttons, headers)
  roseDark: '#5A1F2C', // pressed state
  roseSoft: '#F2D9DE', // tonal backgrounds, status pills
  gold: '#C9A961', // secondary accent — champagne (highlights, badges)
  goldSoft: '#F5EBD2', // tonal

  // Text
  ink: '#1F1B1A', // primary text
  inkMuted: '#5C5551', // secondary text
  inkSubtle: '#9A9089', // tertiary text, hints

  // Functional
  success: '#3F6E4A', // muted forest green
  warning: '#B8741A', // amber
  danger: '#9B2C2C', // muted red
  info: '#3A5878', // muted blue

  // Borders
  border: '#E8E0D7',
  borderStrong: '#D4C8BA',
} as const;

export type ColourToken = keyof typeof colors;

/**
 * Font family names as registered by `@expo-google-fonts`. Each weight is a
 * distinct file — React Native does not synthesise weights from one family.
 */
export const fonts = {
  display: 'Fraunces_700Bold',
  displayMedium: 'Fraunces_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
} as const;

/** Type scale — size paired with line-height, from CLAUDE.md §3.2. */
export const typeScale = {
  xs: { size: 12, lineHeight: 16 },
  sm: { size: 14, lineHeight: 20 },
  base: { size: 16, lineHeight: 24 },
  lg: { size: 18, lineHeight: 26 },
  xl: { size: 22, lineHeight: 30 },
  '2xl': { size: 26, lineHeight: 34 },
  '3xl': { size: 32, lineHeight: 40 },
} as const;

/** Motion durations (ms) — see CLAUDE.md §3.5. */
export const motion = {
  micro: 200,
  default: 300,
  page: 500,
} as const;

/** Spring config for delight moments (success checks, drag, FAB appear). */
export const delightSpring = { damping: 18, stiffness: 180 } as const;

/** Spring config for press feedback (PressableScale). */
export const pressSpring = { damping: 14, stiffness: 280 } as const;
