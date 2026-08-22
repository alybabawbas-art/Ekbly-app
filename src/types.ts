export type TabMode = 'record' | 'upload';

export type TranscriptionState = 'idle' | 'transcribing' | 'success' | 'error';

export interface AudioItem {
  blob: Blob;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  duration?: number;
}
