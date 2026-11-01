'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { IntentionCategory, SessionType } from '@/types';
import {
  Calendar,
  Check,
  Globe,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';

const CATEGORIES: IntentionCategory[] = [
  'Physical Wellbeing',
  'Mental & Emotional Wellbeing',
  'Love & Relationships',
  'Financial Wellbeing',
  'Global Peace',
  'Other',
];

// Curated peaceful symbolic art presets
const PRESET_IMAGES = [
  { label: 'Warm Horizon', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80' },
  { label: 'Still Waters', url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Ethereal Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80' },
  { label: 'Luminous Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80' },
];

export function CreateIntentionModal() {
  const { isCreateModalOpen, setIsCreateModalOpen, createIntention, setSelectedDetailIntention } = useApp();

  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IntentionCategory>('Physical Wellbeing');
  const [description, setDescription] = useState('');
  const [visualizationPrompt, setVisualizationPrompt] = useState('');

  // Image handling: Upload photo or Preset
  const [imageMode, setImageMode] = useState<'preset' | 'upload'>('preset');
  const [selectedPresetImage, setSelectedPresetImage] = useState(PRESET_IMAGES[0].url);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Session type
  const [sessionType, setSessionType] = useState<SessionType>('open');

  // Interactive Calendar Selection for Scheduled Session
  const [localTimezone, setLocalTimezone] = useState('UTC');
  const [availableDays, setAvailableDays] = useState<
    { dateStr: string; dayName: string; dayNum: number; monthName: string; isToday: boolean }[]
  >([]);
  const [selectedDayStr, setSelectedDayStr] = useState<string>('');
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>('18:00');

  // Defer date calculation to client mount to avoid static prerender mismatch
  React.useEffect(() => {
    try {
      setLocalTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    } catch {
      // fallback
    }

    const days: { dateStr: string; dayName: string; dayNum: number; monthName: string; isToday: boolean }[] = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayName: d.toLocaleDateString([], { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString([], { month: 'short' }),
        isToday: i === 0,
      });
    }
    setAvailableDays(days);
    if (days.length > 1) {
      setSelectedDayStr(days[1].dateStr);
    } else if (days.length > 0) {
      setSelectedDayStr(days[0].dateStr);
    }
  }, []);

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
      setImageMode('upload');
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedPhoto = () => {
    setUploadedPhotoUrl(null);
    setImageMode('preset');
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

    const imgToUse = imageMode === 'upload' && uploadedPhotoUrl ? uploadedPhotoUrl : selectedPresetImage;

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151B29] border border-[#242c40] text-xs text-[#C7B9FF] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Space for Someone</span>
            </div>
            <h2 id="modal-headline" className="text-xl sm:text-2xl font-light tracking-tight text-[#F3F3FA]">
              Create an Intention
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B1C8]">
              Invite the community to hold space and meditate alongside you or someone you care about.
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                Recipient Name or Display Title <span className="text-[#C7B9FF]">*</span>
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g., Sarah (Sister), Myself, The Pediatric Ward"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/60 text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none transition-colors"
              />
              {errors.recipient && <p className="text-xs text-[#FFB9D2] mt-1">{errors.recipient}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                Intention Title <span className="text-[#C7B9FF]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Gentle Healing & Restful Slumber"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/60 text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none transition-colors"
              />
              {errors.title && <p className="text-xs text-[#FFB9D2] mt-1">{errors.title}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IntentionCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/60 text-xs sm:text-sm text-[#F3F3FA] focus:outline-none transition-colors cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#151B29] text-[#F3F3FA]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                Description or Situation <span className="text-[#C7B9FF]">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the context with compassion. We focus on peaceful presence and wellbeing support."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/60 text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none transition-colors resize-none"
              />
              {errors.description && <p className="text-xs text-[#FFB9D2] mt-1">{errors.description}</p>}
            </div>

            {/* Visualization Prompt */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                Visualization Prompt (Optional)
              </label>
              <textarea
                rows={2}
                value={visualizationPrompt}
                onChange={(e) => setVisualizationPrompt(e.target.value)}
                placeholder="e.g., Picture gentle warm sunlight surrounding their shoulders, easing tension with every breath."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] focus:border-[#C7B9FF]/60 text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Imagery: Upload Photo or Choose Preset (URL option removed) */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-2">
                Portrait or Symbolic Art (Optional)
              </label>

              {/* Photo Upload Option */}
              <div className="mb-3">
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
                      <Image src={uploadedPhotoUrl} alt="Uploaded portrait" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-[#F3F3FA] block">Photo added</span>
                      <span className="text-[11px] text-[#A8B1C8]">Your personal photo is ready for this intention.</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeUploadedPhoto}
                      className="px-3 py-1.5 rounded-full text-xs text-[#FFB9D2] hover:bg-[#FFB9D2]/10 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="intention-photo-upload"
                    className="flex items-center justify-center gap-2 w-full p-3.5 rounded-2xl bg-[#151B29] hover:bg-[#1b233a] border border-dashed border-[#3e4a6b] hover:border-[#C7B9FF]/60 transition-all cursor-pointer text-xs text-[#C7B9FF] group"
                  >
                    <Upload className="w-4 h-4 text-[#C7B9FF] group-hover:scale-110 transition-transform" />
                    <span>Upload your photo</span>
                  </label>
                )}
              </div>

              {/* Presets (Only shown or highlighted if not uploading a custom photo) */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#64708D]">Or choose a peaceful symbolic artwork:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.url}
                      onClick={() => {
                        setSelectedPresetImage(preset.url);
                        setImageMode('preset');
                      }}
                      className={`relative h-16 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        imageMode === 'preset' && selectedPresetImage === preset.url
                          ? 'border-[#C7B9FF] ring-2 ring-[#C7B9FF]/30'
                          : 'border-[#242c40] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                      <span className="absolute inset-0 bg-[#080B15]/40 flex items-center justify-center text-[10px] text-[#F3F3FA] font-medium px-1 text-center">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-2">
                Session Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSessionType('open')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    sessionType === 'open'
                      ? 'bg-[#1b233a] border-[#C7B9FF]/40 text-[#F3F3FA]'
                      : 'bg-[#151B29] border-[#242c40] text-[#A8B1C8]'
                  }`}
                >
                  <div className="text-xs font-medium text-[#C7B9FF]">Open Intention</div>
                  <div className="text-[11px] text-[#64708D] mt-0.5">
                    Members sit anytime at their own pace.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionType('scheduled')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    sessionType === 'scheduled'
                      ? 'bg-[#1b233a] border-[#C7B9FF]/40 text-[#F3F3FA]'
                      : 'bg-[#151B29] border-[#242c40] text-[#A8B1C8]'
                  }`}
                >
                  <div className="text-xs font-medium text-[#B9D1FF]">Scheduled Session</div>
                  <div className="text-[11px] text-[#64708D] mt-0.5">
                    Synchronous collective encounter at a specific time.
                  </div>
                </button>
              </div>

              {/* Enhanced Calendar Squares & Time Picker for Scheduled Session */}
              {sessionType === 'scheduled' && (
                <div className="mt-4 p-4 rounded-2xl bg-[#151B29]/90 border border-[#242c40] space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242c40]/80 pb-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#C7B9FF]">
                      <Calendar className="w-4 h-4 text-[#C7B9FF]" />
                      <span>Select Encounter Day & Time</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#B9D1FF] bg-[#111827] px-2.5 py-1 rounded-full border border-[#242c40]">
                      <Globe className="w-3 h-3 text-[#B9D1FF]" />
                      <span>Local zone: {localTimezone}</span>
                    </div>
                  </div>

                  {/* Calendar Day Squares Grid (Horizontally scrollable with beautiful cards) */}
                  <div>
                    <span className="text-[11px] text-[#A8B1C8] block mb-2 font-medium">1. Choose Date</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {availableDays.map((dayItem) => {
                        const isSelected = selectedDayStr === dayItem.dateStr;
                        return (
                          <button
                            type="button"
                            key={dayItem.dateStr}
                            onClick={() => setSelectedDayStr(dayItem.dateStr)}
                            className={`flex flex-col items-center justify-center min-w-[62px] h-[72px] rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-b from-[#1b233a] to-[#252f4c] border-[#C7B9FF] shadow-[0_0_12px_rgba(199,185,255,0.25)] text-[#F3F3FA]'
                                : 'bg-[#111827] border-[#242c40] text-[#A8B1C8] hover:border-[#3e4a6b] hover:text-[#F3F3FA]'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-medium tracking-wider text-[#64708D]">
                              {dayItem.isToday ? 'Today' : dayItem.dayName}
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
                    <span className="text-[11px] text-[#A8B1C8] block mb-2 font-medium">2. Choose Local Time</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      {['07:00', '12:30', '18:00', '21:00'].map((timePreset) => {
                        const isSelected = selectedTimeStr === timePreset;
                        return (
                          <button
                            type="button"
                            key={timePreset}
                            onClick={() => setSelectedTimeStr(timePreset)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-center ${
                              isSelected
                                ? 'bg-[#1b233a] border-[#C7B9FF] text-[#C7B9FF] shadow-sm'
                                : 'bg-[#111827] border-[#242c40] text-[#A8B1C8] hover:text-[#F3F3FA]'
                            }`}
                          >
                            {timePreset} (Local)
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-[#64708D]">Or custom:</span>
                      <input
                        type="time"
                        value={selectedTimeStr}
                        onChange={(e) => setSelectedTimeStr(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#242c40] text-xs text-[#F3F3FA] focus:outline-none focus:border-[#C7B9FF]/60"
                      />
                    </div>
                  </div>

                  {errors.scheduled && <p className="text-xs text-[#FFB9D2]">{errors.scheduled}</p>}
                </div>
              )}
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
                  I confirm I have permission/consent to share this intention respectfully, and understand that Coherence Hub is a supportive meditation space, not a medical or curative treatment.
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
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/70 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Publish Intention</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
