import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Mail, ShieldCheck, UserRound } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Loading from '../components/Loading.jsx';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const notify = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.get('/users/profile').then(({ data }) => { setProfile(data); setForm({ name: data.user.name, email: data.user.email }); })
      .catch((error) => notify(getErrorMessage(error), 'error')).finally(() => setLoading(false));
  }, [notify]);
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', form);
      await refreshUser();
      const { data } = await api.get('/users/profile');
      setProfile(data);
      notify('Profile updated successfully.');
    } catch (error) { notify(getErrorMessage(error), 'error'); }
    finally { setSaving(false); }
  }
  if (loading) return <Loading label="Loading your profile…" />;
  const initials = (user?.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="profile-page page-enter">
      <div className="page-heading-row"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile & settings</h1><p className="page-subtitle">The details that make this workspace yours.</p></div></div>
      <div className="profile-layout">
        <section className="panel profile-card">
          <div className="profile-card-cover"><div className="profile-avatar">{initials}</div></div>
          <div className="profile-card-body"><h2>{user?.name}</h2><p>{user?.email}</p>
            <div className="profile-metric"><span className="metric-icon"><CheckCircle2 size={17} /></span><span><strong>{profile?.taskCount ?? 0}</strong> tasks in your workspace</span></div>
            <div className="profile-metric"><span className="metric-icon"><CalendarDays size={17} /></span><span>Member since <strong>{profile?.user?.createdAt ? new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(profile.user.createdAt)) : 'today'}</strong></span></div>
          </div>
        </section>
        <section className="panel settings-card">
          <div className="settings-title"><div className="settings-icon"><UserRound size={18} /></div><div><h2>Personal information</h2><p>Update your name and email address.</p></div></div>
          <form className="form-stack profile-form" onSubmit={submit}>
            <label className="field-label">Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength="2" maxLength="80" required /></label>
            <label className="field-label">Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
            <div className="profile-note"><ShieldCheck size={17} /><span>Your account is private. Your tasks are only visible to you.</span></div>
            <div className="settings-actions"><button disabled={saving || (form.name === user?.name && form.email === user?.email)} className="button button-primary">{saving ? 'Saving…' : 'Save changes'}</button></div>
          </form>
        </section>
      </div>
      <div className="security-note"><Mail size={16} /><span>Need to change your password? Password management will be available in a future update.</span></div>
    </div>
  );
}
