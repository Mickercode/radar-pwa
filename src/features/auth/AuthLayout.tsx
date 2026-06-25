import type { ReactNode } from 'react';
import './auth.css';

/** Split brand-hero + form layout shared by sign-in and sign-up. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth__hero">
        <div className="auth__wordmark">
          <img src="/assets/logo-banner.png" alt="Radar" className="auth__logo" />
        </div>
        <div>
          <h1 className="auth__pitch">
            Understand once.
            <br />
            <span className="gradient-text">Remember forever.</span>
          </h1>
          <p className="auth__sub">
            Your second brain for the signals that matter — tech, business, science. Built for
            Nigeria.
          </p>
        </div>
        <div className="auth__chips">
          <span className="badge">What · Why · Edge</span>
          <span className="badge">Knowledge graph</span>
          <span className="badge">Spaced recall</span>
        </div>
      </aside>

      <main className="auth__panel">
        <div className="auth__form">
          <div className="auth__mobilebrand">
            <img src="/assets/logo-icon.png" alt="Radar" className="auth__moblogo" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
