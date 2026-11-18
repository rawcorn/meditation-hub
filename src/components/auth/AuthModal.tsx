'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Mail, X } from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithGoogle,
    sendEmailOtp,
    verifyEmailOtp,
    continueAsGuest,
    t,
    language,
  } = useApp();

  const [step, setStep] = useState<'initial' | 'otp'>('initial');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state whenever modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('initial');
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMessage(null);
    }
  }, [isAuthModalOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const interval = setInterval(() => {
      setResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  if (!isAuthModalOpen) return null;

  const handleSendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address to receive your login code.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await sendEmailOtp(cleanEmail);
      setIsLoading(false);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
      if (res.code) {
        setDemoCode(res.code);
      }
      setStep('otp');
      setResendCountdown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch {
      setIsLoading(false);
      setErrorMessage('Failed to send verification code. Please try again.');
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    // If multiple digits pasted
    if (val.length > 1) {
      const chars = val.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      chars.forEach((c, i) => {
        if (index + i < 6) newDigits[index + i] = c;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(5, index + chars.length);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const cleanChar = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const success = await verifyEmailOtp(email, fullCode);
      setIsLoading(false);
      if (!success) {
        setErrorMessage('Code did not match. Please verify and try again.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Verification failed. Please try again.');
    }
  };

  const handleFillDemoCode = () => {
    if (!demoCode) return;
    const chars = demoCode.split('');
    setOtpDigits(chars);
    setErrorMessage(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B15]/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#111827] border border-[#30364A] rounded-3xl p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-[#F3F3FA] transition-all">
        {/* Close Button */}
        <button
          onClick={() => {
            continueAsGuest();
          }}
          className="absolute right-5 top-5 text-[#64708D] hover:text-[#F3F3FA] transition-colors cursor-pointer p-1 rounded-full hover:bg-[#151B29]"
          aria-label="Continue as guest"
          title="Continue as Guest"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'initial' ? (
          <div>
            {/* Header with orbital rings */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#151B29] border border-[#3e4a6b]/80 shadow-[0_0_20px_rgba(199,185,255,0.15)] mb-3">
                <div className="absolute inset-1 rounded-full border border-[#C7B9FF]/30 animate-spin-slow" />
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#C7B9FF] to-[#B9D1FF] shadow-[0_0_10px_rgba(199,185,255,0.8)]" />
              </div>
              <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-light text-[#F3F3FA] tracking-tight">
                {t('auth.title')}
              </h2>
              <p className="text-xs text-[#A8B1C8] mt-1.5 max-w-xs leading-relaxed">
                {t('auth.subtitle')}
              </p>
            </div>

            {/* Google 1-Click Login */}
            <button
              onClick={async () => {
                setIsLoading(true);
                await loginWithGoogle();
                setIsLoading(false);
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-[#151B29] hover:bg-[#1b233a] border border-[#30364A] hover:border-[#C7B9FF]/50 text-xs sm:text-sm font-medium text-[#F3F3FA] transition-all cursor-pointer shadow-sm active:scale-[0.99] group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t('auth.continueWithGoogle')}</span>
            </button>

            {/* Subtle Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#242c40]" />
              </div>
              <span className="relative px-3 bg-[#111827] text-[11px] text-[#64708D] uppercase tracking-wider font-medium">
                {t('auth.orEmail')}
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSendEmail} noValidate className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#A8B1C8] mb-1.5">
                  {language === 'es' ? 'Correo electrónico' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                    errorMessage ? 'text-rose-400' : 'text-[#64708D]'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="you@domain.com"
                    autoFocus
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151B29] text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none transition-all ${
                      errorMessage
                        ? 'border border-rose-400/60 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                        : 'border border-[#242c40] focus:border-[#C7B9FF]/60'
                    }`}
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-[#1b1726] border border-rose-500/30 text-xs text-rose-300 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/80 transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isLoading ? t('auth.sendingCode') : t('auth.sendCodeBtn')}</span>
              </button>

              <p className="text-[11px] text-[#64708D] text-center leading-relaxed">
                {language === 'es'
                  ? 'Sin contraseñas que recordar. Enviamos un código de 6 dígitos a tu bandeja de entrada.'
                  : 'No passwords to remember. We send a 6-digit access code directly to your inbox.'}
              </p>
            </form>

            {/* Divider and Guest Option */}
            <div className="pt-4 mt-5 border-t border-[#242c40]/70 flex flex-col items-center">
              <button
                onClick={() => {
                  continueAsGuest();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-normal text-[#A8B1C8] hover:text-[#F3F3FA] bg-transparent hover:bg-[#151B29]/60 border border-transparent hover:border-[#242c40] transition-all cursor-pointer text-center"
              >
                <span>{t('auth.continueGuest')}</span>
                <span className="block text-[10px] text-[#64708D] mt-0.5">
                  {t('auth.guestNotice')}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* OTP Screen */
          <div>
            <button
              onClick={() => {
                setStep('initial');
                setErrorMessage(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#A8B1C8] hover:text-[#F3F3FA] mb-4 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('auth.changeEmail')}</span>
            </button>

            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-full bg-[#151B29] border border-[#C7B9FF]/30 flex items-center justify-center mx-auto mb-2 text-[#C7B9FF]">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-light text-[#F3F3FA]">{t('auth.enterOtpTitle')}</h3>
              <p className="text-xs text-[#A8B1C8] mt-1">
                {t('auth.enterOtpSubtitle', { email })}
              </p>
            </div>

            {/* Quick Demo Helper */}
            {demoCode && (
              <div className="mb-4 p-3 rounded-2xl bg-[#151B29] border border-[#C7B9FF]/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#A8B1C8] block text-[11px]">Instant Demo Code</span>
                  <span className="font-mono text-sm tracking-widest text-[#C7B9FF] font-semibold">
                    {demoCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCode}
                  className="px-2.5 py-1 rounded-lg bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 text-[11px] cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 sm:w-12 h-12 text-center text-lg font-semibold rounded-xl bg-[#151B29] border border-[#242c40] text-[#F3F3FA] focus:outline-none focus:border-[#C7B9FF] focus:ring-1 focus:ring-[#C7B9FF]/50 transition-all font-mono"
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-[#1b1726] border border-rose-500/30 text-xs text-rose-300 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length < 6}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/80 transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLoading ? (language === 'es' ? 'Verificando...' : 'Verifying...') : t('auth.verifyBtn')}</span>
              </button>

              <div className="flex items-center justify-between text-xs text-[#64708D] pt-2">
                <button
                  type="button"
                  disabled={resendCountdown > 0}
                  onClick={() => handleSendEmail()}
                  className="hover:text-[#A8B1C8] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {resendCountdown > 0
                    ? t('auth.resendIn', { seconds: resendCountdown })
                    : t('auth.resendBtn')}
                </button>

                <button
                  type="button"
                  onClick={() => continueAsGuest()}
                  className="hover:text-[#A8B1C8] cursor-pointer"
                >
                  {t('auth.continueGuest')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}