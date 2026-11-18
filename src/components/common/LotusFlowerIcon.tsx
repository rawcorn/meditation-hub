import React from 'react';

interface LotusFlowerIconProps {
  className?: string;
  size?: number;
}

/**
 * Minimalist Zen Lotus Flower Icon
 * Perfectly matching the app's clean line-art identity:
 * - Pure outline stroke in soft lavender (#C7B9FF)
 * - Rounded line joints and caps
 * - Central ascending petal + symmetrical side petals + calm water/lotus pad base
 */
export function LotusFlowerIcon({ className = '', size = 32 }: LotusFlowerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C7B9FF"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Central tall petal */}
      <path d="M12 3C10 7.5 10 13 12 17C14 13 14 7.5 12 3Z" />

      {/* Left inner petal */}
      <path d="M11 17C8 14.5 5 11 6.5 7.5C8.8 8.2 10.5 10.8 11.5 14" />

      {/* Right inner petal */}
      <path d="M13 17C16 14.5 19 11 17.5 7.5C15.2 8.2 13.5 10.8 12.5 14" />

      {/* Left outer low petal / water fold */}
      <path d="M10 17.5C6.5 17 3 14 3.5 11C5.5 11.5 8 13.5 9.5 16" />

      {/* Right outer low petal / water fold */}
      <path d="M14 17.5C17.5 17 21 14 20.5 11C18.5 11.5 16 13.5 14.5 16" />

      {/* Calm lotus base waterline */}
      <path d="M7 20.5C9 21.2 15 21.2 17 20.5" />
    </svg>
  );
}
