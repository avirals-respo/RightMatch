'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: React.FormEvent, customEmail?: string, customPassword?: string) {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = customEmail || email;
    const targetPassword = customPassword || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to authenticate');
        setLoading(false);
        return;
      }

      // Route based on role
      if (data.user.role === 'CANDIDATE') {
        router.push('/candidate/matches');
      } else if (data.user.role === 'COMPANY') {
        router.push('/company/opportunities');
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch {
      setError('An error occurred. Please verify your connection.');
      setLoading(false);
    }
  }

  function quickLogin(roleEmail: string) {
    setEmail(roleEmail);
    setPassword('Password123!');
    handleLogin(undefined, roleEmail, 'Password123!');
  }

  return (
    <div style={{ padding: '4rem 1.5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Lock size={20} color="var(--accent-primary)" />
          </div>
          <h1>Sign in to your account</h1>
          <p style={{ marginTop: '0.5rem' }}>
            Discover personalized opportunity matches or manage your talent pipeline.
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div
          className="card"
          style={{
            background: 'var(--bg-subtle)',
            border: '1px dashed var(--border-strong)',
            padding: '1.25rem',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
            <Sparkles size={14} color="var(--accent-primary)" />
            <span>Instant Demo Logins (Click to Enter)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => quickLogin('ananya@university.edu')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              id="quick-login-ananya"
            >
              <span>Ananya Sharma (Candidate / Student)</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>CANDIDATE</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('karan@nexuslabs.co')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              id="quick-login-karan"
            >
              <span>Karan (Nexus Labs Founder / Recruiter)</span>
              <span style={{ fontSize: '0.6875rem', color: '#0369a1', fontWeight: 600 }}>STARTUP</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('admin@opportunity.internal')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              id="quick-login-admin"
            >
              <span>Platform Administrator</span>
              <span style={{ fontSize: '0.6875rem', color: '#15803d', fontWeight: 600 }}>ADMIN</span>
            </button>
          </div>
        </div>

        <div className="card">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                required
                className="input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">
                Password
              </label>
              <input
                id="password-input"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              id="submit-login-btn"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            Don't have an account yet?{' '}
            <Link href="/register" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
