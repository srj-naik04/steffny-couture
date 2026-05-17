import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, useWindowDimensions, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, Text } from '@/components/ui';
import { colors } from '@/constants/brand';

type Props = {
  uris: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
};

const MAX_ZOOM = 4;

/** One zoomable, pannable page within the viewer. */
function ZoomablePage({
  uri,
  width,
  height,
  onZoomChange,
}: {
  uri: string;
  width: number;
  height: number;
  onZoomChange: (zoomed: boolean) => void;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const reset = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedX.value = 0;
    savedY.value = 0;
    runOnJS(onZoomChange)(false);
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(
        Math.max(savedScale.value * event.scale, 1),
        MAX_ZOOM,
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) reset();
      else runOnJS(onZoomChange)(true);
    });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value <= 1) return;
      translateX.value = savedX.value + event.translationX;
      translateY.value = savedY.value + event.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        reset();
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
        runOnJS(onZoomChange)(true);
      }
    });

  const gesture = Gesture.Exclusive(
    doubleTap,
    Gesture.Simultaneous(pinch, pan),
  );

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={{ width, height }}
        className="items-center justify-center">
        <Animated.View style={style}>
          <Image
            source={{ uri }}
            style={{ width, height }}
            contentFit="contain"
            transition={150}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

/**
 * Full-screen photo gallery — pinch or double-tap to zoom, drag to pan, swipe
 * between photos. Paging is suspended while a photo is zoomed so the pan
 * gesture isn't stolen by the pager (CLAUDE.md Phase 4 — full-screen viewer
 * with pinch zoom).
 */
export function PhotoViewer({ uris, initialIndex, visible, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [zoomed, setZoomed] = useState(false);
  const [index, setIndex] = useState(initialIndex);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      statusBarTranslucent>
      <GestureHandlerRootView className="flex-1 bg-ink">
        <FlatList
          data={uris}
          horizontal
          pagingEnabled
          scrollEnabled={!zoomed}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({
            length: width,
            offset: width * i,
            index: i,
          })}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          onMomentumScrollEnd={(event) =>
            setIndex(
              Math.round(event.nativeEvent.contentOffset.x / width),
            )
          }
          renderItem={({ item }) => (
            <ZoomablePage
              uri={item}
              width={width}
              height={height}
              onZoomChange={setZoomed}
            />
          )}
        />

        <View
          style={{ top: insets.top + 8 }}
          className="absolute left-4 right-4 flex-row items-center justify-between">
          {uris.length > 1 ? (
            <View className="rounded-full bg-ink/60 px-3 py-1">
              <Text variant="caption" className="text-ivory">
                {index + 1} / {uris.length}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <PressableScale
            haptic="selection"
            onPress={onClose}
            accessibilityLabel="Close photo viewer"
            className="h-10 w-10 items-center justify-center rounded-full bg-ink/60">
            <X size={20} color={colors.ivory} strokeWidth={2} />
          </PressableScale>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
