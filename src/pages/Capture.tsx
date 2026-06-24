import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaptureUrl, useSaveInsight } from '../features/insights/queries';
import { uploadFile } from '../features/content/contentApi';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import type { CapturedInsight } from '../lib/types';

// Screen 4.1/4.3 — Save to Radar: URL → AI preview → save as insight.
// (File/PDF upload + the job-polling loader need new backend endpoints — see
//  BACKEND_HANDOFF.md. /capture is synchronous, so the loader is just a spinner.)
export default function Capture() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const capture = useCaptureUrl();
  const save = useSaveInsight();
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<CapturedInsight | null>(null);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  function analyse(e: React.FormEvent) {
    e.preventDefault();
    if (!/^https?:\/\//.test(url.trim())) return setError('Enter a link starting with http(s)://');
    setError('');
    capture.mutate(url.trim(), {
      onSuccess: setPreview,
      onError: () => setError('Couldn\'t analyse that link. Try another.'),
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, Word document, or text file.');
      return;
    }

    setFile(selectedFile);
    setError('');

    try {
      const result = await uploadFile(selectedFile);
      setPreview(result);
    } catch {
      setError('Couldn\'t analyse that file. Try another.');
    }
  }

  function commit() {
    if (!preview) return;
    save.mutate(
      { title: preview.title, what: preview.what, why: preview.why, edge: preview.edge, tier: preview.tier },
      {
        onSuccess: () => {
          toast('Saved to your brain', 'check');
          navigate('/brain');
        },
      },
    );
  }

  if (capture.isPending) {
    return (
      <div className="empty rise">
        <Icon name="spark" size={40} className="gradient-text" />
        <h3>Reading your link…</h3>
        <p>Distilling it into What · Why · Edge. Usually a few seconds.</p>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="rise" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="subhead">
          <button className="backbtn" onClick={() => setPreview(null)}><Icon name="left" size={20} /></button>
          <span className="page-kicker">Preview</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--step-2)', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>{preview.title}</h1>
        <div className="section"><div className="section__label"><span className="dot" /> What</div><p className="lead">{preview.what}</p></div>
        <div className="section"><div className="section__label"><span className="dot" style={{ background: 'var(--purple)' }} /> Why</div><p className="prose">{preview.why}</p></div>
        <div className="section"><div className="section__label"><span className="dot" style={{ background: 'var(--amber)' }} /> Edge</div><p className="prose" style={{ color: 'var(--text)' }}>{preview.edge}</p></div>
        <div className="actionbar">
          <button className="btn btn--ghost" onClick={() => setPreview(null)}>Discard</button>
          <button className="btn btn--primary" disabled={save.isPending} onClick={commit}>
            <Icon name="save" size={18} /> {save.isPending ? 'Saving…' : 'Save to brain'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rise" style={{ maxWidth: 560, margin: '0 auto' }}>
      <header className="page-head">
        <div className="page-kicker">Save to Radar</div>
        <h1 className="page-title">Capture a link</h1>
        <p className="page-sub">Paste any article, tweet, or webpage. Radar distills it.</p>
      </header>

      <form onSubmit={analyse} className="stack">
        {error && <div className="alert alert--error">{error}</div>}
        <input
          className="input"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          inputMode="url"
          autoCapitalize="none"
        />
        <button className="btn btn--primary btn--block" type="submit">
          <Icon name="spark" size={18} /> Analyse
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ height: '1px', background: 'var(--border)', flex: 1 }} />
          <span style={{ fontSize: 'var(--step--1)', color: 'var(--text-muted)' }}>OR</span>
          <div style={{ height: '1px', background: 'var(--border)', flex: 1 }} />
        </div>
        <div className="stack">
          <label className="btn btn--ghost btn--block" style={{ cursor: 'pointer' }}>
            <Icon name="upload" size={18} /> Upload PDF or Word document
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          {file && (
            <div className="listrow" style={{ borderColor: 'var(--cyan)' }}>
              <div className="listrow__main">
                <div className="listrow__title">{file.name}</div>
                <div className="listrow__sub" style={{ fontSize: 'var(--step--1)' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <Icon name="check" size={18} className="listrow__chev" style={{ color: 'var(--cyan)' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
