import { Image } from 'expo-image';
import { type ReactNode } from 'react';
import { View } from 'react-native';

type Props = {
  children: ReactNode;
};

/**
 * Welcome-screen hero — a photograph of Steffi's couture work behind a rose
 * scrim, with the headline content layered on top. Replaces the flat colour
 * panel; the photo is from steffnycouture.co.uk (CLAUDE.md §3.1).
 *
 * The scrim keeps the ivory/gold text readable while letting the warmth of
 * the photograph through.
 */
export function WelcomeHero({ children }: Props) {
  return (
    <View className="mt-3 overflow-hidden rounded-3xl">
      <Image
        source={require('../../assets/images/hero.jpg')}
        contentFit="cover"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <View className="absolute inset-0 bg-rose/[0.66]" />
      <View className="gap-3 p-6">{children}</View>
    </View>
  );
}
