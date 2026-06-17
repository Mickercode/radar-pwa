import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';

// Screen 5.4 — Subscription. UI only — Paystack/billing endpoints are not built
// yet (see BACKEND_HANDOFF.md). Buttons are non-functional placeholders.
const PREMIUM = [
  'Unlimited link + PDF analysis',
  'Full knowledge graph',
  'Spaced repetition reviews',
  'Quiz generation',
  'Weekly digest',
];

export default function Subscription() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="rise" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="subhead">
        <button className="backbtn" onClick={() => navigate(-1)}><Icon name="left" size={20} /></button>
        <span className="page-kicker">Subscription</span>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="page-kicker" style={{ color: 'var(--text-dim)' }}>Your plan</span>
        <span className="badge">Free</span>
      </div>

      <div className="card" style={{ padding: '1.5rem', borderBottom: '3px solid var(--amber)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--step-2)' }}>Premium ★</h2>
        <ul className="takeaways" style={{ margin: '1rem 0 1.5rem' }}>
          {PREMIUM.map((f) => <li key={f}>{f}</li>)}
        </ul>
        <div className="stack">
          <button className="btn btn--primary btn--block" onClick={() => toast('Payments coming soon', 'clock')}>
            Monthly — ₦1,500 / month
          </button>
          <button className="btn btn--ghost btn--block" onClick={() => toast('Payments coming soon', 'clock')}>
            Annual — ₦15,000 / year · Save 17%
          </button>
        </div>
      </div>
    </div>
  );
}
