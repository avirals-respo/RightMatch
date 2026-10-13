'use client';

import { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  ExternalLink,
} from 'lucide-react';

interface OpportunityDetail {
  id: string;
  title: string;
  category: string;
  description: string;
  responsibilities?: string;
  eligibilityCriteria?: string;
  workArrangement: string;
  location: string;
  hoursPerWeekMin: number;
  compensationAmount?: string;
  duration?: string;
  openingsCount: number;
  createdAt: string;
  org: {
    id: string;
    name: string;
    website?: string;
    industry?: string;
    size?: string;
    description?: string;
    location?: string;
    verified: boolean;
  };
  skills: { id: string; name: string; isMandatory: boolean }[];
}

interface ViewerMatch {
  score: number;
  isEligible: boolean;
  unmetMandatory: string[];
  matchingSkills: { name: string; proficiency: string; isMandatory: boolean }[];
  missingPreferredSkills: string[];
  explanation: string;
}

function OpportunityDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [opp, setOpp] = useState<OpportunityDetail | null>(null);
  const [viewerMatch, setViewerMatch] = useState<ViewerMatch | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [pitch, setPitch] = useState('');
  const [portfolioHighlight, setPortfolioHighlight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/opportunities/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Opportunity not found');
        } else {
          setOpp(data.opportunity);
          setViewerMatch(data.viewerMatch);
          setHasApplied(data.hasApplied);
          setApplicationStatus(data.applicationStatus);
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setApplySuccess('');

    try {
      const res = await fetch('/api/candidate/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: id,
          pitch,
          portfolioHighlight,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to apply');
      } else {
        setApplySuccess('Application successfully submitted!');
        setHasApplied(true);
        setApplicationStatus('SUBMITTED');
        setTimeout(() => {
          setShowApplyModal(false);
        }, 1500);
      }
    } catch {
      alert('Network error submitting application');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading opportunity details...</div>;
  }

  if (!opp) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Opportunity not found.</div>;
  }

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href="/opportunities"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={14} /> Back to All Opportunities
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--accent-primary)',
            }}
          >
            {opp.category.replace('_', ' ')}
          </span>
          <span style={{ color: 'var(--border-strong)' }}>•</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{opp.org.name}</span>
          {opp.org.verified && (
            <span title="Verified Startup" style={{ color: '#0369a1' }}>
              <ShieldCheck size={16} />
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{opp.title}</h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={15} /> {opp.location} ({opp.workArrangement})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={15} /> Min {opp.hoursPerWeekMin} hrs/week
          </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {opp.compensationAmount || 'Stipend Disclosed'}
          </span>
          <span>Duration: {opp.duration || '3 months'}</span>
        </div>
      </div>

      {/* Personalized Match Card (for Logged-in Candidates) */}
      {viewerMatch && (
        <div
          className="card"
          style={{
            border: viewerMatch.isEligible ? '1px solid var(--success-border)' : '1px solid var(--border-subtle)',
            background: viewerMatch.isEligible ? 'var(--success-bg)' : 'var(--bg-subtle)',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Your Algorithmic Match Score</h3>
            </div>
            <div
              className={`match-badge ${viewerMatch.score >= 80 ? 'match-high' : 'match-mid'}`}
              style={{ fontSize: '0.875rem' }}
            >
              {viewerMatch.score}% MATCH
            </div>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {viewerMatch.explanation}
          </p>

          {viewerMatch.unmetMandatory.length > 0 && (
            <div style={{ marginTop: '0.625rem', color: 'var(--danger-text)', fontSize: '0.8125rem', fontWeight: 500 }}>
              <strong>Unmet Mandatory Constraints:</strong> {viewerMatch.unmetMandatory.join('; ')}
            </div>
          )}
        </div>
      )}

      {/* Apply / Status Action Section */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2.5rem',
          background: 'var(--bg-canvas)',
        }}
      >
        <div>
          {hasApplied ? (
            <div>
              <span className={`status-pill status-${applicationStatus}`}>
                Status: {applicationStatus?.replace('_', ' ')}
              </span>
              <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                Your application is in the recruiter review queue.
              </p>
            </div>
          ) : (
            <div>
              <strong style={{ fontSize: '0.9375rem' }}>Interested in this role?</strong>
              <p style={{ fontSize: '0.8125rem', margin: 0 }}>
                {viewerMatch ? 'Your profile attributes will be sent directly to the founder.' : 'Sign in or join to express interest and apply.'}
              </p>
            </div>
          )}
        </div>

        <div>
          {hasApplied ? (
            <Link href="/candidate/applications" className="btn btn-secondary btn-sm">
              View In Applications
            </Link>
          ) : viewerMatch ? (
            <button
              type="button"
              onClick={() => setShowApplyModal(true)}
              className="btn btn-accent"
              id="detail-apply-btn"
            >
              <Send size={15} /> Apply with Profile
            </button>
          ) : (
            <Link href="/register?role=CANDIDATE" className="btn btn-accent btn-sm">
              Create Profile to Apply
            </Link>
          )}
        </div>
      </div>

      {/* Main Opportunity Content */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>About the Role</h3>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '2rem' }}>
          {opp.description}
        </p>

        {opp.responsibilities && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Responsibilities</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {opp.responsibilities}
            </p>
          </div>
        )}

        {opp.eligibilityCriteria && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Eligibility & Requirements</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {opp.eligibilityCriteria}
            </p>
          </div>
        )}

        <h3 style={{ marginBottom: '0.75rem' }}>Skills & Competencies</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {opp.skills.map((s) => (
            <span
              key={s.id}
              className={`skill-tag ${s.isMandatory ? 'skill-tag-mandatory' : ''}`}
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
            >
              {s.name} {s.isMandatory ? '(Required)' : '(Preferred Bonus)'}
            </span>
          ))}
        </div>
      </div>

      {/* Organization Information */}
      <div className="card">
        <h3 style={{ marginBottom: '0.5rem' }}>About {opp.org.name}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
          {opp.org.description || 'Fast-growing technology startup.'}
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {opp.org.industry && <span>Industry: {opp.org.industry}</span>}
          {opp.org.size && <span>Team: {opp.org.size} people</span>}
          {opp.org.website && (
            <a href={opp.org.website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
              Visit Website <ExternalLink size={12} style={{ display: 'inline' }} />
            </a>
          )}
        </div>
      </div>

      {/* Modal Application Form */}
      {showApplyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '540px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Apply to {opp.title}</h3>
                <p style={{ fontSize: '0.8125rem', margin: 0 }}>at {opp.org.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <X size={18} />
              </button>
            </div>

            {applySuccess && <div className="alert alert-success">{applySuccess}</div>}

            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">High-Agency Pitch Note</label>
                <textarea
                  required
                  rows={4}
                  className="textarea"
                  placeholder="Tell the founder why your proof of work and skills are an ideal fit for this role..."
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Proof of Work Highlight Link (Optional)</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://github.com/... or deployed project"
                  value={portfolioHighlight}
                  onChange={(e) => setPortfolioHighlight(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-accent"
                  id="confirm-detail-apply-btn"
                >
                  {submitting ? 'Submitting...' : 'Confirm & Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OpportunityDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading opportunity details...</div>}>
      <OpportunityDetailContent {...props} />
    </Suspense>
  );
}
