import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, User, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';

type Mode = 'signin' | 'signup';

const InputField = ({
  label, type, value, onChange, placeholder, icon: Icon, toggle, onToggle, error,
}: {
  label: string; type: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: React.ElementType; toggle?: boolean; onToggle?: () => void; error?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-slate-300 text-xs font-semibold tracking-wide uppercase">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
        <Icon size={16} />
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3.5 rounded-2xl text-white text-sm outline-none transition-all"
        style={{
          background: '#220f38',
          border: error ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(156,39,176,0.2)',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(233,30,140,0.6)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.6)' : 'rgba(156,39,176,0.2)')}
      />
      {toggle && (
        <button onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
          {type === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      )}
    </div>
    {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
  </div>
);

const strengthLabel = (pw: string) => {
  if (!pw) return null;
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (score <= 1) return { label: 'Weak', color: '#ef4444', pct: 25 };
  if (score === 2) return { label: 'Fair', color: '#f97316', pct: 50 };
  if (score === 3) return { label: 'Good', color: '#eab308', pct: 75 };
  return { label: 'Strong', color: '#22c55e', pct: 100 };
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [mode, setMode] = useState<Mode>('signup');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (form.password.length < 8) e.password = 'At least 8 characters';
    if (mode === 'signup' && form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setGlobalError('');
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } },
        });
        if (error) throw error;
        setUser(data.user);
        navigate('/setup', { replace: true });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        setUser(data.user);
        navigate('/explore', { replace: true });
      }
    } catch (err: unknown) {
      setGlobalError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const pw = form.password;
  const strength = strengthLabel(pw);

  return (
    <div className="screen-full flex flex-col overflow-y-auto" style={{ background: 'linear-gradient(160deg,#2a0845 0%,#1a0828 45%,#0d0614 100%)' }}>
      {/* Glow */}
      <div className="fixed top-0 left-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(233,30,140,0.14) 0%,transparent 70%)', filter: 'blur(50px)' }} />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(156,39,176,0.16) 0%,transparent 70%)', filter: 'blur(60px)' }} />

      <div className="flex-1 flex flex-col px-6" style={{ paddingTop: 'max(52px,env(safe-area-inset-top))', paddingBottom: 'max(28px,env(safe-area-inset-bottom))' }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center mb-6" style={{ background: '#220f38' }}>
          <ArrowLeft size={18} className="text-white" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-7">
          <img src="/logo.png" alt="Mechi" style={{ width: 36, height: 36, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(233,30,140,0.6))' }} />
          <span className="text-white font-black text-xl tracking-widest uppercase">Mechi</span>
        </div>

        {/* Heading */}
        <h1 className="text-white font-black text-3xl leading-tight mb-1">
          {mode === 'signup' ? 'Create your\naccount' : 'Welcome\nback'}
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          {mode === 'signup' ? 'Join thousands finding real connections.' : 'Sign in to continue your journey.'}
        </p>

        {/* Tabs */}
        <div className="flex rounded-2xl p-1 mb-6" style={{ background: '#220f38' }}>
          {(['signup', 'signin'] as Mode[]).map((m) => (
            <button key={m} onClick={() => { setMode(m); setGlobalError(''); setErrors({}); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ background: mode === m ? '#e91e8c' : 'transparent', color: mode === m ? '#fff' : '#94a3b8' }}>
              {m === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-4 flex-1">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <InputField label="Full Name" type="text" value={form.name} onChange={set('name')} placeholder="Your real name" icon={User} error={errors.name} />
              </motion.div>
            )}
          </AnimatePresence>

          <InputField label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" icon={Mail} error={errors.email} />
          <InputField label="Password" type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 characters" icon={Lock} toggle onToggle={() => setShowPw(!showPw)} error={errors.password} />

          {/* Password strength */}
          {mode === 'signup' && pw && strength && (
            <div className="space-y-1">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#220f38' }}>
                <motion.div animate={{ width: `${strength.pct}%` }} transition={{ duration: 0.3 }} className="h-full rounded-full" style={{ background: strength.color }} />
              </div>
              <p className="text-xs" style={{ color: strength.color }}>{strength.label} password</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div key="confirm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <InputField label="Confirm Password" type={showPw ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" icon={Lock} error={errors.confirm} />
              </motion.div>
            )}
          </AnimatePresence>

          {globalError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{globalError}</p>
            </div>
          )}

          {mode === 'signup' && (
            <p className="text-slate-500 text-[11px] leading-relaxed">
              By signing up you agree to our{' '}
              <Link to="/terms" className="text-brand-pink underline">Terms</Link>,{' '}
              <Link to="/privacy" className="text-brand-pink underline">Privacy Policy</Link>, and{' '}
              <Link to="/data-collection" className="text-brand-pink underline">Data Practices</Link>.
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-6 space-y-3">
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleSubmit} disabled={loading}
            className="w-full h-13 rounded-2xl font-black text-white text-base relative overflow-hidden"
            style={{ height: 52, background: 'linear-gradient(135deg,#e91e8c,#9c27b0)', boxShadow: '0 0 36px rgba(233,30,140,0.4)', opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </motion.button>


          <p className="text-center text-slate-500 text-[13px]">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setGlobalError(''); setErrors({}); }} className="font-semibold" style={{ color: '#e91e8c' }}>
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
