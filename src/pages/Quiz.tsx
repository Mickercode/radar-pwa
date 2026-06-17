import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../features/insights/queries';
import { submitQuizAttempt } from '../features/insights/insightsApi';
import { Icon } from '../components/Icon';

// Screen 2.7 — Quiz session (per insight).
export default function Quiz() {
  const { insightId } = useParams();
  const navigate = useNavigate();
  const { data: questions = [], isLoading } = useQuiz(insightId);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const score = answers.reduce((n, a, qi) => n + (a === questions[qi]?.correctIndex ? 1 : 0), 0);

  useEffect(() => {
    if (done && insightId && questions.length) {
      submitQuizAttempt(insightId, score, questions.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (isLoading) return <div className="rise"><div className="skeleton" style={{ height: 280 }} /></div>;
  if (questions.length === 0) {
    return (
      <div className="empty rise">
        <h3>No quiz available</h3>
        <button className="btn btn--ghost" onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="empty rise">
        <Icon name="spark" size={40} className="gradient-text" />
        <h3>{score} / {questions.length} correct</h3>
        <p>{score === questions.length ? 'Locked in. You understood this.' : 'Worth another review to make it stick.'}</p>
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
          <button className="btn btn--ghost" onClick={() => { setIdx(0); setPicked(null); setAnswers([]); setDone(false); }}>Retry</button>
          <button className="btn btn--primary" onClick={() => navigate(-1)}>Done</button>
        </div>
      </div>
    );
  }

  const q = questions[idx]!;

  function next() {
    if (picked === null) return;
    const nextAnswers = [...answers, picked];
    setAnswers(nextAnswers);
    if (idx + 1 >= questions.length) setDone(true);
    else { setIdx(idx + 1); setPicked(null); }
  }

  return (
    <div className="rise" style={{ maxWidth: 600, margin: '0 auto' }}>
      <header className="page-head">
        <div className="page-kicker">Question {idx + 1} of {questions.length}</div>
      </header>

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--step-2)', letterSpacing: '-0.01em', marginBottom: '1.5rem' }}>
        {q.question}
      </h2>

      <div className="stack">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          const reveal = picked !== null;
          let border = 'var(--border)';
          if (reveal && isCorrect) border = 'var(--lime)';
          else if (reveal && i === picked) border = 'var(--coral)';
          return (
            <button
              key={i}
              className="listrow"
              style={{ borderColor: border, cursor: reveal ? 'default' : 'pointer' }}
              disabled={reveal}
              onClick={() => setPicked(i)}
            >
              <div className="listrow__main"><div className="listrow__title" style={{ whiteSpace: 'normal' }}>{opt}</div></div>
              {reveal && isCorrect && <Icon name="check" size={18} className="listrow__chev" />}
              {reveal && i === picked && !isCorrect && <Icon name="x" size={18} className="listrow__chev" />}
            </button>
          );
        })}
      </div>

      <div className="actionbar">
        <button className="btn btn--primary btn--block" disabled={picked === null} onClick={next}>
          {idx + 1 >= questions.length ? 'See score' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
