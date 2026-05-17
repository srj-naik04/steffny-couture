import { View, type ViewProps } from 'react-native';

/**
 * The plain layout primitive — a `View` that screens may import without
 * reaching into `react-native` directly. Use NativeWind `className` for all
 * styling. This is the future platform-abstraction seam for web.
 */
export function Box(props: ViewProps & { className?: string }) {
  return <View {...props} />;
}
