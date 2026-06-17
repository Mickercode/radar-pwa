import { Icon } from './Icon';
import { useToast } from './Toast';

interface Props {
  title: string;
  summary: string;
  url?: string;
  onClose: () => void;
}

// Custom Radar-branded share sheet (not the OS sheet) — the WhatsApp viral hook.
export function ShareSheet({ title, summary, url, onClose }: Props) {
  const { toast } = useToast();
  const link = url || window.location.href;
  const text = `${title}\n\n${summary}\n\nvia Radar`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${text}\n${link}`)}`;

  function copy() {
    navigator.clipboard?.writeText(link);
    toast('Link copied', 'check');
    onClose();
  }
  async function more() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: link });
      } catch {
        /* cancelled */
      }
    } else {
      copy();
    }
  }

  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet__backdrop" />
      <div className="sheet__panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="page-kicker">Share</span>
          <button className="backbtn" onClick={onClose} aria-label="Close" style={{ width: 34, height: 34 }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Branded preview card */}
        <div className="card" style={{ padding: '1.1rem', marginBottom: '1.25rem', borderBottom: '3px solid var(--cyan)' }}>
          <div className="badge" style={{ color: 'var(--cyan)', borderColor: 'rgba(34,211,238,.3)' }}>via Radar</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--step-1)', margin: '0.6rem 0 0.4rem' }}>
            {title}
          </h3>
          <p className="prose" style={{ fontSize: 'var(--step--1)' }}>{summary}</p>
        </div>

        <div className="stack">
          <button className="btn btn--primary btn--block" onClick={() => window.open(whatsapp, '_blank')}>
            Share to WhatsApp
          </button>
          <button className="btn btn--ghost btn--block" onClick={copy}>
            <Icon name="link" size={18} />
            Copy link
          </button>
          <button className="btn btn--ghost btn--block" onClick={more}>
            <Icon name="share" size={18} />
            More…
          </button>
        </div>
      </div>
    </div>
  );
}
