import '../pages/feed.css';

// Temporary placeholder for screens not yet built (chunks 2+).
export function Stub({ title, note }: { title: string; note: string }) {
  return (
    <div className="stub rise">
      <span className="badge">Coming next</span>
      <h2>{title}</h2>
      <p>{note}</p>
    </div>
  );
}
