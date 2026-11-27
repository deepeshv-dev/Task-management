import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckSquare2, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Auth({ mode }) {
  const register = mode === 'register';
  const { user, signIn } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;
  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await api.post(`/auth/${register ? 'register' : 'login'}`, form);
      signIn(data.user); notify(register ? 'Your workspace is ready. Welcome!' : 'Welcome back.'); navigate('/');
    } catch (err) { const message = getErrorMessage(err); setError(message); }
    finally { setLoading(false); }
  }
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Link to="/login" className="brand auth-brand"><div className="brand-mark"><CheckSquare2 size={20} strokeWidth={2.5} /></div><span>task<span className="brand-accent">flow</span></span></Link>
        <div className="auth-aside-content"><div className="auth-orbit"><div className="orbit-ring orbit-ring-one" /><div className="orbit-ring orbit-ring-two" /><div className="orbit-core"><CheckSquare2 size={32} /></div><span className="orbit-dot dot-one">✦</span><span className="orbit-dot dot-two">✓</span><span className="orbit-dot dot-three">·</span></div><p className="eyebrow">A CLEARER WAY TO WORK</p><h2>Make room for<br />what matters.</h2><p className="auth-aside-copy">One thoughtful step at a time. Your plans, your pace, your progress.</p></div>
        <div className="auth-aside-bottom"><span>✳</span> A calmer way to get things done</div>
      </aside>
      <main className="auth-main"><Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to home</Link><div className="auth-form-wrap">
        <div className="auth-mobile-brand"><div className="brand-mark"><CheckSquare2 size={19} /></div><strong>task<span className="brand-accent">flow</span></strong></div>
        <div className="auth-form-heading"><div className="auth-heading-icon"><Sparkles size={19} /></div><p className="eyebrow">{register ? 'A FRESH START' : 'YOUR SPACE IS WAITING'}</p><h1>{register ? 'Create your account' : 'Welcome back'}</h1><p>{register ? 'Start with a clear mind and a clean slate.' : 'Sign in and pick up right where you left off.'}</p></div>
        <form className="form-stack auth-form" onSubmit={submit}>
          {register && <label className="field-label">Your name<div className="input-with-icon"><UserRound size={17} /><input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Alex Morgan" minLength="2" maxLength="80" required /></div></label>}
          <label className="field-label">Email address<div className="input-with-icon"><Mail size={17} /><input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required /></div></label>
          <label className="field-label">Password<div className="input-with-icon"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={register ? 'At least 8 characters' : 'Enter your password'} minLength={register ? 8 : undefined} required /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {error && <div className="form-error auth-error">{error}</div>}
          <button className="button button-primary auth-submit" disabled={loading}>{loading ? 'One moment…' : register ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></button>
        </form>
        <p className="auth-switch">{register ? 'Already have an account?' : 'New to Taskflow?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>
        <p className="auth-privacy"><LockKeyhole size={13} /> Your data is encrypted and private.</p>
      </div><div className="auth-footer">© {new Date().getFullYear()} Taskflow <span>·</span> Thoughtfully organized.</div></main>
    </div>
  );
}
