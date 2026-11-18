'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { isSupabaseConfigured } from '@/services/dataService';
import { Check, Database, Leaf, LogIn, LogOut, Mail, Shield, User, X } from 'lucide-react';
import Image from 'next/image';

export function ProfileModal() {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    setIsAuthModalOpen,
    setIsContactModalOpen,
    currentUser,
    updateUser,
    signOut,
    language,
    setLanguage,
    t,
  } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email || '');
  }, [currentUser]);

  if (!isProfileModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateUser({ name: name.trim(), email: email.trim() });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsProfileModalOpen(false);
    }, 800);
  };

  const hasSupabase = isSupabaseConfigured();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B15]/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <div className="relative w-full max-w-md bg-[#111827] border border-[#30364A] rounded-3xl p-6 shadow-2xl text-[#F3F3FA]">
        <button
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute right-5 top-5 text-[#64708D] hover:text-[#F3F3FA] transition-colors cursor-pointer p-1 rounded-full hover:bg-[#151B29]"
          aria-label="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#C7B9FF]/40 bg-[#151B29] flex items-center justify-center shrink-0">
            {currentUser.avatarUrl ? (
              <Image
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                fill
                className="object-cover"
                unoptimized={Boolean(currentUser.avatarUrl?.startsWith('data:') || currentUser.avatarUrl?.startsWith('http'))}
              />
            ) : (
              <User className="w-5 h-5 text-[#C7B9FF]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="profile-title" className="text-lg font-light text-[#F3F3FA]">
                {currentUser.name}
              </h2>
              {currentUser.isGuest ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#151B29] text-[#A8B1C8] border border-[#242c40]">
                  {t('common.guest')}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/30">
                  {currentUser.authProvider === 'google' ? 'Google' : 'Passwordless'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#A8B1C8]">
              {currentUser.isGuest
                ? (language === 'es' ? 'Navegando en modo invitado local' : 'Browsing in local guest mode')
                : (language === 'es'
                    ? `Miembro desde ${new Date(currentUser.joinedAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`
                    : `Member since ${new Date(currentUser.joinedAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}`)}
            </p>
          </div>
        </div>

        {/* Language Selection Setting (Available for both Guests and Registered users) */}
        <div className="mb-4 p-3 rounded-2xl bg-[#151B29]/70 border border-[#242c40] flex items-center justify-between">
          <span className="text-xs font-medium text-[#A8B1C8]">{t('profile.languageLabel')}</span>
          <div className="flex items-center rounded-full bg-[#111827] border border-[#242c40] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#1b233a] text-[#C7B9FF] font-semibold shadow-xs'
                  : 'text-[#64708D] hover:text-[#A8B1C8]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                language === 'es'
                  ? 'bg-[#1b233a] text-[#C7B9FF] font-semibold shadow-xs'
                  : 'text-[#64708D] hover:text-[#A8B1C8]'
              }`}
            >
              Español
            </button>
          </div>
        </div>

        {/* If Guest: show invitation to register */}
        {currentUser.isGuest ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#151B29] to-[#121622] border border-[#C7B9FF]/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[#F3F3FA]">
                <Leaf className="w-4 h-4 text-[#C7B9FF]" />
                <span>{language === 'es' ? 'Guarda y sincroniza tu camino' : 'Save & Synchronize Your Journey'}</span>
              </div>
              <p className="text-xs text-[#A8B1C8] leading-relaxed">
                {language === 'es'
                  ? 'Como invitado, tus minutos de meditación, intenciones seguidas y notas se guardan en este navegador. Inicia sesión con Google o correo para respaldar y sincronizar en todos tus dispositivos.'
                  : 'As a guest, your meditation minutes, joined intentions, and journal reflections are saved in this browser. Sign in with Google or Email (no password needed) to back them up and sync across all your devices.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/80 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('profile.signInBtn')}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#151B29]/40 border border-[#242c40] text-[11px] text-[#64708D] flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-[#B9D1FF]" />
              <span>
                {language === 'es'
                  ? 'Meditation Hub protege tu privacidad. Los datos de tu práctica nunca se venden ni se comparten públicamente.'
                  : 'Meditation Hub protects member privacy. Practice data is never sold or shared publicly.'}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 text-xs text-[#A8B1C8] hover:text-[#F3F3FA] cursor-pointer"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        ) : (
          /* Registered user profile editor */
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1">{t('profile.nameLabel')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#151B29] border border-[#242c40] text-xs sm:text-sm text-[#F3F3FA] focus:outline-none focus:border-[#C7B9FF]/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8B1C8] mb-1">{t('profile.emailLabel')}</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2 rounded-xl bg-[#151B29]/60 border border-[#242c40] text-xs sm:text-sm text-[#A8B1C8] opacity-80 cursor-not-allowed"
              />
              <span className="text-[10px] text-[#64708D] mt-1 block">
                {language === 'es'
                  ? `Autenticado vía ${currentUser.authProvider === 'google' ? 'Google OAuth' : 'Código de correo'}`
                  : `Authenticated via ${currentUser.authProvider === 'google' ? 'Google OAuth' : 'Passwordless Email Code'}`}
              </span>
            </div>

            {/* Architecture & Persistence Status Indicator */}
            <div className="p-3.5 rounded-2xl bg-[#151B29]/70 border border-[#242c40] space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#C7B9FF] font-medium">
                <Database className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Conectado y sincronizado' : 'Connected & Synchronized'}</span>
              </div>
              <p className="text-[#A8B1C8] text-[11px] leading-relaxed">
                {hasSupabase
                  ? (language === 'es'
                      ? 'Conectado a base de datos y autenticación remota de Supabase.'
                      : 'Connected to remote Supabase database and authentication.')
                  : (language === 'es'
                      ? 'Cuenta sincronizada. Tus minutos, intenciones y notas se respaldan de forma segura en tu perfil en todos tus dispositivos.'
                      : 'Account synced. Your meditation minutes, joined intentions, and reflections are securely backed up to your profile across all your devices.')}
              </p>
            </div>

            {/* Contact Developer */}
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(false);
                setIsContactModalOpen(true);
              }}
              className="w-full p-3 rounded-2xl bg-[#151B29]/60 hover:bg-[#1b233a] border border-[#242c40] hover:border-[#C7B9FF]/30 transition-all flex items-center justify-between text-xs text-[#A8B1C8] hover:text-[#F3F3FA] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C7B9FF]" />
                <span className="font-medium">{t('profile.contactSupportBtn')}</span>
              </div>
              <span className="text-[11px] text-[#64708D]">{language === 'es' ? 'Escríbenos' : 'Contact us'}</span>
            </button>

            {/* Privacy & Guidelines */}
            <div className="p-3.5 rounded-2xl bg-[#151B29]/40 border border-[#242c40] text-[11px] text-[#64708D] flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-[#B9D1FF]" />
              <span>
                {language === 'es'
                  ? 'Meditation Hub protege la privacidad de sus miembros. La práctica nunca se vende ni comparte con terceros.'
                  : 'Meditation Hub protects member privacy. Practice data is never sold or shared publicly.'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('profile.signOutBtn')}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#A8B1C8] hover:text-[#F3F3FA] cursor-pointer"
                >
                  {t('common.close')}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 cursor-pointer shadow-sm active:scale-95"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{isSaved ? (language === 'es' ? 'Guardado' : 'Saved') : t('profile.saveBtn')}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}