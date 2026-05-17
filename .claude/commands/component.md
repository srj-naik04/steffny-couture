---
description: Scaffold a new reusable component in /components/ui/ following project conventions.
argument-hint: <ComponentName> [variants if any]
---

# Scaffold Component: $1

Create a new component named **$1** in `/components/ui/$1.tsx` following these rules:

## Mandatory conventions
- TypeScript, strict typing
- Named export, no default export
- Function component, no `React.FC`
- Inline `type Props = { ... }` (not interface)
- NativeWind `className` for all styling — NO `StyleSheet`, NO inline `style` except for dynamic numeric values
- Forward `accessibilityLabel`, `accessibilityRole`, `testID` props
- Touch targets ≥ 44pt where interactive
- If pressable, wrap in `PressableScale` with appropriate haptic
- Respect `useReducedMotion()` for any animation
- Import only from `@/` aliases — no relative paths going up directories

## Brand rules (auto-load `steffny-brand` skill)
- Use brand colour tokens via Tailwind classes (`bg-rose`, `text-ink`, etc.)
- Use brand typography (`font-display` for Fraunces, `font-body` for Inter)
- No exclamation marks, no emoji in any default text props
- No hex codes inline

## Structure to follow
```tsx
import { type ComponentProps } from 'react';
import { /* primitives */ } from '@/components/ui';
import { cn } from '@/lib/cn';

type Props = ComponentProps<'view'> & {
  variant?: 'primary' | 'secondary';
  // ... typed, documented props
};

export function $1({ variant = 'primary', className, children, ...rest }: Props) {
  return (
    <View
      className={cn(
        'base-classes-here',
        variant === 'primary' && 'primary-classes',
        variant === 'secondary' && 'secondary-classes',
        className,
      )}
      accessibilityRole="..."
      {...rest}
    >
      {children}
    </View>
  );
}
```

## After scaffolding

1. Show me the file you created
2. List the variants/props you chose and why
3. Suggest where in the app this would first be used
4. Add an entry to `/components/ui/index.ts` re-exporting the component
5. Note any test cases worth adding (if the component has logic)
