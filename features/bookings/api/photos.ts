import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

/**
 * Garment-photo capture and upload for the wizard's photos step.
 *
 * Photos upload to `booking-photos/bookings/<bookingId>/` as soon as they are
 * picked — the booking row need not exist yet, because storage RLS only
 * checks the path prefix (migration 004). The wizard generates the booking id
 * up front so photos land in their final home with no later move.
 */

const BUCKET = 'booking-photos';
/** Longest edge, in px, an uploaded photo is resized to. */
const MAX_EDGE = 1600;

/** Resize a picked image to keep uploads small; falls back to the original. */
async function compress(uri: string): Promise<string> {
  try {
    const result = await manipulateAsync(uri, [{ resize: { width: MAX_EDGE } }], {
      compress: 0.7,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } catch {
    // Manipulation is an optimisation, not a requirement — upload as-is.
    return uri;
  }
}

/** Launch the camera. Returns the photo URI, or `null` if cancelled/denied. */
export async function takePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

/**
 * Launch the photo library. Returns the picked URIs (up to `remaining`), or
 * an empty array if cancelled/denied.
 */
export async function pickFromLibrary(remaining: number): Promise<string[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return [];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsMultipleSelection: true,
    selectionLimit: remaining,
  });
  if (result.canceled) return [];
  return result.assets.map((asset) => asset.uri);
}

/**
 * Upload one photo to the booking's storage folder. Returns the object path
 * to persist on the booking's `photo_urls`.
 */
export async function uploadBookingPhoto(
  localUri: string,
  bookingId: string,
): Promise<string> {
  const uri = await compress(localUri);
  const arrayBuffer = await fetch(uri).then((response) => response.arrayBuffer());
  const path = `bookings/${bookingId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;
  return path;
}
