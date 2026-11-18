'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { IntentionCategory, SessionType } from '@/types';
import {
  Calendar,
  Check,
  Clock,
  Globe,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useIsMounted } from '@/lib/useIsMounted';

const CATEGORIES: IntentionCategory[] = [
  'Physical',
  'Mental & Emotional',
  'Love & Relationships',
  'Financial',
  'World',
  'Other',
];

export function CreateIntentionModal() {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createIntention,
    setSelectedDetailIntention,
    t,
    tCategory,
    language,
  } = useApp();

  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IntentionCategory>('Physical');
  const [description, setDescription] = useState('');
  const [visualizationPrompt, setVisualizationPrompt] = useState('');

  // Image handling: Upload photo
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // All intentions are scheduled encounters
  const sessionType: SessionType = 'scheduled';

  const isMounted = useIsMounted();

  // Interactive Calendar Selection for Scheduled Session
  const localTimezone = useMemo(() => {
    if (!isMounted) return 'UTC';
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, [isMounted]);

  const availableDays = useMemo(() => {
    if (!isMounted) return [];
    const days: { dateStr: string; dayName: string; dayNum: number; monthName: string; isToday: boolean }[] = [];
    const now = new Date();
    const localeStr = language === 'es' ? 'es-ES' : 'en-US';
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayName: d.toLocaleDateString(localeStr, { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString(localeStr, { month: 'short' }),
        isToday: i === 0,
      });
    }
    return days;
  }, [isMounted, language]);

  const [customSelectedDay, setCustomSelectedDay] = useState<string>('');
  const selectedDayStr = customSelectedDay || (availableDays[1]?.dateStr || availableDays[0]?.dateStr || '');
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>('18:00');
  const [isCustomTimeActive, setIsCustomTimeActive] = useState(false);

  // Parse current hour and minute for the custom time picker
  const currentHour = selectedTimeStr.includes(':') ? selectedTimeStr.split(':')[0] : '18';
  const currentMinute = selectedTimeStr.includes(':') ? selectedTimeStr.split(':')[1] : '00';

  const setCustomHour = (newHour: string) => {
    setSelectedTimeStr(`${newHour.padStart(2, '0')}:${currentMinute}`);
    setIsCustomTimeActive(true);
  };

  const setCustomMinute = (newMin: string) => {
    setSelectedTimeStr(`${currentHour}:${newMin.padStart(2, '0')}`);
    setIsCustomTimeActive(true);
  };

  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isCreateModalOpen) return null;

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedPhoto = () => {
    setUploadedPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!recipient.trim()) errs.recipient = 'Please enter who this space is for (e.g., Mom, Friend, Myself).';
    if (!title.trim()) errs.title = 'Please provide an intention title.';
    if (!description.trim()) errs.description = 'Please describe the intention or circumstance.';
    if (sessionType === 'scheduled') {
      if (!selectedDayStr || !selectedTimeStr) {
        errs.scheduled = 'Please select a date and time square for the collective encounter.';
      }
    }
    if (!consentConfirmed) {
      errs.consent = 'Please confirm consent and respectful intention.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const imgToUse = uploadedPhotoUrl || undefined;

    let scheduledAtIso: string | undefined = undefined;
    if (sessionType === 'scheduled') {
      // Build ISO string in user's local timezone
      const [hours, minutes] = selectedTimeStr.split(':').map(Number);
      const [year, month, day] = selectedDayStr.split('-').map(Number);
      const localScheduledDate = new Date(year, month - 1, day, hours, minutes, 0);
      scheduledAtIso = localScheduledDate.toISOString();
    }

    const newIntention = createIntention({
      recipient,
      title,
      category,
      description,
      visualizationPrompt,
      imageUrl: imgToUse,
      sessionType,
      scheduledAt: scheduledAtIso,
    });

    setIsCreateModalOpen(false);
    setSelectedDetailIntention(newIntention);

    // Reset form
    setRecipient('');
    setTitle('');
    setDescription('');
    setVisualizationPrompt('');
    setUploadedPhotoUrl(null);
    setErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#080B15]/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div className="min-h-full flex items-start justify-center p-3 sm:p-6 py-6 sm:py-10">
        <div className="relative w-full max-w-2xl bg-[#111827] border border-[#30364A] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#F3F3FA] my-auto">
          {/* Close Button */}
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="absolute right-5 top-5 text-[#64708D] hover:text-[#F3F3FA] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header - Always Visible at the top */}
          <div className="mb-6 pt-1">
            <h2 id="modal-headline" className="text-xl sm:text-2xl font-light tracking-tight text-[#F3F3FA]">
              {t('create.modalTitle')}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B1C8]">
              {t('create.modalSubtitle')}
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                {t('create.recipientLabel')} <span className="text-[#C7B9FF]">*</span>
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={t('create.recipientPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/60 text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none transition-colors"
              />
              {errors.recipient && <p className="text-xs text-[#FFB9D2] mt-1">{errors.recipient}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                {t('create.titleLabel')} <span className="text-[#C7B9FF]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('create.titlePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/60 text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none transition-colors"
              />
              {errors.title && <p className="text-xs text-[#FFB9D2] mt-1">{errors.title}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                {t('create.categoryLabel')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IntentionCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/60 text-xs sm:text-sm text-[#F3F3FA] focus:outline-none transition-colors cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#151B29] text-[#F3F3FA]">
                    {tCategory(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                {t('create.descriptionLabel')} <span className="text-[#C7B9FF]">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('create.descriptionPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/60 text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none transition-colors resize-none"
              />
              {errors.description && <p className="text-xs text-[#FFB9D2] mt-1">{errors.description}</p>}
            </div>

            {/* Visualization Prompt */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                {t('create.visualizationLabel')}
              </label>
              <textarea
                rows={2}
                value={visualizationPrompt}
                onChange={(e) => setVisualizationPrompt(e.target.value)}
                placeholder={t('create.visualizationPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/60 text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Imagery: Upload Photo (Optional) */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-2">
                {t('create.photoLabel')}
              </label>

              {/* Photo Upload Option */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="intention-photo-upload"
                />

                {uploadedPhotoUrl ? (
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#151B29] border border-[#C7B9FF]/50 shadow-sm">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#C7B9FF]/40 shrink-0">
                      <Image src={uploadedPhotoUrl} alt="Uploaded Photo" fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-[#F3F3FA] block">
                        {language === 'es' ? 'Foto añadida' : 'Photo added'}
                      </span>
                      <span className="text-[11px] text-[#A8B1C8]">
                        {language === 'es' ? 'Tu foto personal está lista para esta intención.' : 'Your personal photo is ready for this intention.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeUploadedPhoto}
                      className="px-3 py-1.5 rounded-full text-xs text-[#FFB9D2] hover:bg-[#FFB9D2]/10 transition-colors cursor-pointer"
                    >
                      {t('create.removePhoto')}
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="intention-photo-upload"
                    className="flex items-center justify-center gap-2 w-full p-3.5 rounded-2xl bg-[#151B29] hover:bg-[#1b233a] border border-dashed border-[#3e4a6b] hover:border-[#C7B9FF]/60 transition-all cursor-pointer text-xs text-[#C7B9FF] group"
                  >
                    <Upload className="w-4 h-4 text-[#C7B9FF] group-hover:scale-110 transition-transform" />
                    <span>{t('create.uploadPhoto')}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Group Meditation Encounter Schedule (Every intention proposes a synchronous time) */}
            <div className="p-4 rounded-2xl bg-[#151B29]/90 border border-[#242c40] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242c40]/80 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#C7B9FF]">
                    <Calendar className="w-4 h-4 text-[#C7B9FF]" />
                    <span>{language === 'es' ? 'Horario de la sesión grupal' : 'Group Session Time'}</span>
                  </div>
                  <p className="text-[11px] text-[#64708D] mt-0.5">
                    {language === 'es'
                      ? 'Elige un día y hora para meditar en grupo. Los miembros podrán sumarse en cualquier momento.'
                      : 'Choose a Day & Time for a group meditation. People can always join and support your intention anytime.'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#B9D1FF] bg-[#111827] px-2.5 py-1 rounded-full border border-[#242c40] shrink-0 self-start sm:self-auto">
                  <Globe className="w-3 h-3 text-[#B9D1FF]" />
                  <span>
                    {language === 'es' ? `Tu zona horaria: ${localTimezone}` : `Your Time Zone: ${localTimezone}`}
                  </span>
                </div>
              </div>

              {/* Calendar Day Squares Grid (Horizontally scrollable with beautiful cards) */}
              <div>
                <span className="text-[11px] text-[#A8B1C8] block mb-2 font-medium">
                  {language === 'es' ? '1. Elegir fecha' : '1. Choose Date'}
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {availableDays.map((dayItem) => {
                    const isSelected = selectedDayStr === dayItem.dateStr;
                    return (
                      <button
                        type="button"
                        key={dayItem.dateStr}
                        onClick={() => setCustomSelectedDay(dayItem.dateStr)}
                        className={`flex flex-col items-center justify-center min-w-[62px] h-[72px] rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#1b233a] to-[#252f4c] border-[#C7B9FF] shadow-[0_0_12px_rgba(199,185,255,0.25)] text-[#F3F3FA]'
                            : 'bg-[#111827] border-[#242c40] text-[#A8B1C8] hover:border-[#3e4a6b] hover:text-[#F3F3FA]'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-medium tracking-wider text-[#64708D]">
                          {dayItem.isToday ? (language === 'es' ? 'Hoy' : 'Today') : dayItem.dayName}
                        </span>
                        <span className="text-base font-semibold my-0.5">{dayItem.dayNum}</span>
                        <span className="text-[10px] text-[#C7B9FF]/90 font-light">{dayItem.monthName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selector */}
              <div>
                <span className="text-[11px] text-[#A8B1C8] block mb-2 font-medium">
                  {language === 'es' ? '2. Elegir hora (tu hora)' : '2. Choose Time (Your Time)'}
                </span>

                {/* Time presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { time: '07:00', label: language === 'es' ? 'Mañana' : 'Morning' },
                    { time: '12:30', label: language === 'es' ? 'Mediodía' : 'Midday' },
                    { time: '18:00', label: language === 'es' ? 'Tarde' : 'Evening' },
                    { time: '21:00', label: language === 'es' ? 'Noche' : 'Night' },
                  ].map(({ time: timePreset, label }) => {
                    const isSelected = !isCustomTimeActive && selectedTimeStr === timePreset;
                    return (
                      <button
                        type="button"
                        key={timePreset}
                        onClick={() => {
                          setSelectedTimeStr(timePreset);
                          setIsCustomTimeActive(false);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#1b233a] to-[#252f4c] border-[#C7B9FF] text-[#F3F3FA] shadow-[0_0_12px_rgba(199,185,255,0.2)]'
                            : 'bg-[#111827] border-[#242c40] text-[#A8B1C8] hover:text-[#F3F3FA] hover:border-[#3e4a6b]'
                        }`}
                      >
                        <span className="font-semibold">{timePreset}</span>
                        <span className="text-[10px] text-[#64708D] font-light">{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Time Selector */}
                <div className="rounded-2xl bg-[#111827] border border-[#242c40] p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsCustomTimeActive(!isCustomTimeActive)}
                      className="flex items-center gap-2 text-xs font-medium text-[#C7B9FF] hover:text-[#F3F3FA] transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#C7B9FF]" />
                      <span>{language === 'es' ? 'Selector de hora personalizada' : 'Custom Time Picker'}</span>
                    </button>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#151B29] border border-[#C7B9FF]/30 text-xs font-mono text-[#F3F3FA] shadow-inner">
                      <span className="text-[#C7B9FF] font-semibold">{currentHour}:{currentMinute}</span>
                      <span className="text-[10px] text-[#64708D]">{language === 'es' ? 'Tu hora' : 'Your time'}</span>
                    </div>
                  </div>

                  {/* Interactive Hour & Minute Sliders */}
                  <div className="pt-2 border-t border-[#242c40]/60 grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Hour Column */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-[#64708D]">
                        <span>{language === 'es' ? 'Hora' : 'Hour'}</span>
                        <span className="font-mono text-[#A8B1C8]">{currentHour}:00</span>
                      </div>
                      <select
                        value={currentHour}
                        onChange={(e) => setCustomHour(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/70 text-xs text-[#F3F3FA] focus:outline-none transition-colors cursor-pointer font-mono"
                      >
                        {Array.from({ length: 24 }).map((_, h) => {
                          const val = h.toString().padStart(2, '0');
                          return (
                            <option key={val} value={val} className="bg-[#151B29] text-[#F3F3FA]">
                              {val}:00 ({h === 0 ? (language === 'es' ? 'Medianoche' : 'Midnight') : h === 12 ? (language === 'es' ? 'Mediodía' : 'Noon') : h < 12 ? `${h} AM` : `${h - 12} PM`})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Minute Column */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-[#64708D]">
                        <span>{language === 'es' ? 'Minuto' : 'Minute'}</span>
                        <span className="font-mono text-[#A8B1C8]">:{currentMinute}</span>
                      </div>
                      <select
                        value={currentMinute}
                        onChange={(e) => setCustomMinute(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/70 text-xs text-[#F3F3FA] focus:outline-none transition-colors cursor-pointer font-mono"
                      >
                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((min) => (
                          <option key={min} value={min} className="bg-[#151B29] text-[#F3F3FA]">
                            :{min} min
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {errors.scheduled && <p className="text-xs text-[#FFB9D2]">{errors.scheduled}</p>}
            </div>

            {/* Consent and Guidelines Checkbox */}
            <div className="p-3.5 rounded-xl bg-[#151B29]/70 border border-[#242c40] space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#A8B1C8]">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-[#242c40] text-[#C7B9FF] focus:ring-0 accent-[#C7B9FF]"
                />
                <span>
                  {language === 'es'
                    ? 'Confirmo que tengo consentimiento para compartir esta intención con respeto, y comprendo que Meditation Hub es un espacio de meditación y presencia compasiva, no un tratamiento médico.'
                    : 'I confirm I have permission/consent to share this intention respectfully, and understand that Meditation Hub is a supportive meditation room, not a medical or curative treatment.'}
                </span>
              </label>
              {errors.consent && <p className="text-xs text-[#FFB9D2]">{errors.consent}</p>}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242c40]">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#A8B1C8] hover:text-[#F3F3FA] transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/70 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('create.submitBtn')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
