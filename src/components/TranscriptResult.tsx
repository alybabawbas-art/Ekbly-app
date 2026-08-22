import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Download, Trash2, PlusCircle } from 'lucide-react';

interface TranscriptResultProps {
  transcript: string;
  onChange: (newTranscript: string) => void;
  onReset: () => void;
  onClear: () => void;
}

export const TranscriptResult: React.FC<TranscriptResultProps> = ({
  transcript,
  onChange,
  onReset,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea according to content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(180, textareaRef.current.scrollHeight)}px`;
    }
  }, [transcript]);

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const handleDownloadTxt = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `ektbly-transcript-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const wordsCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charsCount = transcript.length;

  return (
    <section className="bg-white rounded-2xl border border-[#CFE8F7] shadow-sm flex flex-col p-6 overflow-hidden">
      {/* Top Header & Actions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#17324D] font-bold text-lg flex items-center gap-2 font-['Cairo',sans-serif]">
          <span className="w-2 h-2 bg-[#4EA8DE] rounded-full shrink-0"></span>
          <span>النص المكتوب</span>
          <span className="text-xs text-[#64748B] font-normal mr-2">
            ({wordsCount} كلمة • {charsCount} حرف)
          </span>
        </h2>

        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!transcript}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'text-[#4EA8DE] bg-[#EAF6FF] border-[#CFE8F7] hover:bg-[#d8edfc]'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
          </button>

          {/* Download TXT button */}
          <button
            type="button"
            onClick={handleDownloadTxt}
            disabled={!transcript}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              downloaded
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'text-[#4EA8DE] bg-[#EAF6FF] border-[#CFE8F7] hover:bg-[#d8edfc]'
            }`}
          >
            {downloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span>{downloaded ? 'تم التحميل' : 'تحميل TXT'}</span>
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={transcript}
        onChange={(e) => onChange(e.target.value)}
        placeholder="يظهر النص هنا بعد التحويل..."
        dir="rtl"
        className="w-full bg-[#F8FCFF] border border-[#CFE8F7] rounded-xl p-4 text-[#17324D] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#4EA8DE] focus:border-transparent min-h-[180px] font-['Tajawal',sans-serif] text-base sm:text-lg"
        aria-label="النص المكتوب"
      />

      {/* Footer bar */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#EAF6FF]">
        {showClearConfirm ? (
          <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
            <span className="text-xs text-red-600 font-medium">مسح النص؟</span>
            <button
              type="button"
              onClick={() => {
                onClear();
                setShowClearConfirm(false);
              }}
              className="px-2 py-0.5 bg-[#DC5A5A] text-white text-xs font-bold rounded cursor-pointer hover:bg-red-700"
            >
              تأكيد
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="px-2 py-0.5 text-gray-600 text-xs rounded hover:text-gray-900 cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={!transcript}
            className="text-[#64748B] text-sm hover:text-[#DC5A5A] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح النص</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="px-6 py-2 bg-[#17324D] hover:bg-[#12283e] text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تفريغ جديد</span>
        </button>
      </div>
    </section>
  );
};

