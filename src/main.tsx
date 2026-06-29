import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// ── Global 401 interceptor ────────────────────────────────────────────────────
// Patch window.fetch once at startup. Any response with status 401 means the
// JWT has expired or been revoked — clear the stored auth and send the user to
// /login. The original response is still returned so callers can read the body.
const _origFetch = window.fetch.bind(window);
window.fetch = async (...args) => {
  const res = await _origFetch(...args);
  if (res.status === 401 && window.location.pathname !== '/login') {
    // Dynamically import to avoid circular deps at module init time
    import('./lib/auth').then(({ clearAuth }) => {
      clearAuth();
      window.location.replace('/login');
    });
  }
  return res;
};

// ─────────────────────────────────────────────────────────────────────────────

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
