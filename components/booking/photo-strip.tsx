import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';

type Props = {
  /** Local or remote image URIs to show as thumbnails. */
  uris: string[];
};

/** Read-only horizontal row of photo thumbnails — used on review screens. */
export function PhotoStrip({ uris }: Props) {
  if (uris.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2">
      {uris.map((uri, index) => (
        <View
          key={`${uri}-${index}`}
          className="h-20 w-20 overflow-hidden rounded-xl border border-border bg-surfaceAlt">
          <Image
            source={{ uri }}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
          />
        </View>
      ))}
    </ScrollView>
  );
}
