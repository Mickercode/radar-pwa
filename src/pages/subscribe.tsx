import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, getToken } from '../lib/auth';
import { Icon } from '../components/Icon';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

type Plan = 'monthly' | 'annual';

interface SubStatus {
  plan: string;
  renewsAt: string | null;
}

async function fetchStatus(): Promise<SubStatus> {
  const token = getToken();
  const res = await fetch(`${BASE}/subscription`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed (${res.status})`);
  return res.json() as Promise<SubStatus>;
}

async function initCheckout(plan: Plan): Promise<{ authorizationUrl: string }> {
  const token = getToken();
  const res = await fetch(`${BASE}/subscription/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; message?: string };
    throw new Error(err.error ?? err.message ?? `Failed (${res.status})`);
  }
  return res.json() as Promise<{ authorizationUrl: string }>;
}

async function cancelSub(): Promise<void> {
  const token = getToken();
  const res = await fetch(`${BASE}/subscription/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Cancel failed (${res.status})`);
}

const PERKS = [
  'Ad-free experience',
  'Unlimited article captures',
  'Early access to new features',
  'Priority AI summaries',
  'Daily digest newsletter',
  'Spaced repetition reviews',
];

export function SubscribePage() {
  const navigate   = useNavigate();
  const user       = useAuth(s => s.user);
  const [params]   = useSearchParams();
  const [plan, setPlan]       = useState<Plan>('monthly');
  const [status, setStatus]   = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const successRef = params.get('success');

  useEffect(() => {
    if (!user) return;
    fetchStatus().then(setStatus).catch(() => {});
  }, [user]);

  const isPremium = status?.plan === 'premium' || status?.plan === 'monthly' || status?.plan === 'annual';

  async function handleSubscribe() {
    if (!user) { navigate('/login'); return; }
    setError('');
    setLoading(true);
    try {
      const { authorizationUrl } = await initCheckout(plan);
      window.location.href = authorizationUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally { setLoading(false); }
  }

  async function handleCancel() {
    if (!cancelConfirm) { setCancelConfirm(true); return; }
    setLoading(true);
    try {
      await cancelSub();
      setStatus({ plan: 'free', renewsAt: null });
      setCancelConfirm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancel failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="subscribe-page">
      <div className="page-head">
        <div className="page-kicker">Membership</div>
        <h1 className="page-title">Radar Premium</h1>
      </div>

      {successRef && (
        <div className="sub-success-banner">
          <Icon name="check" size={18} /> Payment successful! Your premium access is now active.
        </div>
      )}

      {isPremium ? (
        <div className="sub-active">
          <div className="sub-active__badge">
            <Icon name="spark" size={28} />
            <span>Premium Active</span>
          </div>
          <p className="sub-active__detail">
            {status?.renewsAt
              ? `Renews ${new Date(status.renewsAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : 'No expiry date on record'}
          </p>

          <div className="sub-perks">
            {PERKS.map(p => (
              <div key={p} className="sub-perk">
                <Icon name="check" size={15} className="sub-perk__check" />
                <span>{p}</span>
              </div>
            ))}
          </div>

          {error && <p className="auth-error">{error}</p>}
          <button
            className={`btn${cancelConfirm ? ' btn--danger' : ' btn--ghost'} sub-cancel-btn`}
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : cancelConfirm ? 'Confirm cancel' : 'Cancel subscription'}
          </button>
          {cancelConfirm && <p className="sub-cancel-warn">You'll lose access at the end of your billing period.</p>}
        </div>
      ) : (
        <>
          <p className="sub-tagline">
            Go deeper with Radar. Unlimited knowledge, no distractions.
          </p>

          {/* Plan toggle */}
          <div className="sub-plans">
            <button
              className={`sub-plan${plan === 'monthly' ? ' sub-plan--active' : ''}`}
              onClick={() => setPlan('monthly')}
            >
              <span className="sub-plan__name">Monthly</span>
              <span className="sub-plan__price">₦2,000<span className="sub-plan__per">/mo</span></span>
            </button>
            <button
              className={`sub-plan${plan === 'annual' ? ' sub-plan--active' : ''}`}
              onClick={() => setPlan('annual')}
            >
              <span className="sub-plan__name">Annual</span>
              <span className="sub-plan__price">₦15,000<span className="sub-plan__per">/yr</span></span>
              <span className="sub-plan__badge">Save 37%</span>
            </button>
          </div>

          {/* Perks list */}
          <div className="sub-perks">
            {PERKS.map(p => (
              <div key={p} className="sub-perk">
                <Icon name="check" size={15} className="sub-perk__check" />
                <span>{p}</span>
              </div>
            ))}
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="btn btn--primary sub-cta" onClick={handleSubscribe} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : <>
              <Icon name="spark" size={16} />
              {user ? `Subscribe ${plan === 'monthly' ? '— ₦2,000/mo' : '— ₦15,000/yr'}` : 'Sign in to subscribe'}
            </>}
          </button>

          <p className="sub-disclaimer">
            Secure payment via Paystack. Cancel any time. Prices in Nigerian Naira (₦).
          </p>
        </>
      )}
    </div>
  );
}
