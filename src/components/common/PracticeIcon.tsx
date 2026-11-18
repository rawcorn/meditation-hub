import React from 'react';

interface PracticeIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Minimalist Practice Icon:
 * - A meditator in serene contemplation with clear, balanced proportions.
 * - Prominent heart symbol in the chest matching the logo's aesthetic.
 * - Perfectly aligned to 24x24 viewBox for maximum clarity and visibility.
 */
export function PracticeIcon({
  className = '',
  size = 20,
  strokeWidth = 1.75,
}: PracticeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Head in calm presence */}
      <circle cx="12" cy="5.5" r="3" />

      {/* Shoulders & meditative torso */}
      <path d="M5.5 18C5.5 13.5 8 10.5 12 10.5C16 10.5 18.5 13.5 18.5 18" />

      {/* Lotus / crossed legs grounding base */}
      <path d="M3.5 21C6 19.5 18 19.5 20.5 21" />

      {/* Prominent heart in the chest */}
      <path
        d="M12 16.5C11.1 15.6 9.6 15.6 9.6 14.6C9.6 13.8 10.3 13.3 11 13.5C11.5 13.6 12 14.1 12 14.1C12 14.1 12.5 13.6 13 13.5C13.7 13.3 14.4 13.8 14.4 14.6C14.4 15.6 12.9 15.6 12 16.5Z"
        fill="currentColor"
        fillOpacity="0.4"
        strokeWidth="1.2"
      />
    </svg>
  );
}
