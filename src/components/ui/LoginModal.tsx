import React, { useState } from 'react';
import { X, User } from 'phosphor-react';
import { supabase } from '../../lib/supabaseClient';

type Mode = 'sign-in' | 'sign-up';

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const close = () => {
    setError(null);
    setNotice(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    const { error } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === 'sign-up') {
      setNotice('Check your inbox to confirm your email, then sign in.');
      setMode('sign-in');
      return;
    }

    close();
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={close} />
      <div className="relative w-full max-w-sm rounded-[var(--radius-lg)] bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] shadow-[var(--shadow-md)] p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={close}
          className="absolute top-4 right-4 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <User size={18} className="text-[var(--color-primary)]" />
          <h2 className="text-[18px] font-bold tracking-tight text-[var(--color-text-primary)]">
            {mode === 'sign-in' ? 'Sign in to Reecap' : 'Create your account'}
          </h2>
        </div>
        <p className="text-[12px] text-[var(--color-text-secondary)] mb-5">
          {mode === 'sign-in' ? 'Sign in to sync your plan and usage.' : 'Free accounts start on the Free tier — upgrade any time.'}
        </p>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          />

          {error && <p className="text-[12px] text-red-500">{error}</p>}
          {notice && <p className="text-[12px] text-emerald-500">{notice}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(null); setNotice(null); }}
          className="mt-4 w-full text-center text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
