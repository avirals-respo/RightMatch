'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface ApplicationItem {
  id: string;
  status: string;
  pitch?: string;
  portfolioHighlight?: string;
  matchScoreAtApplication?: number;
  createdAt: string;
  opportunity: {
    id: string;
    title: string;
    category: string;
    location: string;
    workArrangement: string;
    org: {
      name: string;
      logoUrl?: string;
    };
  };
}

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const res = await fetch('/api/candidate/applications');
        const data = await res.json();
        if (res.ok) {
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const statusDescriptions: Record<string, string> = {
    SUBMITTED: 'Application received and securely registered in startup review queue.',
    UNDER_REVIEW: 'Hiring team is actively reviewing your proof of work and pitch.',
    SHORTLISTED: 'Congratulations! Your profile has been shortlisted for next steps.',
    INTERVIEW: 'An interview round or founder conversation has been scheduled.',
    OFFERED: 'Official offer extended by the company.',
    REJECTED: 'Position filled or candidate profile not moving forward.',
    HIRED: 'Hired and onboarding onto the startup team!',
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1>My Applications & Status Pipeline</h1>
        <p style={{ marginTop: '0.25rem' }}>
          Track the real-time status of your applications and updates from hiring teams.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading your applications...
        </div>
      )}

      {!loading && applications.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <h3>No applications submitted yet</h3>
          <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
            Browse your high-compatibility matches and apply to startup opportunities with 1 click.
          </p>
          <Link href="/candidate/matches" className="btn btn-accent">
            Discover Matching Opportunities
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {applications.map((app) => (
          <div key={app.id} className="card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {app.opportunity.org.name}
                  </span>
                  <span style={{ color: 'var(--border-strong)' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {app.opportunity.category.replace('_', ' ')}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                  <Link href={`/opportunities/${app.opportunity.id}`}>
                    {app.opportunity.title}
                  </Link>
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {app.matchScoreAtApplication && (
                  <span className="match-badge match-high">
                    <Sparkles size={12} /> {app.matchScoreAtApplication}% Match
                  </span>
                )}
                <span className={`status-pill status-${app.status}`}>
                  {app.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Status explanation */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
              }}
            >
              {statusDescriptions[app.status] || 'Status updated by recruiter.'}
            </div>

            {app.pitch && (
              <div style={{ fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Your pitch: </strong>
                <span style={{ color: 'var(--text-secondary)' }}>"{app.pitch}"</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
              <Link
                href={`/opportunities/${app.opportunity.id}`}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                View Opportunity <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
