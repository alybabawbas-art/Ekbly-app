import React from 'react';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  return (
    <header className="text-center pt-2 mb-3 sm:mb-4 flex flex-col items-center justify-center">
      <div className="mb-2">
        <Logo className="h-16 sm:h-20 max-w-[280px] sm:max-w-[340px]" />
      </div>
      <p className="text-[#64748B] text-base sm:text-lg font-medium">
        حوّل صوتك العربي إلى نص مكتوب
      </p>
    </header>
  );
};

