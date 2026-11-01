'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Check, Heart, Info } from 'lucide-react';

export function NotificationToast() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-8 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        let Icon = Info;
        let iconColor = 'text-[#B9D1FF]';
        let borderColor = 'border-[#30364A]';

        if (toast.type === 'reassure') {
          Icon = Heart;
          iconColor = 'text-[#C7B9FF]';
          borderColor = 'border-[#C7B9FF]/30';
        } else if (toast.type === 'success') {
          Icon = Check;
          iconColor = 'text-[#A8DCC9]';
          borderColor = 'border-[#A8DCC9]/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-[#111827]/95 border ${borderColor} backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)] text-xs text-[#F3F3FA] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 leading-relaxed">{toast.message}</div>
          </div>
        );
      })}
    </div>
  );
}
