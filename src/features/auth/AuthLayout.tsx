import type { ReactNode } from 'react';
import './auth.css';

function Wordmark() {
  return (
    <span className="auth__bars" aria-hidden>
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

/** Split brand-hero + form layout shared by sign-in and sign-up. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth__hero">
        <div className="auth__wordmark">
          <Wordmark />
          Radar
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
            <Wordmark />
            Radar
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
