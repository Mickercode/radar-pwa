import { useEffect, useState } from 'react';
import { Icon } from './Icon';

// Captures the `beforeinstallprompt` event (fired by Chrome on supported
// browsers) and renders a dismissible banner prompting the user to install
// Radar as a standalone app.
//
// The event only fires once per page load; `window.matchMedia` checks for iOS
// Safari which uses a different installation path (Share → Add to Home Screen),
// so we show a text hint on those devices instead.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SUPPORTS_PWA = 'serviceWorker' in navigator;

export function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  // Detect installation state
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setInstalled(true);
    }
  }, []);

  // Listen for the install prompt (Chrome/Android)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Once the app is installed, hide the prompt silently
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setInstalled(true);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // iOS detection: show a text hint instead of a button
  // Check both userAgent and touch support (catches iPadOS 13+ in desktop mode)
  const isIOS =
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (/Mac|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document)) &&
    !(window as any).MSStream;

  // Don't show if already installed, dismissed, or PWA isn't supported
  if (installed || dismissed || !SUPPORTS_PWA) return null;

  // iOS: show a hint about using Share → Add to Home Screen
  if (isIOS && !dismissed) {
    return (
      <div className="pwa-install" style={{ display: dismissed ? 'none' : undefined }}>
        <div className="pwa-install__body">
          <Icon name="clip" size={20} />
          <span>Install Radar: tap <strong>Share</strong> → <strong>Add to Home Screen</strong></span>
          <button className="pwa-install__close" onClick={() => setDismissed(true)} aria-label="Dismiss">
            <Icon name="x" size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Android/Chrome: show an install button
  if (deferredPrompt) {
    const handleInstall = async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setDeferredPrompt(null);
    };

    return (
      <div className="pwa-install">
        <div className="pwa-install__body">
          <Icon name="clip" size={20} />
          <span>Install Radar for the best experience</span>
          <button className="btn pwa-install__btn" onClick={handleInstall}>
            <Icon name="download" size={16} /> Install
          </button>
          <button className="pwa-install__close" onClick={() => setDismissed(true)} aria-label="Dismiss">
            <Icon name="x" size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
