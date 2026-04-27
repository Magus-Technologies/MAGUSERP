import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { storage, StorageKeys } from './storage';
import { API_BASE } from '../api/endpoints';

export async function downloadAndShare(
  path: string,
  filename: string,
  mimeType = 'application/pdf',
): Promise<void> {
  const token = await storage.get<string>(StorageKeys.AUTH_TOKEN);
  const url = `${API_BASE}${path}`;
  const localUri = (FileSystem.cacheDirectory ?? '') + filename;

  const { uri, status } = await FileSystem.downloadAsync(url, localUri, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      Accept: mimeType,
    },
  });

  if (status !== 200) {
    throw new Error(`Error al descargar el archivo (${status})`);
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Compartir archivos no está disponible en este dispositivo');
  }

  await Sharing.shareAsync(uri, { mimeType, dialogTitle: filename, UTI: mimeType });
}
