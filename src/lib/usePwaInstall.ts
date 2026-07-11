import { useEffect, useState, useCallback } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function usePwaInstall() {
  // Seed from the globally pre-captured event (set in main.tsx before React mounts)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => (window as Window & { _pwaPrompt?: BeforeInstallPromptEvent })._pwaPrompt ?? null
  );
  const [installed, setInstalled] = useState(false);

  const isIOS =
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (/Mac|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document)) &&
    !(window as Window & { MSStream?: unknown }).MSStream;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  useEffect(() => {
    // Catch any future firings (e.g. prompt dismissed then re-shown by browser)
    const handler = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      (window as Window & { _pwaPrompt?: BeforeInstallPromptEvent })._pwaPrompt = prompt;
      setDeferredPrompt(prompt);
    };
    const installedHandler = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
    (window as Window & { _pwaPrompt?: BeforeInstallPromptEvent })._pwaPrompt = undefined;
    return outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt,
    install,
    isIOS,
    isStandalone,
    isInstalled: installed,
  };
}
