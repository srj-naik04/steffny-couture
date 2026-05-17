import {
  CircleHelp,
  Heart,
  type LucideIcon,
  MoveHorizontal,
  Ruler,
  Scissors,
  Shirt,
  Sparkles,
  Zap,
} from 'lucide-react-native';

/**
 * Lucide icons referenced by `alteration_types.icon` (PascalCase names).
 * Shared by every surface that renders an alteration type — the wizard's
 * type cards and the booking cards/detail in "My bookings".
 */
const ICONS: Record<string, LucideIcon> = {
  Ruler,
  Scissors,
  MoveHorizontal,
  Shirt,
  Heart,
  Zap,
  Sparkles,
  CircleHelp,
};

/** Resolve an icon name to its component, falling back to a neutral glyph. */
export function alterationIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || CircleHelp;
}
