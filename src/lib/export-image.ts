import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

/** Saves an already-captured image (a local file URI, see ExportScheduleButton's
 *  ViewShot ref) to the device's photo gallery. Only asks for the media-library
 *  permission at the moment of an actual save tap, and only if not already
 *  granted/denied — never on screen load. */
export async function saveImageToGallery(uri: string): Promise<void> {
  const existing = await MediaLibrary.getPermissionsAsync();
  let granted = existing.granted;
  if (!granted && existing.canAskAgain) {
    const requested = await MediaLibrary.requestPermissionsAsync();
    granted = requested.granted;
  }
  if (!granted) {
    throw new Error('Photo library permission was denied. Enable it in your device Settings to save images.');
  }
  await MediaLibrary.saveToLibraryAsync(uri);
}

/** Opens the OS share sheet for the image — no permission needed, always
 *  available as a fallback even if gallery access is denied. */
export async function shareImage(uri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(uri, { mimeType: 'image/png' });
}
