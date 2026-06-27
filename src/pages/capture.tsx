import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { api, type CapturedInsight } from '../lib/api';
import { saveItem } from '../lib/saved';
import type { ContentItem } from '../lib/api';
import { useNavigate } from 'react-router-dom';

type CaptureState = 'input' | 'loading' | 'result' | 'error';

export function CapturePage() {
  const navigate = useNavigate();
  const [url, setUrl]           = useState('');
  const [state, setState]       = useState<CaptureState>('input');
  const [saving, setSaving]     = useState(false);
  const [result, setResult]     = useState<CapturedInsight | null>(null);
  const [error, setError]       = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const isValidUrl = (u: string) =>
    /^https?:\/\/.+\..+/i.test(u.trim());

  const handleCapture = useCallback(async () => {
    const trimmed = url.trim();
    if (!isValidUrl(trimmed)) {
      setError('Enter a valid URL starting with http:// or https://');
      return;
    }

    setState('loading');
    setError('');

    try {
      const insight = await api.capture(trimmed);
      setResult(insight);
      setState('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Capture failed. Check the URL and try again.');
      setState('error');
    }
  }, [url]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCapture();
  };

  const handleSaveToBrain = useCallback(() => {
    if (!result) return;
    setSaving(true);

    // Convert CapturedInsight → ContentItem → SavedItem
    const item: ContentItem = {
      id: 'capture:' + Date.now(),
      type: 'news',
      title: result.title,
      source: new URL(result.sourceUrl).hostname.replace(/^www\./, ''),
      duration: 0,
      articleUrl: result.sourceUrl,
      createdAt: new Date().toISOString(),
      summary: {
        id: 'capture:' + Date.now(),
        contentId: 'capture:' + Date.now(),
        summary: result.what,
        keyTakeaways: result.keyTakeaways,
        whyItMatters: result.why,
        what: result.what,
        howItMattersToYou: result.howItMattersToYou,
        glossary: result.glossary,
        tier: result.tier,
        nigeriaRelevance: result.nigeriaRelevance,
      },
    };

    saveItem(item);
    setSaving(false);
    // Flash saved confirmation, then navigate to brain
    setTimeout(() => navigate('/brain'), 1200);
  }, [result, navigate]);

  const handleTryAgain = () => {
    setState('input');
    setResult(null);
    setError('');
  };

  return (
    <div className="capture-page">
      {/* Page header */}
      <div className="capture-head">
        <p className="capture-kicker">Save & Summarize</p>
        <h1 className="capture-title">Capture</h1>
        <p className="capture-sub">Paste any URL to get an AI-powered insight preview — summarized, analyzed, and ready to save.</p>
      </div>

      {/* ── INPUT STATE ── */}
      {state === 'input' && (
        <div className="capture-input-area">
          <div className="capture-url-wrap">
            <Icon name="link" size={18} className="capture-url-icon" />
            <input
              ref={inputRef}
              className="capture-url-input"
              type="url"
              placeholder="Paste a URL — article, podcast, video…"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
            />
          </div>
          {error && <p className="capture-error">{error}</p>}
          <button
            className="btn btn--primary capture-go"
            onClick={handleCapture}
            disabled={!url.trim()}
          >
            <Icon name="spark" size={18} />
            Capture & Summarize
          </button>

          <div className="capture-hints">
            <div className="capture-hint">
              <Icon name="feed" size={14} />
              <span>News articles & analysis</span>
            </div>
            <div className="capture-hint">
              <Icon name="headphones" size={14} />
              <span>Podcast episodes & transcripts</span>
            </div>
            <div className="capture-hint">
              <Icon name="play" size={14} />
              <span>Video clips & YouTube links</span>
            </div>
          </div>
        </div>
      )}

      {/* ── LOADING STATE ── */}
      {state === 'loading' && (
        <div className="capture-loading">
          <div className="capture-loading-ring" />
          <div className="capture-loading-text">
            <h3>Reading & analyzing…</h3>
            <p>Radar AI is extracting key insights from this page.</p>
          </div>
          <div className="capture-shimmer">
            <div className="capture-shimmer__line" style={{ width: '75%' }} />
            <div className="capture-shimmer__line" style={{ width: '55%' }} />
            <div className="capture-shimmer__line" style={{ width: '65%' }} />
            <div className="capture-shimmer__line capture-shimmer__line--short" style={{ width: '40%' }} />
          </div>
        </div>
      )}

      {/* ── ERROR STATE ── */}
      {state === 'error' && (
        <div className="capture-error-state">
          <Icon name="x" size={40} />
          <h3>Could not capture</h3>
          <p>{error}</p>
          <div className="capture-error-actions">
            <button className="btn" onClick={handleTryAgain}>
              <Icon name="left" size={16} /> Try again
            </button>
            <button className="btn btn--primary" onClick={() => {
              setError('');
              setState('input');
            }}>
              Edit URL
            </button>
          </div>
        </div>
      )}

      {/* ── RESULT STATE ── */}
      {state === 'result' && result && (
        <div className="capture-result">
          {/* Source URL bar */}
          <div className="capture-result-bar">
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="capture-result-url"
            >
              <Icon name="link" size={13} />
              <span>{result.sourceUrl.replace(/^https?:\/\//, '').replace(/\/.*/, '')}</span>
            </a>
            <span className="capture-badge capture-badge--tier">
              Tier {result.tier}
            </span>
            {result.nigeriaRelevance >= 2 && (
              <span className="capture-badge capture-badge--ng">🇳🇬 Nigeria</span>
            )}
          </div>

          {/* Title */}
          <h2 className="capture-result-title">{result.title}</h2>

          {/* What */}
          {result.what && (
            <section className="capture-section">
              <h3 className="capture-section-label capture-section-label--what">What</h3>
              <p className="capture-prose">{result.what}</p>
            </section>
          )}

          {/* Key Takeaways */}
          {result.keyTakeaways.length > 0 && (
            <section className="capture-section">
              <h3 className="capture-section-label capture-section-label--takeaways">Key Takeaways</h3>
              <ul className="capture-takeaways">
                {result.keyTakeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Why It Matters */}
          {result.why && (
            <section className="capture-section">
              <h3 className="capture-section-label capture-section-label--why">Why It Matters</h3>
              <p className="capture-prose">{result.why}</p>
            </section>
          )}

          {/* How It Matters to You */}
          {result.howItMattersToYou && (
            <section className="capture-section capture-section--edge">
              <div className="capture-section-label-amber">
                <span className="capture-dot-amber" />
                <span>THE EDGE</span>
              </div>
              <p className="capture-edge-text">{result.howItMattersToYou}</p>
            </section>
          )}

          {/* Glossary */}
          {result.glossary.length > 0 && (
            <section className="capture-section capture-section--glossary">
              <h3 className="capture-section-label capture-section-label--glossary">Glossary</h3>
              {result.glossary.map((entry, i) => {
                const colon = entry.indexOf(':');
                const term = colon > -1 ? entry.slice(0, colon).trim() : entry;
                const def = colon > -1 ? entry.slice(colon + 1).trim() : '';
                return (
                  <div key={i} className="capture-gloss-entry">
                    <span className="capture-gloss-term">{term}</span>
                    <span className="capture-gloss-def">{def}</span>
                  </div>
                );
              })}
            </section>
          )}

          {/* Action bar */}
          <div className="capture-actions">
            <button className="btn" onClick={handleTryAgain}>
              <Icon name="left" size={16} /> New capture
            </button>
            <button className="btn btn--primary" onClick={handleSaveToBrain} disabled={saving}>
              {saving ? (
                <>Saving…</>
              ) : (
                <><Icon name="brain" size={18} /> Save to Brain</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── SAVING overlay ── */}
      {saving && (
        <div className="capture-saved-overlay">
          <div className="capture-saved-card">
            <Icon name="check" size={32} />
            <h3>Saved to your brain</h3>
            <p>This insight is now in your Knowledge Web.</p>
          </div>
        </div>
      )}
    </div>
  );
}
