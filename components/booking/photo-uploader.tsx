import * as Crypto from 'expo-crypto';
import { Image } from 'expo-image';
import { Camera, ImageIcon, Plus, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';

import { Button, PressableScale, Sheet, Text } from '@/components/ui';
import { colors } from '@/constants/brand';
import { haptics } from '@/lib/haptics';

import {
  pickFromLibrary,
  takePhoto,
  uploadBookingPhoto,
  useBookingDraft,
  type DraftPhoto,
} from '@/features/bookings';

/** Most photos a single booking may carry (CLAUDE.md §3.2 step 2). */
const MAX_PHOTOS = 5;

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

/**
 * Multi-photo capture for the wizard's photos step. Each photo uploads to
 * Supabase Storage as soon as it is picked — the step never blocks on the
 * upload (booking-wizard skill). A failed upload retries once silently, then
 * offers a manual retry on the thumbnail.
 */
export function PhotoUploader() {
  const photos = useBookingDraft((s) => s.draft.photos);
  const bookingId = useBookingDraft((s) => s.draft.bookingId);
  const addPhoto = useBookingDraft((s) => s.addPhoto);
  const updatePhoto = useBookingDraft((s) => s.updatePhoto);
  const removePhoto = useBookingDraft((s) => s.removePhoto);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  const canAdd = photos.length < MAX_PHOTOS;

  async function runUpload(id: string, localUri: string): Promise<void> {
    try {
      const path = await uploadBookingPhoto(localUri, bookingId);
      updatePhoto(id, { status: 'uploaded', remotePath: path });
      return;
    } catch {
      // First attempt failed — retry once before surfacing an error.
    }
    try {
      const path = await uploadBookingPhoto(localUri, bookingId);
      updatePhoto(id, { status: 'uploaded', remotePath: path });
    } catch {
      updatePhoto(id, { status: 'error' });
    }
  }

  function addUris(uris: string[]): void {
    const room = MAX_PHOTOS - photos.length;
    uris.slice(0, room).forEach((uri) => {
      const id = Crypto.randomUUID();
      addPhoto({ id, localUri: uri, remotePath: null, status: 'uploading' });
      void runUpload(id, uri);
    });
  }

  async function onTakePhoto(): Promise<void> {
    setAddOpen(false);
    const uri = await takePhoto();
    if (uri) addUris([uri]);
  }

  async function onPickLibrary(): Promise<void> {
    setAddOpen(false);
    const uris = await pickFromLibrary(MAX_PHOTOS - photos.length);
    if (uris.length > 0) addUris(uris);
  }

  function onTilePress(photo: DraftPhoto): void {
    if (photo.status === 'uploaded') setViewerUri(photo.localUri);
    else if (photo.status === 'error') {
      updatePhoto(photo.id, { status: 'uploading' });
      void runUpload(photo.id, photo.localUri);
    }
  }

  function confirmDelete(): void {
    if (deleteId) removePhoto(deleteId);
    setDeleteId(null);
  }

  const tiles: (DraftPhoto | 'add')[] = canAdd ? [...photos, 'add'] : [...photos];

  return (
    <View className="gap-2">
      {chunk(tiles, 3).map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-2">
          {row.map((tile) =>
            tile === 'add' ? (
              <PressableScale
                key="add"
                haptic="selection"
                onPress={() => setAddOpen(true)}
                accessibilityLabel="Add a photo"
                className="aspect-square flex-1 items-center justify-center gap-1 rounded-xl border border-dashed border-borderStrong bg-surfaceAlt">
                <Plus size={22} color={colors.rose} strokeWidth={2} />
                <Text variant="caption" className="text-inkMuted">
                  Add
                </Text>
              </PressableScale>
            ) : (
              <PressableScale
                key={tile.id}
                haptic="selection"
                onPress={() => onTilePress(tile)}
                onLongPress={() => {
                  haptics.warning();
                  setDeleteId(tile.id);
                }}
                accessibilityLabel={`Garment photo. ${tile.status}. Long-press to remove.`}
                className="aspect-square flex-1 overflow-hidden rounded-xl border border-border bg-surfaceAlt">
                <Image
                  source={{ uri: tile.localUri }}
                  contentFit="cover"
                  style={{ width: '100%', height: '100%' }}
                />
                {tile.status === 'uploading' ? (
                  <View className="absolute inset-0 items-center justify-center bg-ink/35">
                    <ActivityIndicator color={colors.ivory} />
                  </View>
                ) : null}
                {tile.status === 'error' ? (
                  <View className="absolute inset-0 items-center justify-center gap-1 bg-ink/55">
                    <RefreshCw size={20} color={colors.ivory} strokeWidth={2} />
                    <Text variant="caption" className="text-ivory">
                      Retry
                    </Text>
                  </View>
                ) : null}
              </PressableScale>
            ),
          )}
          {/* Pad the final row so tiles keep their column width. */}
          {row.length < 3
            ? Array.from({ length: 3 - row.length }, (_, i) => (
                <View key={`pad-${i}`} className="aspect-square flex-1" />
              ))
            : null}
        </View>
      ))}

      <Text variant="caption" className="mt-1 text-inkSubtle">
        {photos.length}/{MAX_PHOTOS} photos
      </Text>

      <Sheet visible={addOpen} onClose={() => setAddOpen(false)} title="Add a photo">
        <View className="gap-2 pb-1">
          <Button
            label="Take a photo"
            variant="secondary"
            onPress={onTakePhoto}
            leftIcon={<Camera size={18} color={colors.ink} strokeWidth={2} />}
          />
          <Button
            label="Choose from library"
            variant="secondary"
            onPress={onPickLibrary}
            leftIcon={<ImageIcon size={18} color={colors.ink} strokeWidth={2} />}
          />
        </View>
      </Sheet>

      <Sheet
        visible={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Remove this photo?">
        <View className="gap-4 pb-1">
          <Text variant="body" className="text-inkMuted">
            You can add it again from your camera or library.
          </Text>
          <View className="gap-2">
            <Button label="Remove" variant="destructive" onPress={confirmDelete} />
            <Button
              label="Keep"
              variant="ghost"
              onPress={() => setDeleteId(null)}
            />
          </View>
        </View>
      </Sheet>

      <Modal
        visible={viewerUri !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setViewerUri(null)}>
        <Pressable
          className="flex-1 items-center justify-center bg-ink/95"
          onPress={() => setViewerUri(null)}
          accessibilityRole="button"
          accessibilityLabel="Close photo">
          {viewerUri ? (
            <Image
              source={{ uri: viewerUri }}
              contentFit="contain"
              style={{ width: '100%', height: '100%' }}
            />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}
