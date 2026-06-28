import { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { usePwaInstall } from '../lib/usePwaInstall';

const DISMISS_KEY = 'radar:pwa-banner-dismissed';

export function PwaInstall() {
  const { canInstall, install, isIOS, isStandalone, isInstalled } = usePwaInstall();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1'; }
    catch { return false; }
  });
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  // Don't show at all if running as installed PWA
  if (isStandalone || isInstalled) return null;
  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
  }

  async function handleInstall() {
    setInstalling(true);
    const accepted = await install();
    setInstalling(false);
    if (accepted) { setInstalled(true); setTimeout(() => dismiss(), 1500); }
  }

  if (installed) {
    return (
      <div className="pwa-banner pwa-banner--success" role="status">
        <Icon name="check" size={18} className="pwa-banner__icon" />
        <span>Radar installed!</span>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="pwa-banner" role="dialog" aria-label="Install Radar">
        <img src="/assets/logo-icon.jpeg" alt="" className="pwa-banner__app-icon" />
        <div className="pwa-banner__text">
          <strong>Install Radar</strong>
          <span>Tap <Icon name="clip" size={13} className="pwa-banner__inline-icon" /> Share → <strong>Add to Home Screen</strong></span>
        </div>
        <button className="pwa-banner__close" onClick={dismiss} aria-label="Dismiss">
          <Icon name="x" size={16} />
        </button>
      </div>
    );
  }

  if (canInstall) {
    return (
      <div className="pwa-banner" role="dialog" aria-label="Install Radar">
        <img src="/assets/logo-icon.jpeg" alt="" className="pwa-banner__app-icon" />
        <div className="pwa-banner__text">
          <strong>Install Radar</strong>
          <span>Add to home screen for offline access</span>
        </div>
        <button
          className="pwa-banner__install-btn"
          onClick={handleInstall}
          disabled={installing}
        >
          {installing ? <span className="auth-spinner" /> : 'Install'}
        </button>
        <button className="pwa-banner__close" onClick={dismiss} aria-label="Dismiss">
          <Icon name="x" size={16} />
        </button>
      </div>
    );
  }

  return null;
}

// Standalone install button for use in Settings / Profile — always visible if not installed
export function PwaInstallButton({ className = '' }: { className?: string }) {
  const { canInstall, install, isIOS, isStandalone, isInstalled } = usePwaInstall();
  const [installing, setInstalling] = useState(false);
  const [done, setDone] = useState(false);

  // Reset done flag when effect fires
  useEffect(() => { if (done) { const t = setTimeout(() => setDone(false), 2000); return () => clearTimeout(t); } }, [done]);

  if (isStandalone || isInstalled) {
    return (
      <button className={`pwa-install-btn pwa-install-btn--installed ${className}`} disabled>
        <Icon name="check" size={16} /> Installed
      </button>
    );
  }

  if (isIOS) {
    return (
      <div className={`pwa-install-ios ${className}`}>
        <Icon name="clip" size={16} />
        <span>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong></span>
      </div>
    );
  }

  if (canInstall) {
    return (
      <button
        className={`pwa-install-btn ${className}`}
        onClick={async () => {
          setInstalling(true);
          await install();
          setInstalling(false);
          setDone(true);
        }}
        disabled={installing}
      >
        {installing ? <span className="auth-spinner" /> : done ? <><Icon name="check" size={16} /> Done!</> : <><Icon name="download" size={16} /> Install Radar</>}
      </button>
    );
  }

  return null;
}
