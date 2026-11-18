'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Check, Mail, MessageSquare, Send, X } from 'lucide-react';

const TOPICS = [
  'General Feedback',
  'Feature Suggestion',
  'Question or Help',
  'Technical Issue',
  'Other',
];

export function ContactModal() {
  const {
    isContactModalOpen,
    setIsContactModalOpen,
    currentUser,
    sendContactMessage,
    showToast,
    t,
    language,
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General Feedback');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-populate user details if logged in
  useEffect(() => {
    if (isContactModalOpen) {
      if (currentUser && !currentUser.isGuest) {
        setName(currentUser.name || '');
        setEmail(currentUser.email || '');
      } else {
        setName('');
        setEmail('');
      }
      setTopic('General Feedback');
      setMessage('');
      setError(null);
      setIsSubmitted(false);
      setIsSubmitting(false);
    }
  }, [isContactModalOpen, currentUser]);

  if (!isContactModalOpen) return null;

  const handleClose = () => {
    setIsContactModalOpen(false);
    setIsSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address so we can reply.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError('Please write a message with at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: topic,
        message: message.trim(),
      });

      setIsSubmitted(true);
      showToast('Thank you! Your message has been sent.', 'success');
    } catch {
      setError('Something went wrong sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#080B15]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
      aria-labelledby="contact-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#111827] border border-[#242c40] p-6 sm:p-7 shadow-2xl relative overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top ambient glow */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-24 rounded-full blur-2xl opacity-20"
          style={{ background: 'radial-gradient(circle, #C7B9FF 0%, transparent 70%)' }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#242c40]/70 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1b233a] border border-[#C7B9FF]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(199,185,255,0.1)]">
              <Mail className="w-5 h-5 text-[#C7B9FF]" />
            </div>
            <div>
              <h2 id="contact-modal-title" className="text-xs sm:text-sm uppercase font-bold tracking-wider text-[#C7B9FF]">
                {t('contact.title')}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-[#A8B1C8] hover:text-[#F3F3FA] hover:bg-[#151B29] transition-colors cursor-pointer"
            aria-label="Close contact modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {isSubmitted ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200 relative z-10">
            <div className="w-14 h-14 rounded-full bg-[#1b233a] border border-[#C7B9FF]/40 text-[#C7B9FF] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(199,185,255,0.25)]">
              <Check className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-medium text-[#F3F3FA]">
                {t('contact.successTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#A8B1C8] max-w-sm mx-auto leading-relaxed">
                {t('contact.successDesc')}
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/80 transition-all cursor-pointer shadow-sm"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        ) : (
          /* Contact Form */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 relative z-10">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                  {t('contact.nameLabel')} <span className="text-[#C7B9FF]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none focus:border-[#C7B9FF]/60 transition-colors"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                  {t('contact.emailLabel')} <span className="text-[#C7B9FF]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none focus:border-[#C7B9FF]/60 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                {t('contact.topicLabel')}
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((top) => {
                  const translatedTopic = language === 'es'
                    ? top === 'General Feedback' ? 'Comentarios generales'
                      : top === 'Feature Suggestion' ? 'Sugerencias'
                      : top === 'Question or Help' ? 'Preguntas y ayuda'
                      : top === 'Technical Issue' ? 'Problema técnico'
                      : 'Otro'
                    : top;
                  return (
                    <button
                      key={top}
                      type="button"
                      onClick={() => setTopic(top)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        topic === top
                          ? 'bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/50 shadow-sm'
                          : 'bg-[#151B29] text-[#A8B1C8] hover:text-[#F3F3FA] border border-[#242c40]'
                      }`}
                    >
                      {translatedTopic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#A8B1C8]">
                  {t('contact.messageLabel')} <span className="text-[#C7B9FF]">*</span>
                </label>
                <span className="text-[10px] text-[#64708D]">
                  {message.length} {language === 'es' ? 'caracteres' : 'characters'}
                </span>
              </div>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('contact.messagePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#151B29] border border-[#242c40] text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none focus:border-[#C7B9FF]/60 transition-colors resize-none leading-relaxed"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#1b233a] to-[#252a42] hover:from-[#232c4a] hover:to-[#2e3553] text-[#F3F3FA] border border-[#C7B9FF]/50 hover:border-[#C7B9FF] transition-all cursor-pointer shadow-[0_0_15px_rgba(199,185,255,0.18)] active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C7B9FF]/30 border-t-[#C7B9FF] animate-spin" />
                    <span>{t('contact.sending')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#C7B9FF]" />
                    <span>{t('contact.sendBtn')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Email Link Alternative */}
            <div className="pt-3 border-t border-[#242c40]/60 text-center">
              <p className="text-[11px] text-[#64708D]">
                {language === 'es' ? 'O escribe directamente a ' : 'Or write directly to '}
                <a
                  href="mailto:contact@meditation-hub.org"
                  className="text-[#C7B9FF] hover:underline"
                >
                  contact@meditation-hub.org
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
