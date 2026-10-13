'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Building2, CheckCircle2 } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'COMPANY' ? 'COMPANY' : 'CANDIDATE';

  const [role, setRole] = useState<'CANDIDATE' | 'COMPANY'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          fullName: role === 'CANDIDATE' ? fullName : undefined,
          orgName: role === 'COMPANY' ? orgName : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      if (role === 'CANDIDATE') {
        router.push('/candidate/profile');
      } else {
        router.push('/company/opportunities/new');
      }
      router.refresh();
    } catch {
      setError('An error occurred during account creation.');
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '4rem 1.5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1>Create your account</h1>
          <p style={{ marginTop: '0.5rem' }}>
            Join the community-driven opportunity and proof-of-work talent network.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('CANDIDATE')}
            className="card"
            style={{
              padding: '1rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderColor: role === 'CANDIDATE' ? 'var(--text-primary)' : 'var(--border-subtle)',
              background: role === 'CANDIDATE' ? 'var(--bg-surface)' : 'var(--bg-subtle)',
              boxShadow: role === 'CANDIDATE' ? 'var(--shadow-sm)' : 'none',
            }}
            id="role-select-candidate"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <User size={18} color={role === 'CANDIDATE' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
              <strong style={{ fontSize: '0.875rem' }}>Young Builder</strong>
            </div>
            <p style={{ fontSize: '0.75rem', margin: 0 }}>Student, fresher, or freelancer seeking opportunities</p>
          </button>

          <button
            type="button"
            onClick={() => setRole('COMPANY')}
            className="card"
            style={{
              padding: '1rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderColor: role === 'COMPANY' ? 'var(--text-primary)' : 'var(--border-subtle)',
              background: role === 'COMPANY' ? 'var(--bg-surface)' : 'var(--bg-subtle)',
              boxShadow: role === 'COMPANY' ? 'var(--shadow-sm)' : 'none',
            }}
            id="role-select-company"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Building2 size={18} color={role === 'COMPANY' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
              <strong style={{ fontSize: '0.875rem' }}>Startup / Recruiter</strong>
            </div>
            <p style={{ fontSize: '0.75rem', margin: 0 }}>Founders and hiring teams discovering emerging talent</p>
          </button>
        </div>

        <div className="card">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleRegister}>
            {role === 'CANDIDATE' ? (
              <div className="form-group">
                <label className="form-label" htmlFor="name-input">
                  Your Full Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Ananya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" htmlFor="org-input">
                  Startup or Organization Name
                </label>
                <input
                  id="org-input"
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Nexus Labs"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                required
                className="input"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">
                Create Password
              </label>
              <input
                id="password-input"
                type="password"
                required
                minLength={6}
                className="input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="form-hint">Must be at least 6 characters long</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              id="submit-register-btn"
            >
              {loading ? 'Creating Account...' : role === 'CANDIDATE' ? 'Join as Builder' : 'Create Organization Account'}
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
            Already have an account?{' '}
            <Link href="/login" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
