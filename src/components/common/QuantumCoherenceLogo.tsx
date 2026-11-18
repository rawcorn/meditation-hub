import React from 'react';

interface QuantumCoherenceLogoProps {
  className?: string;
  size?: number;
}

/**
 * Minimalist Quantum Resonance / Coherence Logo:
 * - Built in the exact same line-art language as the app's category icons:
 *   Stroke: #C7B9FF, 1.75px width, round caps & joins.
 * - Shows two meditators in pure outline line-art sitting in serene contemplation.
 * - A clean outline heart in each chest.
 * - Pure resonant waves weaving between them, uniting their hearts in the quantum field.
 */
export function QuantumCoherenceLogo({
  className = '',
  size = 28,
}: QuantumCoherenceLogoProps) {
  return (
    <svg
      width={Math.round((size * 42) / 28)}
      height={size}
      viewBox="0 0 42 28"
      fill="none"
      stroke="#C7B9FF"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ========================================================
          MEDITATOR 1 (Left): Clean minimal line-art
          Head at (10, 6), Body/Shoulders, Lotus base at y=23
         ======================================================== */}
      {/* Head */}
      <circle cx="10" cy="6.5" r="3" />

      {/* Shoulders & Arms in Dhyana posture */}
      <path d="M4 21C4 16 6.5 12 10 12C13.5 12 16 16 16 21" />

      {/* Lotus legs base */}
      <path d="M2.5 24C5 22.5 15 22.5 17.5 24" />

      {/* Heart in chest */}
      <path
        d="M10 16.2C9.2 15.4 7.8 15.4 7.8 14.5C7.8 13.8 8.4 13.3 9.1 13.5C9.6 13.6 10 14.1 10 14.1C10 14.1 10.4 13.6 10.9 13.5C11.6 13.3 12.2 13.8 12.2 14.5C12.2 15.4 10.8 15.4 10 16.2Z"
        fill="#C7B9FF"
        fillOpacity="0.3"
      />

      {/* ========================================================
          MEDITATOR 2 (Right): Clean minimal line-art
          Head at (32, 6), Body/Shoulders, Lotus base at y=23
         ======================================================== */}
      {/* Head */}
      <circle cx="32" cy="6.5" r="3" />

      {/* Shoulders & Arms in Dhyana posture */}
      <path d="M26 21C26 16 28.5 12 32 12C35.5 12 38 16 38 21" />

      {/* Lotus legs base */}
      <path d="M24.5 24C27 22.5 37 22.5 39.5 24" />

      {/* Heart in chest */}
      <path
        d="M32 16.2C31.2 15.4 29.8 15.4 29.8 14.5C29.8 13.8 30.4 13.3 31.1 13.5C31.6 13.6 32 14.1 32 14.1C32 14.1 32.4 13.6 32.9 13.5C33.6 13.3 34.2 13.8 34.2 14.5C34.2 15.4 32.8 15.4 32 16.2Z"
        fill="#C7B9FF"
        fillOpacity="0.3"
      />

      {/* ========================================================
          QUANTUM RESONANCE FIELD WAVES (Connecting Both Hearts)
          Pure wavy lines like the water wave category icon
         ======================================================== */}
      {/* Upper wave */}
      <path d="M14 13.5C17.5 11.5 24.5 11.5 28 13.5" strokeOpacity="0.5" strokeDasharray="1.5 2" />

      {/* Central direct resonant harmonic connection */}
      <path d="M13.5 15C16 13.8 18.5 16.2 21 15C23.5 13.8 26 16.2 28.5 15" strokeWidth="1.8" />

      {/* Lower wave */}
      <path d="M14 16.5C17.5 18.5 24.5 18.5 28 16.5" strokeOpacity="0.5" strokeDasharray="1.5 2" />
    </svg>
  );
}
