'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Compass,
  Users,
  Briefcase,
  Bell,
  Sparkles,
  LogOut,
  ShieldCheck,
  User,
  PlusCircle,
} from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN';
  candidateProfile?: { fullName: string; id: string } | null;
  organization?: { name: string; id: string } | null;
  unreadNotificationsCount?: number;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="container nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" className="brand-logo" id="nav-brand-logo">
            <span className="brand-dot" />
            <span>RightMatch</span>
          </Link>

          <nav className="nav-links">
            <Link
              href="/opportunities"
              className={`nav-link ${pathname.startsWith('/opportunities') ? 'active' : ''}`}
            >
              Opportunities
            </Link>
            <Link
              href="/talent"
              className={`nav-link ${pathname.startsWith('/talent') ? 'active' : ''}`}
            >
              Talent Directory
            </Link>
            <Link
              href="/how-it-works"
              className={`nav-link ${pathname === '/how-it-works' ? 'active' : ''}`}
            >
              How Matching Works
            </Link>

            {user?.role === 'CANDIDATE' && (
              <>
                <Link
                  href="/candidate/matches"
                  className={`nav-link ${pathname === '/candidate/matches' ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', fontWeight: 600 }}
                >
                  <Sparkles size={14} /> My Matches
                </Link>
                <Link
                  href="/candidate/applications"
                  className={`nav-link ${pathname === '/candidate/applications' ? 'active' : ''}`}
                >
                  My Applications
                </Link>
              </>
            )}

            {user?.role === 'COMPANY' && (
              <>
                <Link
                  href="/company/opportunities"
                  className={`nav-link ${pathname.startsWith('/company/opportunities') ? 'active' : ''}`}
                >
                  My Opportunities
                </Link>
                <Link
                  href="/company/opportunities/new"
                  className={`nav-link ${pathname === '/company/opportunities/new' ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <PlusCircle size={14} /> Post Role
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                style={{ color: '#0369a1', fontWeight: 600 }}
              >
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {!loading && !user && (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm" id="nav-login-btn">
                Log In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm" id="nav-register-btn">
                Join Platform
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link
                href="/notifications"
                className="btn btn-ghost btn-sm"
                title="Notifications"
                style={{ position: 'relative', padding: '0.5rem' }}
                id="nav-notifications-btn"
              >
                <Bell size={18} />
                {(user.unreadNotificationsCount || 0) > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'var(--accent-primary)',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {user.unreadNotificationsCount}
                  </span>
                )}
              </Link>

              {user.role === 'CANDIDATE' && (
                <Link href="/candidate/profile" className="btn btn-secondary btn-sm" id="nav-profile-btn">
                  <User size={14} />
                  <span>{user.candidateProfile?.fullName?.split(' ')[0] || 'Profile'}</span>
                </Link>
              )}

              {user.role === 'COMPANY' && (
                <Link href="/company/organization" className="btn btn-secondary btn-sm" id="nav-company-btn">
                  <Briefcase size={14} />
                  <span>{user.organization?.name || 'Company'}</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Sign out"
                id="nav-logout-btn"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
