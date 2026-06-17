// Demo mode: when on, the data layer returns local mock data instead of calling
// radar-backend, so the whole app is browsable before the backend is running.
// Tied to the same flag as mock auth (VITE_MOCK_AUTH in .env.local). Turn it off
// + point VITE_API_URL at the backend to go fully live — no code changes.
export const DEMO_MODE = import.meta.env.VITE_MOCK_AUTH === 'true';
