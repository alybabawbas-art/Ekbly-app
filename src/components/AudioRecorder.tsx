import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play, Trash2, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';
import { AudioItem } from '../types';
import { AudioWaveform } from './AudioWaveform';
import { AudioPlayer } from './AudioPlayer';

interface AudioRecorderProps {
  onTranscribe: (audio: AudioItem) => void;
  isTranscribing: boolean;
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscribe,
  isTranscribing,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioItem, setAudioItem] = useState<AudioItem | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioItem?.url) {
        URL.revokeObjectURL(audioItem.url);
      }
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    setPermissionError(null);
    try {
      if (audioItem?.url) {
        URL.revokeObjectURL(audioItem.url);
        setAudioItem(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav',
      ];
      const selectedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioItem({
          blob: audioBlob,
          url: audioUrl,
          name: `تسجيل-${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.webm`,
          size: audioBlob.size,
          mimeType: finalMime,
          duration: recordingDuration,
        });

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);
      startTimer();
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('تم رفض إذن الوصول إلى الميكروفون. يرجى السماح بالوصول من إعدادات المتصفح.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('لم يتم العثور على ميكروفون متصل بجهازك.');
      } else {
        setPermissionError('تعذر بدء التسجيل الصوتي. يرجى التحقق من أذونات المتصفح.');
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  const handleDeleteRecording = () => {
    if (audioItem?.url) {
      URL.revokeObjectURL(audioItem.url);
    }
    setAudioItem(null);
    setRecordingDuration(0);
  };

  const handleReRecord = () => {
    handleDeleteRecording();
    startRecording();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Permission Error */}
      {permissionError && (
        <div className="w-full mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-[#DC5A5A] text-sm flex items-start gap-3 text-right">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{permissionError}</p>
            <p className="text-xs text-red-700/80 mt-1">
              انقر على رمز القفل أو الميكروفون بجوار شريط العنوان في متصفحك وفعّل إذن الميكروفون.
            </p>
          </div>
        </div>
      )}

      {/* STATE 1: Initial idle state */}
      {!isRecording && !audioItem && (
        <div className="flex flex-col items-center text-center my-2">
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled || isTranscribing}
            className="w-24 h-24 rounded-full bg-[#EAF6FF] border-4 border-[#CFE8F7] hover:border-[#4EA8DE] hover:bg-[#d8edfc] active:scale-95 text-[#4EA8DE] flex items-center justify-center mb-4 relative transition-all focus:outline-none focus:ring-4 focus:ring-[#4EA8DE]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="ابدأ تسجيل الصوت"
          >
            <Mic className="w-11 h-11 transition-transform hover:scale-110" />
          </button>
          <div className="text-2xl font-mono text-[#17324D] mb-3">00:00</div>
          <p className="text-sm font-medium text-[#64748B]">انقر على الميكروفون للبدء في التسجيل</p>
        </div>
      )}

      {/* STATE 2: Recording in progress */}
      {isRecording && (
        <div className="w-full flex flex-col items-center">
          {/* Active recording circle */}
          <div className="w-24 h-24 rounded-full bg-[#EAF6FF] border-4 border-[#CFE8F7] flex items-center justify-center mb-3 relative">
            <div className="w-4 h-4 bg-[#DC5A5A] rounded-full animate-pulse absolute -top-1 -right-1 border-2 border-white" />
            <Mic className="w-11 h-11 text-[#4EA8DE]" />
          </div>

          {/* Timer */}
          <div className="text-2xl font-mono font-bold text-[#17324D] mb-4">
            {formatTimer(recordingDuration)}
          </div>

          {/* Live Waveform */}
          <div className="w-full max-w-md mb-6">
            <AudioWaveform
              stream={streamRef.current}
              isRecording={isRecording}
              isPaused={isPaused}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isPaused ? (
              <button
                type="button"
                onClick={resumeRecording}
                className="px-6 py-3 bg-white border-2 border-[#CFE8F7] hover:bg-[#F8FCFF] text-[#17324D] rounded-xl font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-[#4EA8DE]" />
                <span>استئناف</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseRecording}
                className="px-6 py-3 bg-white border-2 border-[#CFE8F7] hover:bg-[#F8FCFF] text-[#17324D] rounded-xl font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Pause className="w-4 h-4 text-[#64748B]" />
                <span>إيقاف مؤقت</span>
              </button>
            )}

            <button
              type="button"
              onClick={stopRecording}
              className="px-8 py-3 bg-[#DC5A5A] hover:bg-[#C94747] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>إنهاء التسجيل</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: Recorded audio ready */}
      {!isRecording && audioItem && (
        <div className="w-full flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#EAF6FF] border-4 border-[#CFE8F7] flex items-center justify-center mb-3 relative">
            <Mic className="w-11 h-11 text-[#4EA8DE]" />
          </div>

          <div className="text-2xl font-mono font-bold text-[#17324D] mb-4">
            {formatTimer(audioItem.duration || recordingDuration)}
          </div>

          <div className="w-full max-w-md mb-6">
            <AudioPlayer src={audioItem.url} title={audioItem.name} />
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
              onClick={handleReRecord}
              disabled={isTranscribing}
              className="px-6 py-3 bg-white border-2 border-[#CFE8F7] text-[#17324D] rounded-xl font-medium hover:bg-[#F8FCFF] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 text-[#64748B]" />
              <span>إعادة التسجيل</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteRecording}
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

