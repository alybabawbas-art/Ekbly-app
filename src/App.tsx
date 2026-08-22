import React, { useState, useRef } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Header } from './components/Header';
import { AudioRecorder } from './components/AudioRecorder';
import { AudioUploader } from './components/AudioUploader';
import { TranscriptResult } from './components/TranscriptResult';
import { Footer } from './components/Footer';
import { TabMode, AudioItem, TranscriptionState } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabMode>('record');
  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAudioItem, setLastAudioItem] = useState<AudioItem | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);

  // Helper to convert Blob to pure Base64 string
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1] || '';
          resolve(base64);
        } else {
          reject(new Error('فشل تحويل الملف الصوتي إلى صيغة مناسبة.'));
        }
      };
      reader.onerror = () => reject(new Error('حدث خطأ أثناء قراءة الملف الصوتي.'));
      reader.readAsDataURL(blob);
    });
  };

  const handleTranscribe = async (audio: AudioItem) => {
    setErrorMessage(null);
    setTranscriptionState('transcribing');
    setLastAudioItem(audio);

    try {
      const base64Data = await blobToBase64(audio.blob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64: base64Data,
          mimeType: audio.mimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'تعذر استخراج النص من الصوت. يرجى المحاولة مرة أخرى.');
      }

      const receivedText = data.transcript || '';
      setTranscript(receivedText);
      setTranscriptionState('success');

      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setTranscriptionState('error');
      setErrorMessage(
        err.message && typeof err.message === 'string' && !err.message.includes('object')
          ? err.message
          : 'حدث خطأ أثناء معالجة الصوت. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.'
      );
    }
  };

  const handleRetry = () => {
    if (lastAudioItem) {
      handleTranscribe(lastAudioItem);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setTranscriptionState('idle');
    setErrorMessage(null);
    setLastAudioItem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearTranscript = () => {
    setTranscript('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EAF6FF] text-[#17324D] font-['Tajawal',sans-serif]">
      <main className="w-full max-w-[840px] mx-auto px-4 py-8 flex-1 flex flex-col gap-6">
        {/* Header */}
        <Header />

        {/* Main Input Card with Geometric Balance styling */}
        <div className="bg-white rounded-2xl border border-[#CFE8F7] shadow-sm flex flex-col overflow-hidden">
          {/* Tab bar header */}
          <div className="flex bg-[#F8FCFF] border-b border-[#CFE8F7]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('record');
                setErrorMessage(null);
              }}
              disabled={transcriptionState === 'transcribing'}
              className={`flex-1 py-4 text-center font-bold transition-colors cursor-pointer ${
                activeTab === 'record'
                  ? 'text-[#4EA8DE] border-b-2 border-[#4EA8DE] bg-white'
                  : 'text-[#64748B] hover:bg-white hover:text-[#4EA8DE]'
              }`}
            >
              تسجيل صوتي
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                setErrorMessage(null);
              }}
              disabled={transcriptionState === 'transcribing'}
              className={`flex-1 py-4 text-center font-bold transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'text-[#4EA8DE] border-b-2 border-[#4EA8DE] bg-white'
                  : 'text-[#64748B] hover:bg-white hover:text-[#4EA8DE]'
              }`}
            >
              رفع ملف صوتي
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="p-6 sm:p-8">
            {activeTab === 'record' ? (
              <AudioRecorder
                onTranscribe={handleTranscribe}
                isTranscribing={transcriptionState === 'transcribing'}
              />
            ) : (
              <AudioUploader
                onTranscribe={handleTranscribe}
                isTranscribing={transcriptionState === 'transcribing'}
              />
            )}
          </div>
        </div>

        {/* Loading State Banner */}
        {transcriptionState === 'transcribing' && (
          <div className="bg-white rounded-2xl p-8 border border-[#CFE8F7] shadow-sm flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#EAF6FF] flex items-center justify-center text-[#4EA8DE]">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17324D]">
                جاري تحويل الصوت إلى نص...
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                نقوم بتحليل الصوت وتفريغ الكلمات العربية بدقة
              </p>
            </div>
          </div>
        )}

        {/* Error State Banner */}
        {transcriptionState === 'error' && errorMessage && (
          <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 text-right">
              <AlertCircle className="w-5 h-5 text-[#DC5A5A] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#DC5A5A]">حدث خطأ أثناء التفريغ</h3>
                <p className="text-xs text-[#17324D] mt-0.5">{errorMessage}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetry}
              className="px-5 py-2 rounded-xl bg-[#F8FCFF] hover:bg-[#CFE8F7] text-[#17324D] text-xs sm:text-sm font-bold border border-[#CFE8F7] flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#4EA8DE]" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        )}

        {/* Transcript Result Section */}
        <div ref={resultRef}>
          {(transcript || transcriptionState === 'success') && (
            <TranscriptResult
              transcript={transcript}
              onChange={setTranscript}
              onReset={handleReset}
              onClear={handleClearTranscript}
            />
          )}
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}

