"use client";

export function HeroGoldenStreaks() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      <svg
        viewBox="0 0 1440 680"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full opacity-90"
      >
        <defs>
          {/* Main radiant gold linear gradient along streak path */}
          <linearGradient id="goldStreakGrad1" x1="0%" y1="40%" x2="100%" y2="60%">
            <stop offset="0%" stopColor="#c59b5f" stopOpacity="0" />
            <stop offset="15%" stopColor="#dfb37c" stopOpacity="0.6" />
            <stop offset="35%" stopColor="#fff2d1" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#d4af37" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#eed3a2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#9a7442" stopOpacity="0" />
          </linearGradient>

          {/* Secondary lower ribbon gradient */}
          <linearGradient id="goldStreakGrad2" x1="0%" y1="70%" x2="100%" y2="30%">
            <stop offset="0%" stopColor="#c59b5f" stopOpacity="0" />
            <stop offset="25%" stopColor="#f3ce8a" stopOpacity="0.75" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#c59b5f" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7a5528" stopOpacity="0" />
          </linearGradient>

          {/* Soft blur for outer atmospheric bloom */}
          <filter id="glowBlurWide" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="16" />
          </filter>

          {/* Medium blur for ribbon sheen */}
          <filter id="glowBlurMed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* --- STREAK 1: UPPER SWOOPING RIBBON (Weaves from left through triptych & behind headline) --- */}
        {/* Ambient bloom layer */}
        <path
          d="M -60 210 C 180 140, 360 170, 520 320 C 720 510, 1020 540, 1500 240"
          stroke="url(#goldStreakGrad1)"
          strokeWidth="28"
          strokeLinecap="round"
          filter="url(#glowBlurWide)"
          opacity="0.4"
        />
        {/* Inner glowing body */}
        <path
          d="M -60 210 C 180 140, 360 170, 520 320 C 720 510, 1020 540, 1500 240"
          stroke="url(#goldStreakGrad1)"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#glowBlurMed)"
          opacity="0.8"
        />
        {/* Ultra-crisp hot white-gold filament core */}
        <path
          d="M -60 210 C 180 140, 360 170, 520 320 C 720 510, 1020 540, 1500 240"
          stroke="url(#goldStreakGrad1)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* --- STREAK 2: PARALLEL TWIN ACCENT STREAK (Adds double-ribbon luxury depth) --- */}
        <path
          d="M -40 240 C 200 170, 380 195, 540 340 C 740 530, 1040 555, 1500 260"
          stroke="url(#goldStreakGrad1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* --- STREAK 3: LOWER SWOOPING RIBBON (Curves across bottom of triptych & rises under stats) --- */}
        {/* Ambient bloom */}
        <path
          d="M 280 540 C 450 460, 680 520, 880 430 C 1080 340, 1260 300, 1520 330"
          stroke="url(#goldStreakGrad2)"
          strokeWidth="22"
          strokeLinecap="round"
          filter="url(#glowBlurWide)"
          opacity="0.35"
        />
        {/* Inner glowing body */}
        <path
          d="M 280 540 C 450 460, 680 520, 880 430 C 1080 340, 1260 300, 1520 330"
          stroke="url(#goldStreakGrad2)"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#glowBlurMed)"
          opacity="0.75"
        />
        {/* Core filament */}
        <path
          d="M 280 540 C 450 460, 680 520, 880 430 C 1080 340, 1260 300, 1520 330"
          stroke="url(#goldStreakGrad2)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}
