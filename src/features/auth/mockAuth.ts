import type { Session } from '../../lib/types';
import { DEMO_MODE } from '../../lib/demo';

// DEV-ONLY mock auth. Active only when VITE_MOCK_AUTH=true (set in .env.local,
// never in production). Lets you use the app before radar-backend is running:
// sign-in/sign-up resolve to a local session instead of calling the API.
// Remove the .env.local flag (or set it false) to use the real backend.
export const MOCK_AUTH = DEMO_MODE;

function base64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Build a JWT-shaped token with a far-future exp (signature is a placeholder —
 *  the frontend only decodes `exp`, it never verifies). */
export function mockSession(email: string, name: string | null): Session {
  const id = `demo-${email.toLowerCase()}`;
  const header = base64url({ alg: 'HS256', typ: 'JWT' });
  const payload = base64url({ sub: id, email, name, exp: 9999999999 });
  return {
    token: `${header}.${payload}.mock`,
    user: { id, email, name },
  };
}
