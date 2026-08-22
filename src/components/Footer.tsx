import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 text-xs border-t border-[#CFE8F7] pt-4 pb-6 w-full text-center max-w-lg mx-auto flex flex-col gap-1.5 text-[#64748B]">
      <p className="font-semibold text-sm text-[#17324D]">
        EKBLY — تحويل الصوت إلى نص
      </p>
      <p className="text-xs text-[#64748B]">
        حقوق النسخ محفوظة لـ &ldquo;علي بدوي علي&rdquo; طلاب سفراء الذكاء الاصطناعي
      </p>
    </footer>
  );
};

