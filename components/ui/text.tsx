import { Text as RNText, type TextProps } from 'react-native';

/**
 * Text variants — each pairs a size from the type scale with the correct
 * font family (CLAUDE.md §3.2). Fraunces for display, Inter for everything
 * else. Pass `className` to override colour or any other utility.
 */
const VARIANTS = {
  hero: 'text-3xl font-display text-ink', // page hero
  section: 'text-2xl font-display text-ink', // section header
  title: 'text-xl font-display-medium text-ink', // card title
  bodyLg: 'text-lg font-body-semibold text-ink', // emphasised body
  body: 'text-base font-body text-ink', // default body
  secondary: 'text-sm font-body text-inkMuted', // secondary text
  caption: 'text-xs font-body-medium tracking-wide text-inkSubtle', // captions, labels
} as const;

type Props = TextProps & {
  variant?: keyof typeof VARIANTS;
  className?: string;
};

export function Text({ variant = 'body', className, ...props }: Props) {
  return <RNText className={`${VARIANTS[variant]} ${className ?? ''}`} {...props} />;
}
