import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

import { Suspense } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RightMatch | Community & Proof-of-Work Opportunity Platform',
  description:
    'A transparent matching platform connecting ambitious 18–24 builders, students, and freelancers with fast-growing startups based on verified proof of work.',
  keywords: [
    'talent matching',
    'student internships',
    'startup jobs',
    'proof of work',
    'freelancers',
    'builder community',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<header className="site-header" style={{ height: 64 }} />}>
          <Navbar />
        </Suspense>
        <main style={{ flex: 1 }}>{children}</main>
        <footer
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-subtle)',
            padding: '2.5rem 0',
            marginTop: 'auto',
          }}
        >
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                RightMatch · Proof-of-Work Talent & Opportunity Network
              </p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                Designed for high-agency young builders, freshers, and ambitious startups.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>Deterministic Matching</span>
              <span>•</span>
              <span>Privacy-First</span>
              <span>•</span>
              <span>PostgreSQL & SQLite Architecture</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
