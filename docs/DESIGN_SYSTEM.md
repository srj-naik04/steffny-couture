# Design System

Visual reference for the Steffny Couture app. The canonical rules live in `.claude/skills/steffny-brand/SKILL.md` — this doc shows them in context with code snippets so you can copy and adapt.

For motion specifically, see `.claude/skills/motion-and-haptics/SKILL.md`.

## Colour Tokens

Defined in `/constants/brand.ts`. Surfaced as Tailwind classes via `tailwind.config.js`.

| Token | Hex | Tailwind | Used for |
|---|---|---|---|
| ivory | `#FAF7F2` | `bg-ivory` | Screen backgrounds |
| surface | `#FFFFFF` | `bg-surface` | Cards, modal interiors |
| surfaceAlt | `#F4EFE8` | `bg-surfaceAlt` | Inputs, raised sections |
| rose | `#7C2D3E` | `bg-rose`, `text-rose` | Primary action, focus rings |
| roseDark | `#5A1F2C` | `bg-roseDark` | Pressed state |
| roseSoft | `#F2D9DE` | `bg-roseSoft` | Status pills, tonal backgrounds |
| gold | `#C9A961` | `text-gold` | Premium markers (rare) |
| goldSoft | `#F5EBD2` | `bg-goldSoft` | Tonal gold backgrounds |
| ink | `#1F1B1A` | `text-ink` | Primary text |
| inkMuted | `#5C5551` | `text-inkMuted` | Secondary text |
| inkSubtle | `#9A9089` | `text-inkSubtle` | Tertiary text, hints |
| success | `#3F6E4A` | `text-success` | Confirmation states |
| warning | `#B8741A` | `text-warning` | Caution states |
| danger | `#9B2C2C` | `text-danger`, `bg-danger` | Errors, destructive |
| info | `#3A5878` | `text-info` | Informational |
| border | `#E8E0D7` | `border-border` | Default borders |
| borderStrong | `#D4C8BA` | `border-borderStrong` | Emphasised borders |

## Typography

```ts
// /constants/brand.ts
export const fonts = {
  display: 'Fraunces',   // 600, 700
  body: 'Inter',         // 400, 500, 600
} as const;
```

```ts
// /tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      display: ['Fraunces', 'Georgia', 'serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```

### Scale
```
text-3xl  32 / 40   font-display font-bold     Page hero
text-2xl  26 / 34   font-display font-bold     Section header
text-xl   22 / 30   font-display font-semibold Card title
text-lg   18 / 26   font-body    font-semibold Emphasised body
text-base 16 / 24   font-body                  Default body
text-sm   14 / 20   font-body                  Secondary
text-xs   12 / 16   font-body    font-medium   Captions, uppercase labels
```

## Component Recipes

### Primary Button
```tsx
<PressableScale haptic="medium" onPress={onPress}>
  <View className="bg-rose rounded-full px-6 py-3.5 items-center justify-center">
    <Text className="font-body font-medium text-ivory text-base">
      Confirm booking
    </Text>
  </View>
</PressableScale>
```

### Secondary Button
```tsx
<PressableScale haptic="selection" onPress={onPress}>
  <View className="bg-surface border border-borderStrong rounded-full px-6 py-3.5 items-center justify-center">
    <Text className="font-body font-medium text-ink text-base">
      Save for later
    </Text>
  </View>
</PressableScale>
```

### Destructive Button (inline)
```tsx
<PressableScale haptic="warning" onPress={onPress}>
  <View className="bg-surface border border-danger/30 rounded-full px-6 py-3.5 items-center justify-center">
    <Text className="font-body font-medium text-danger text-base">
      Cancel booking
    </Text>
  </View>
</PressableScale>
```

### Status Pill
```tsx
const variants = {
  new:         'bg-roseSoft text-rose',
  confirmed:   'bg-info/10  text-info',
  in_progress: 'bg-goldSoft text-warning',
  ready:       'bg-success/10 text-success',
  collected:   'bg-border   text-inkMuted',
  cancelled:   'bg-danger/10 text-danger',
};

<View className={`px-3 py-1 rounded-full ${variants[status]}`}>
  <Text className={`text-xs font-medium tracking-wide uppercase ${variants[status]}`}>
    {label}
  </Text>
</View>
```

### Card
```tsx
<View className="bg-surface border border-border rounded-2xl p-4">
  {/* content */}
</View>
```

### Input
```tsx
<View className="gap-1.5">
  <Text className="text-xs font-medium tracking-wide uppercase text-inkMuted">
    {label}
  </Text>
  <TextInput
    className={`bg-surfaceAlt rounded-xl px-4 py-3 text-base text-ink font-body
                ${error ? 'border border-danger' : 'border border-transparent'}`}
    placeholder={placeholder}
    placeholderTextColor="#9A9089"
    value={value}
    onChangeText={onChange}
  />
  {error && (
    <View className="flex-row items-center gap-1 mt-0.5">
      <AlertCircle size={14} color="#9B2C2C" />
      <Text className="text-sm text-danger">{error}</Text>
    </View>
  )}
</View>
```

### Empty State
```tsx
<View className="flex-1 items-center justify-center px-8 gap-4">
  <View className="w-16 h-16 rounded-full bg-roseSoft items-center justify-center">
    <Calendar size={28} color="#7C2D3E" strokeWidth={1.75} />
  </View>
  <Text className="font-display text-2xl text-ink text-center">
    No bookings yet
  </Text>
  <Text className="font-body text-base text-inkMuted text-center">
    When you book an alteration, it'll appear here.
  </Text>
  <PressableScale haptic="medium" onPress={onCta}>
    <View className="bg-rose rounded-full px-6 py-3 mt-2">
      <Text className="font-body font-medium text-ivory">
        Book an alteration
      </Text>
    </View>
  </PressableScale>
</View>
```

### Section Header
```tsx
<View className="flex-row items-baseline justify-between mb-3">
  <Text className="font-display text-2xl text-ink">
    Today
  </Text>
  <Text className="font-body text-sm text-inkMuted">
    {count} bookings
  </Text>
</View>
```

## Spacing Scale

NativeWind / Tailwind default scale, but stick to these increments:
- `gap-1` (4px) — tight icon + text pairings
- `gap-2` (8px) — within a tight component
- `gap-3` (12px) — list items
- `gap-4` (16px) — between sections within a card
- `gap-6` (24px) — between cards
- `gap-8` (32px) — major page sections

Outer screen padding: `px-5` (20px) on mobile.

## Radii

- `rounded-md` — small chips, badges (6px)
- `rounded-xl` — inputs, small cards (12px)
- `rounded-2xl` — cards, sheets, modal corners (16px)
- `rounded-full` — buttons, pills, status indicators

Hard rule: **no `rounded-sm`, no square corners on interactive elements**. Everything has at least a tiny radius.

## Shadows (paired with borders)

```tsx
// Subtle elevation
<View className="bg-surface border border-border rounded-2xl shadow-sm">

// Floating element (FAB, sheet header)
<View className="bg-surface border border-border rounded-2xl shadow-md">
```

Never shadows without a border in the same colour family — pure shadows look like Material Design.

## Icon Sizing

| Adjacent text | Icon size | Stroke |
|---|---|---|
| `text-xs` (12pt) | 14 | 2 |
| `text-sm` (14pt) | 16 | 2 |
| `text-base` (16pt) | 20 | 1.75 |
| `text-lg` (18pt) | 22 | 1.75 |
| `text-xl`+ (22pt+) | 24-28 | 1.75 |
| Standalone icon-only buttons | 24 in a 44pt touch target | 1.75 |

## Animation Defaults

Don't reach for custom timing. Use these:
- **Press**: scale to 0.97, spring `{damping:14, stiffness:280}`
- **Fade in**: 300ms `Easing.out(Easing.cubic)`
- **Slide up sheet**: 320ms
- **Page transition**: 450ms

See the motion skill for the full vocabulary.

## What Not to Do

- ❌ Pure black (`#000`) — use `text-ink` (`#1F1B1A`)
- ❌ Pure white text on `bg-rose` — use `text-ivory`
- ❌ Material ripple effects — use `PressableScale`
- ❌ Gradients on buttons — flat rose, that's the brand
- ❌ Drop shadows without paired borders
- ❌ More than two font families — Fraunces + Inter only
- ❌ Tailwind default colours like `red-500`, `blue-500` — only brand tokens
