import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView } from 'react-native';

import { PhotoViewer } from '@/components/booking/photo-viewer';
import { PressableScale } from '@/components/ui';

type Props = {
  /** Signed, displayable photo URLs. */
  uris: string[];
};

/**
 * Tappable thumbnail strip for a booking's garment photos. Tapping a
 * thumbnail opens the full-screen pinch-zoom viewer at that photo.
 */
export function BookingPhotos({ uris }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (uris.length === 0) return null;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2">
        {uris.map((uri, index) => (
          <PressableScale
            key={`${uri}-${index}`}
            haptic="selection"
            onPress={() => setViewerIndex(index)}
            accessibilityLabel={`View photo ${index + 1} of ${uris.length}`}
            className="h-24 w-24 overflow-hidden rounded-xl border border-border bg-surfaceAlt">
            <Image
              source={{ uri }}
              contentFit="cover"
              transition={150}
              style={{ width: '100%', height: '100%' }}
            />
          </PressableScale>
        ))}
      </ScrollView>

      <PhotoViewer
        uris={uris}
        initialIndex={viewerIndex ?? 0}
        visible={viewerIndex !== null}
        onClose={() => setViewerIndex(null)}
      />
    </>
  );
}
