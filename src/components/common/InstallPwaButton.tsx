'use client';

import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Monitor } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallPwaButton() {
  const { language, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone PWA mode
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone === true;

      setIsStandalone(isStandaloneMode);

      // 2. Detect iOS (Safari / Webkit without native beforeinstallprompt)
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice =
        /iphone|ipad|ipod/.test(userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      setIsIOS(isIosDevice);

      // Check if permanently dismissed across visits
      const dismissed = localStorage.getItem('pwa_install_dismissed_permanent');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }

    // 3. Listen for Chromium/Android/Desktop install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // If already running inside installed app or user dismissed the prompt this session, don't show
  if (isStandalone || isDismissed) {
    return null;
  }

  // Handle clicking the install button
  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Fallback for desktop/browsers where prompt event hasn't fired yet
      // Displays clear instructions to click the browser's install icon (address bar)
      setShowIOSModal(true);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem('pwa_install_dismissed_permanent', 'true');
  };

  return (
    <>
      {/* Floating Install App Action Button:
          En mobile se posiciona a bottom-20 (por encima de la barra fija de 64px + safe area)
          En desktop (sm:) se posiciona a bottom-6. Con z-50 para flotar siempre encima del contenido. */}
      <aside
        aria-label="Install Meditation Hub App"
        className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
      >
        <div className="relative group">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#111827]/95 hover:bg-[#182033] text-[#F3F3FA] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/80 shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_15px_rgba(199,185,255,0.15)] backdrop-blur-md transition-all cursor-pointer active:scale-95 group"
            title="Install Meditation Hub for quick access"
          >
            <div className="w-6 h-6 rounded-full bg-[#1e273f] flex items-center justify-center text-[#C7B9FF] group-hover:scale-110 transition-transform">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-[#F3F3FA] block leading-tight">
                {t('pwa.installBtn')}
              </span>
              <span className="text-[10px] text-[#A8B1C8] block leading-tight hidden sm:block">
                {language === 'es' ? 'Añadir a tu dispositivo' : 'Add to your device'}
              </span>
            </div>
          </button>

          {/* Small dismiss 'x' button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1c2336] border border-[#2e3954] text-[#8e9bb5] hover:text-[#F3F3FA] hover:bg-[#28324d] flex items-center justify-center text-[10px] transition-colors shadow-sm cursor-pointer"
            aria-label={t('pwa.dismiss')}
            title={t('pwa.dismiss')}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Instructions Modal (iOS or Manual Desktop/Android) */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-[#0f1422] border border-[#242c40] p-6 shadow-2xl text-left space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1f273b]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1b233a] border border-[#C7B9FF]/30 flex items-center justify-center text-[#C7B9FF]">
                  {isIOS ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F3F3FA]">
                    {isIOS
                      ? (language === 'es' ? 'Instalar en iPhone y iPad' : 'Install on iPhone & iPad')
                      : (language === 'es' ? 'Instalar en tu dispositivo' : 'Install on Your Device')}
                  </h3>
                  <p className="text-[11px] text-[#A8B1C8]">
                    {language === 'es' ? 'Acceso directo en pantalla de inicio' : 'One-tap home screen access'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-full text-[#8e9bb5] hover:text-[#F3F3FA] hover:bg-[#1b233a] transition-colors cursor-pointer"
                aria-label={t('common.close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps according to OS */}
            {isIOS ? (
              <div className="space-y-4 text-xs text-[#A8B1C8]">
                <p className="text-xs text-[#E2D9FF] leading-relaxed">
                  {language === 'es'
                    ? 'Apple requiere instalar aplicaciones web desde Safari en 2 pasos sencillos:'
                    : 'Apple requires installing web apps through Safari in 2 simple steps:'}
                </p>

                <div className="space-y-3 bg-[#141b2d] border border-[#242c40] rounded-xl p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1f2842] text-[#C7B9FF] font-semibold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-[#F3F3FA] font-medium flex items-center gap-1.5">
                        {language === 'es' ? 'Toca el botón ' : 'Tap the '}
                        <Share className="w-3.5 h-3.5 text-[#C7B9FF] inline" />
                        {language === 'es' ? ' Compartir' : ' Share button'}
                      </p>
                      <p className="text-[11px] text-[#8e9bb5] mt-0.5">
                        {language === 'es'
                          ? 'Ubicado en la barra de herramientas de Safari al pie de pantalla.'
                          : 'Found in the Safari toolbar at the bottom of your screen.'}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#1f273b]" />

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1f2842] text-[#C7B9FF] font-semibold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-[#F3F3FA] font-medium flex items-center gap-1.5">
                        {language === 'es' ? 'Elige ' : 'Choose '}
                        <PlusSquare className="w-3.5 h-3.5 text-[#C7B9FF] inline" />
                        {language === 'es' ? ' Agregar a pantalla de inicio' : ' Add to Home Screen'}
                      </p>
                      <p className="text-[11px] text-[#8e9bb5] mt-0.5">
                        {language === 'es'
                          ? 'Desliza hacia abajo en el menú y selecciona "Agregar a pantalla de inicio".'
                          : 'Scroll down the menu and tap "Add to Home Screen".'}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-center text-[#8e9bb5]">
                  {language === 'es'
                    ? 'Meditation Hub se abrirá desde tu pantalla como una app nativa.'
                    : 'Meditation Hub will appear on your home screen like an app.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-[#A8B1C8]">
                <p className="text-xs text-[#E2D9FF] leading-relaxed">
                  {language === 'es'
                    ? 'Puedes instalar Meditation Hub directamente desde tu navegador:'
                    : 'You can install Meditation Hub directly from your browser:'}
                </p>

                <div className="space-y-3 bg-[#141b2d] border border-[#242c40] rounded-xl p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1f2842] text-[#C7B9FF] font-semibold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-[#F3F3FA] font-medium">
                        {language === 'es' ? 'Mira la barra de direcciones' : 'Look at your address bar'}
                      </p>
                      <p className="text-[11px] text-[#8e9bb5] mt-0.5">
                        {language === 'es'
                          ? 'En Chrome, Edge o Brave, haz clic en el ícono de instalar (pantalla con flecha o "+") en la parte derecha de la barra de URL.'
                          : 'In Chrome, Edge or Brave, click the install icon (desktop screen with arrow or "+") on the right side of the URL bar.'}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#1f273b]" />

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1f2842] text-[#C7B9FF] font-semibold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-[#F3F3FA] font-medium">
                        {language === 'es' ? 'Haz clic en "Instalar"' : 'Click "Install"'}
                      </p>
                      <p className="text-[11px] text-[#8e9bb5] mt-0.5">
                        {language === 'es'
                          ? 'Se abrirá en su propia ventana sin distracciones para una práctica inmersiva.'
                          : 'It will launch in its own standalone window for an immersive, distraction-free practice.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-full text-xs font-semibold bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 transition-colors cursor-pointer"
            >
              {t('pwa.gotIt')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
