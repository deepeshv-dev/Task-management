export default function Loading({ label = 'Loading your workspace…' }) {
  return <div className="loading-screen"><span className="spinner" /><span>{label}</span></div>;
}
