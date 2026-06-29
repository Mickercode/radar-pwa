import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { api, type CapturedInsight } from '../lib/api';
import { saveItem } from '../lib/saved';
import type { ContentItem } from '../lib/api';
import { useNavigate } from 'react-router-dom';

type CaptureMode  = 'link' | 'file';
type CaptureState = 'input' | 'loading' | 'result' | 'error';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];
const ACCEPTED_EXTS = '.pdf,.doc,.docx,.txt';
const MAX_FILE_MB   = 10;

function fileLabel(f: File): string {
  const mb = (f.size / (1024 * 1024)).toFixed(1);
  return `${f.name} · ${mb} MB`;
}

export function CapturePage() {
  const navigate = useNavigate();

  const [mode, setMode]         = useState<CaptureMode>('link');
  const [state, setState]       = useState<CaptureState>('input');
  const [url, setUrl]           = useState('');
  const [file, setFile]         = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult]     = useState<CapturedInsight | null>(null);
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  const urlRef  = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (mode === 'link') urlRef.current?.focus(); }, [mode]);

  // ── Validation ─────────────────────────────────────────────────────────────

  const isValidUrl = (u: string) => /^https?:\/\/.+\..+/i.test(u.trim());

  function validateFile(f: File): string | null {
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.match(/\.(pdf|docx?|txt)$/i)) {
      return 'Only PDF, Word (.doc/.docx), or text (.txt) files are supported.';
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      return `File is too large. Maximum size is ${MAX_FILE_MB} MB.`;
    }
    return null;
  }

  // ── File selection ──────────────────────────────────────────────────────────

  function pickFile(f: File) {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setFile(f);
    setError('');
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }

  // ── Capture ─────────────────────────────────────────────────────────────────

  const handleCapture = useCallback(async () => {
    setError('');

    if (mode === 'link') {
      if (!isValidUrl(url)) {
        setError('Enter a valid URL starting with https://');
        return;
      }
      setState('loading');
      try {
        setResult(await api.capture(url.trim()));
        setState('result');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Capture failed. Check the URL and try again.');
        setState('error');
      }
      return;
    }

    // File mode
    if (!file) { setError('Choose a file first.'); return; }
    setState('loading');
    try {
      setResult(await api.analyseFile(file));
      setState('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not analyse file. Try again.');
      setState('error');
    }
  }, [mode, url, file]);

  // ── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    if (!result) return;
    setSaving(true);

    const sourceHost = result.sourceUrl
      ? (() => { try { return new URL(result.sourceUrl).hostname.replace(/^www\./, ''); } catch { return result.sourceUrl; } })()
      : (file?.name ?? 'uploaded file');

    const item: ContentItem = {
      id: 'capture:' + Date.now(),
      type: 'news',
      title: result.title,
      source: sourceHost,
      duration: 0,
      articleUrl: result.sourceUrl ?? undefined,
      createdAt: new Date().toISOString(),
      summary: {
        id: 'cap:' + Date.now(),
        contentId: 'cap:' + Date.now(),
        summary: result.what,
        keyTakeaways: result.keyTakeaways ?? [],
        whyItMatters: result.why,
        what: result.what,
        howItMattersToYou: result.howItMattersToYou,
        glossary: result.glossary ?? [],
        tier: result.tier,
        nigeriaRelevance: result.nigeriaRelevance,
      },
    };

    saveItem(item);
    setSaving(false);
    setTimeout(() => navigate('/saved'), 1000);
  }, [result, file, navigate]);

  const reset = () => {
    setState('input');
    setResult(null);
    setError('');
    setFile(null);
  };

  // ── Shared result view ───────────────────────────────────────────────────────

  if (state === 'result' && result) {
    return (
      <div className="capture-page">
        <div className="capture-result">
          {/* Source bar */}
          <div className="capture-result-bar">
            {result.sourceUrl ? (
              <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer" className="capture-result-url">
                <Icon name="link" size={13} />
                <span>{(() => { try { return new URL(result.sourceUrl).hostname.replace(/^www\./, ''); } catch { return result.sourceUrl; } })()}</span>
              </a>
            ) : (
              <span className="capture-result-url">
                <Icon name="upload" size={13} />
                <span>{file?.name ?? 'Uploaded file'}</span>
              </span>
            )}
            <span className="capture-badge capture-badge--tier">Tier {result.tier}</span>
            {result.nigeriaRelevance >= 2 && (
              <span className="capture-badge capture-badge--ng">🇳🇬 Nigeria</span>
            )}
          </div>

          <h2 className="capture-result-title">{result.title}</h2>

          {result.what && (
            <section className="capture-section">
              <h3 className="capture-section-label capture-section-label--what">What</h3>
              <p className="capture-prose">{result.what}</p>
            </section>
          )}

          {(result.keyTakeaways?.length ?? 0) > 0 && (
            <section className="capture-section">
              <h3 className="capture-section-label capture-section-label--takeaways">Key Takeaways</h3>
              <ul className="capture-takeaways">
                {result.keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </section>
          )}

          {result.why && (
            <section className="capture-section">
              <h3 className="capture-section-label capture-section-label--why">Why It Matters</h3>
              <p className="capture-prose">{result.why}</p>
            </section>
          )}

          {result.howItMattersToYou && (
            <section className="capture-section capture-section--edge">
              <div className="capture-section-label-amber">
                <span className="capture-dot-amber" />
                <span>THE EDGE</span>
              </div>
              <p className="capture-edge-text">{result.howItMattersToYou}</p>
            </section>
          )}

          {(result.glossary?.length ?? 0) > 0 && (
            <section className="capture-section capture-section--glossary">
              <h3 className="capture-section-label capture-section-label--glossary">Glossary</h3>
              {result.glossary.map((entry, i) => {
                const colon = entry.indexOf(':');
                const term = colon > -1 ? entry.slice(0, colon).trim() : entry;
                const def  = colon > -1 ? entry.slice(colon + 1).trim() : '';
                return (
                  <div key={i} className="capture-gloss-entry">
                    <span className="capture-gloss-term">{term}</span>
                    <span className="capture-gloss-def">{def}</span>
                  </div>
                );
              })}
            </section>
          )}

          <div className="capture-actions">
            <button className="btn" onClick={reset}>
              <Icon name="left" size={16} /> New capture
            </button>
            <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : <><Icon name="bookmark" size={18} /> Save to Knowledge</>}
            </button>
          </div>
        </div>

        {saving && (
          <div className="capture-saved-overlay">
            <div className="capture-saved-card">
              <Icon name="check" size={32} />
              <h3>Saved!</h3>
              <p>Opening My Knowledge…</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Input / loading / error ───────────────────────────────────────────────────

  return (
    <div className="capture-page">
      <div className="capture-head">
        <p className="capture-kicker">Save & Understand</p>
        <h1 className="capture-title">Capture</h1>
        <p className="capture-sub">
          Paste a link or upload a file — Radar AI turns it into a sharp, readable insight.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="capture-tabs">
        <button
          className={`capture-tab${mode === 'link' ? ' capture-tab--active' : ''}`}
          onClick={() => { setMode('link'); reset(); }}
        >
          <Icon name="link" size={15} /> Link
        </button>
        <button
          className={`capture-tab${mode === 'file' ? ' capture-tab--active' : ''}`}
          onClick={() => { setMode('file'); reset(); }}
        >
          <Icon name="upload" size={15} /> File
        </button>
      </div>

      {/* ── LOADING ── */}
      {state === 'loading' && (
        <div className="capture-loading">
          <div className="capture-loading-ring" />
          <div className="capture-loading-text">
            <h3>{mode === 'file' ? 'Reading your file…' : 'Reading & analysing…'}</h3>
            <p>Radar AI is extracting key insights{mode === 'file' ? ' from your document' : ' from this page'}.</p>
          </div>
          <div className="capture-shimmer">
            <div className="capture-shimmer__line" style={{ width: '75%' }} />
            <div className="capture-shimmer__line" style={{ width: '55%' }} />
            <div className="capture-shimmer__line" style={{ width: '65%' }} />
            <div className="capture-shimmer__line capture-shimmer__line--short" style={{ width: '40%' }} />
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {state === 'error' && (
        <div className="capture-error-state">
          <Icon name="x" size={40} />
          <h3>Could not capture</h3>
          <p>{error}</p>
          <div className="capture-error-actions">
            <button className="btn" onClick={reset}>
              <Icon name="left" size={16} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* ── INPUT: LINK ── */}
      {state === 'input' && mode === 'link' && (
        <div className="capture-input-area">
          <div className="capture-url-wrap">
            <Icon name="link" size={18} className="capture-url-icon" />
            <input
              ref={urlRef}
              className="capture-url-input"
              type="url"
              placeholder="Paste a URL — article, podcast, video…"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
              spellCheck={false}
            />
            {url && (
              <button className="capture-url-clear" onClick={() => setUrl('')} aria-label="Clear">
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          {error && <p className="capture-error">{error}</p>}
          <button
            className="btn btn--primary capture-go"
            onClick={handleCapture}
            disabled={!url.trim()}
          >
            <Icon name="spark" size={18} />
            Capture & Summarise
          </button>

          <div className="capture-hints">
            <div className="capture-hint"><Icon name="feed" size={14} /><span>News articles & analysis</span></div>
            <div className="capture-hint"><Icon name="headphones" size={14} /><span>Podcast episodes</span></div>
            <div className="capture-hint"><Icon name="play" size={14} /><span>YouTube videos</span></div>
          </div>
        </div>
      )}

      {/* ── INPUT: FILE ── */}
      {state === 'input' && mode === 'file' && (
        <div className="capture-input-area">
          {/* Drop zone */}
          <div
            className={`capture-dropzone${dragOver ? ' capture-dropzone--over' : ''}${file ? ' capture-dropzone--has-file' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            aria-label="Choose file to upload"
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_EXTS}
              className="capture-file-input"
              onChange={onFileInput}
            />
            {file ? (
              <div className="capture-dropzone-file">
                <Icon name="save" size={28} />
                <p className="capture-dropzone-name">{fileLabel(file)}</p>
                <p className="capture-dropzone-change">Tap to change</p>
              </div>
            ) : (
              <div className="capture-dropzone-empty">
                <Icon name="upload" size={36} />
                <p className="capture-dropzone-label">
                  {dragOver ? 'Drop it!' : 'Tap to choose a file'}
                </p>
                <p className="capture-dropzone-hint">PDF · Word (.doc / .docx) · Plain text (.txt)</p>
                <p className="capture-dropzone-hint">Max {MAX_FILE_MB} MB · 5 free uploads/month</p>
              </div>
            )}
          </div>

          {error && <p className="capture-error">{error}</p>}

          <button
            className="btn btn--primary capture-go"
            onClick={handleCapture}
            disabled={!file}
          >
            <Icon name="spark" size={18} />
            Analyse File
          </button>

          <div className="capture-hints">
            <div className="capture-hint"><Icon name="save" size={14} /><span>Research papers & reports</span></div>
            <div className="capture-hint"><Icon name="notebook" size={14} /><span>Study notes & textbooks</span></div>
            <div className="capture-hint"><Icon name="feed" size={14} /><span>Business documents & contracts</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
