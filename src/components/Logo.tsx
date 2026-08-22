import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = 'h-16 sm:h-20' }) => {
  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`} dir="ltr">
      <svg
        viewBox="0 0 780 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto max-w-full drop-shadow-xs"
      >
        {/* Left Speech Bubble Icon */}
        <g id="speech-mic-bubble">
          {/* Main blue circle with speech pointer */}
          <path
            d="M 120 40 
               C 186.27 40 240 93.73 240 160 
               C 240 226.27 186.27 280 120 280 
               C 105.8 280 92.2 277.5 79.7 273.1 
               L 42 290 
               L 52.8 253.9 
               C 20.3 230.7 0 197.8 0 160 
               C 0 93.73 53.73 40 120 40 Z"
            fill="#38A2EB"
          />
          {/* Inner Mic Icon */}
          {/* Mic Capsule */}
          <rect
            x="96"
            y="92"
            width="48"
            height="86"
            rx="24"
            fill="#0F2B48"
            stroke="#FFFFFF"
            strokeWidth="10"
          />
          {/* Mic Cradle / Arc */}
          <path
            d="M 76 142 
               C 76 182 164 182 164 142"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          {/* Mic Stem & Base */}
          <path
            d="M 120 182 L 120 216 M 92 216 L 148 216"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </g>

        {/* Audio Wave Soundbars */}
        <g id="sound-waves" fill="#38A2EB">
          {/* Bar 1 */}
          <rect x="254" y="132" width="13" height="56" rx="6.5" />
          {/* Bar 2 */}
          <rect x="274" y="112" width="15" height="96" rx="7.5" />
          {/* Bar 3 */}
          <rect x="296" y="90" width="18" height="140" rx="9" />
          {/* Bar 4 */}
          <rect x="321" y="116" width="14" height="88" rx="7" />
          {/* Bar 5 */}
          <rect x="341" y="136" width="12" height="48" rx="6" />
        </g>

        {/* Document Icon */}
        <g id="document-icon">
          {/* Document Frame */}
          <rect
            x="320"
            y="65"
            width="170"
            height="210"
            rx="36"
            fill="#FFFFFF"
            stroke="#0F2B48"
            strokeWidth="16"
          />
          {/* Top Line */}
          <rect x="362" y="108" width="86" height="14" rx="7" fill="#0F2B48" />
          {/* Middle Line */}
          <rect x="362" y="142" width="86" height="14" rx="7" fill="#0F2B48" />
          {/* Bottom Blue Line */}
          <rect x="362" y="176" width="62" height="14" rx="7" fill="#38A2EB" />
          {/* Right vertical blue bookmark mark */}
          <path
            d="M 458 168 L 458 226"
            stroke="#38A2EB"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </g>

        {/* Brand Text 'EKBLY' */}
        <g id="brand-text-english">
          <text
            x="515"
            y="172"
            fill="#0F2B48"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="105"
            letterSpacing="-1"
          >
            EKBLY
          </text>
        </g>

        {/* Brand Text Arabic 'أكتبلي' */}
        <g id="brand-text-arabic">
          <text
            x="765"
            y="288"
            textAnchor="end"
            fill="#38A2EB"
            fontFamily="'Cairo', 'Tajawal', system-ui, sans-serif"
            fontWeight="900"
            fontSize="115"
            letterSpacing="0"
          >
            أكتبلي
          </text>
        </g>
      </svg>
    </div>
  );
};
