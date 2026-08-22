import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Trash2, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { AudioItem } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface AudioUploaderProps {
  onTranscribe: (audio: AudioItem) => void;
  isTranscribing: boolean;
  disabled?: boolean;
}

const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/m4a',
  'audio/mp4',
  'audio/x-m4a',
  'audio/ogg',
  'audio/webm',
  'audio/aac',
  'audio/flac',
];

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.aac', '.flac'];

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onTranscribe,
  isTranscribing,
  disabled = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [audioItem, setAudioItem] = useState<AudioItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
  };

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `حجم الملف (${formatFileSize(file.size)}) يتجاوز الحد الأقصى المسموح به (${MAX_FILE_SIZE_MB} ميجابايت). يرجى اختيار ملف أصغر.`
      );
      return;
    }

    // Validate extension & mime
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isExtensionValid = ALLOWED_EXTENSIONS.includes(ext);
    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type) || file.type.startsWith('audio/');

    if (!isExtensionValid && !isMimeValid) {
      setErrorMessage('صيغة الملف غير مدعومة. الصيغ المدعومة هي: MP3, WAV, M4A, OGG, WebM, AAC.');
      return;
    }

    // Revoke previous URL if any
    if (audioItem?.url) {
      URL.revokeObjectURL(audioItem.url);
    }

    const finalMime = file.type || (ext === '.mp3' ? 'audio/mp3' : ext === '.wav' ? 'audio/wav' : ext === '.m4a' ? 'audio/m4a' : 'audio/webm');
    const audioUrl = URL.createObjectURL(file);

    setAudioItem({
      blob: file,
      url: audioUrl,
      name: file.name,
      size: file.size,
      mimeType: finalMime,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isTranscribing) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (disabled || isTranscribing) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveFile = () => {
    if (audioItem?.url) {
      URL.revokeObjectURL(audioItem.url);
    }
    setAudioItem(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error notification */}
      {errorMessage && (
        <div className="w-full mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-[#DC5A5A] text-sm flex items-start gap-3 text-right">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Zone when no file is selected */}
      {!audioItem ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
            dragOver
              ? 'border-[#4EA8DE] bg-[#EAF6FF]/80 scale-[0.99]'
              : 'border-[#CFE8F7] hover:border-[#4EA8DE] bg-[#F8FCFF] hover:bg-[#F3F9FD]'
          }`}
        >
          <div className="w-20 h-20 rounded-full bg-[#EAF6FF] border-4 border-[#CFE8F7] text-[#4EA8DE] flex items-center justify-center mb-1">
            <UploadCloud className="w-10 h-10" />
          </div>

          <div>
            <p className="font-bold text-base text-[#17324D] mb-1">
              اسحب وأفلت الملف الصوتي هنا، أو <span className="text-[#4EA8DE] underline underline-offset-4">تصفح جهازك</span>
            </p>
            <p className="text-xs text-[#64748B]">
              الصيغ المدعومة: MP3, WAV, M4A, OGG, WebM (الحد الأقصى {MAX_FILE_SIZE_MB} ميجابايت)
            </p>
          </div>
        </div>
      ) : (
        /* Selected file card */
        <div className="w-full flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[#EAF6FF] border-4 border-[#CFE8F7] text-[#4EA8DE] flex items-center justify-center mb-4">
            <FileAudio className="w-10 h-10" />
          </div>

          <div className="text-center mb-4 max-w-md">
            <p className="font-bold text-[#17324D] text-base truncate" title={audioItem.name}>
              {audioItem.name}
            </p>
            <p className="text-xs font-mono text-[#64748B] mt-0.5">
              {formatFileSize(audioItem.size)}
            </p>
          </div>

          {/* Audio preview player */}
          <div className="w-full max-w-md mb-6">
            <AudioPlayer src={audioItem.url} />
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onTranscribe(audioItem)}
              disabled={isTranscribing}
              className="px-8 py-3 bg-[#4EA8DE] text-white rounded-xl font-bold shadow-md hover:bg-[#3498C9] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>تحويل إلى نص</span>
            </button>

            <button
              type="button"
              onClick={handleReplaceClick}
              disabled={isTranscribing}
              className="px-6 py-3 bg-white border-2 border-[#CFE8F7] text-[#17324D] rounded-xl font-medium hover:bg-[#F8FCFF] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 text-[#64748B]" />
              <span>تغيير الملف</span>
            </button>

            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={isTranscribing}
              className="px-6 py-3 bg-[#F8FCFF] text-[#DC5A5A] rounded-xl font-medium border border-transparent hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

