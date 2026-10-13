'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  MapPin,
  ArrowRight,
  ExternalLink,
  Send,
  X,
  ShieldCheck,
} from 'lucide-react';

interface MatchItem {
  opportunity: {
    id: string;
    title: string;
    category: string;
    description: string;
    responsibilities?: string;
    eligibilityCriteria?: string;
    workArrangement: string;
    location: string;
    hoursPerWeekMin: number;
    compensationType: string;
    compensationAmount?: string;
    duration?: string;
    org: {
      id: string;
      name: string;
      logoUrl?: string;
      verified: boolean;
      industry?: string;
    };
  };
  match: {
    score: number;
    isEligible: boolean;
    unmetMandatory: string[];
    matchingSkills: { name: string; proficiency: string; isMandatory: boolean }[];
    missingPreferredSkills: string[];
    missingInformation: string[];
    explanation: string;
    dimensionScores: {
      requiredSkills: number;
      roleAlignment: number;
      proofOfWork: number;
      availability: number;
      locationWorkMode: number;
      preferredSkills: number;
    };
  };
  applicationStatus: string | null;
  isSaved: boolean;
}

export default function CandidateMatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application Modal state
  const [selectedOpp, setSelectedOpp] = useState<MatchItem | null>(null);
  const [pitch, setPitch] = useState('');
  const [portfolioHighlight, setPortfolioHighlight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');

  async function loadMatches() {
    try {
      const res = await fetch('/api/candidate/matches');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to compute matches');
      } else {
        setMatches(data.matches || []);
      }
    } catch {
      setError('Network error while computing matches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, []);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOpp) return;
    setSubmitting(true);
    setApplySuccess('');

    try {
      const res = await fetch('/api/candidate/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: selectedOpp.opportunity.id,
          pitch,
          portfolioHighlight,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to submit application');
      } else {
        setApplySuccess('Application successfully submitted!');
        // Update local state
        setMatches((prev) =>
          prev.map((m) =>
            m.opportunity.id === selectedOpp.opportunity.id
              ? { ...m, applicationStatus: 'SUBMITTED' }
              : m
          )
        );
        setTimeout(() => {
          setSelectedOpp(null);
          setApplySuccess('');
          setPitch('');
          setPortfolioHighlight('');
        }, 1500);
      }
    } catch {
      alert('Network error submitting application');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--accent-primary)', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Sparkles size={14} /> Deterministic Matching Engine
        </div>
        <h1 style={{ marginTop: '0.375rem' }}>Your Recommended Opportunities</h1>
        <p style={{ marginTop: '0.25rem' }}>
          Real-time algorithmic compatibility evaluated against your verified skills, proof-of-work projects, and availability.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Computing weighted multi-dimension compatibility scores...
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && matches.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <h3>No matching opportunities yet</h3>
          <p style={{ maxWidth: '480px', margin: '0.5rem auto 1.5rem' }}>
            Ensure your profile has your skills, available hours, and proof of work so the matching engine can evaluate active listings.
          </p>
          <Link href="/candidate/profile" className="btn btn-primary">
            Update Profile & Skills
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {matches.map(({ opportunity, match, applicationStatus }) => {
          const scoreClass =
            match.score >= 80 ? 'match-high' : match.score >= 50 ? 'match-mid' : 'match-low';

          return (
            <div key={opportunity.id} className="card" style={{ padding: '1.75rem' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {opportunity.category.replace('_', ' ')}
                    </span>
                    <span style={{ color: 'var(--border-strong)' }}>•</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {opportunity.org.name}
                    </span>
                    {opportunity.org.verified && (
                      <span title="Verified Startup" style={{ color: '#0369a1' }}>
                        <ShieldCheck size={16} />
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.375rem', marginBottom: '0.25rem' }}>
                    <Link href={`/opportunities/${opportunity.id}`} style={{ color: 'inherit' }}>
                      {opportunity.title}
                    </Link>
                  </h2>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      flexWrap: 'wrap',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.375rem',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} /> {opportunity.location} ({opportunity.workArrangement})
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} /> Min {opportunity.hoursPerWeekMin} hrs/week
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {opportunity.compensationAmount || 'Disclosed upon review'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div className={`match-badge ${scoreClass}`} style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
                    <Sparkles size={14} />
                    <span>{match.score}% MATCH</span>
                  </div>
                  {match.isEligible ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--success-text)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Eligible Candidate
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger-text)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={13} /> Hard Constraint Mismatch
                    </span>
                  )}
                </div>
              </div>

              {/* Match Explanation Box */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span>Why you matched:</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {match.explanation}
                </p>

                {match.unmetMandatory.length > 0 && (
                  <div style={{ marginTop: '0.625rem', color: 'var(--danger-text)', fontWeight: 500 }}>
                    <strong>Unmet requirements:</strong> {match.unmetMandatory.join('; ')}
                  </div>
                )}

                {/* Dimension Scores Breakdown */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div>Required Skills: <strong style={{ color: 'var(--text-primary)' }}>{match.dimensionScores.requiredSkills}%</strong></div>
                  <div>Role Alignment: <strong style={{ color: 'var(--text-primary)' }}>{match.dimensionScores.roleAlignment}%</strong></div>
                  <div>Proof of Work: <strong style={{ color: 'var(--text-primary)' }}>{match.dimensionScores.proofOfWork}%</strong></div>
                  <div>Availability: <strong style={{ color: 'var(--text-primary)' }}>{match.dimensionScores.availability}%</strong></div>
                </div>
              </div>

              {/* Matching Skills vs Missing Preferred */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matching Skills:</span>
                  {match.matchingSkills.map((s, idx) => (
                    <span key={idx} className="skill-tag skill-tag-matched">
                      ✓ {s.name} ({s.proficiency})
                    </span>
                  ))}
                  {match.missingPreferredSkills.length > 0 && (
                    <>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        Missing Preferred:
                      </span>
                      {match.missingPreferredSkills.map((name, idx) => (
                        <span key={idx} className="skill-tag" style={{ borderStyle: 'dashed' }}>
                          + {name}
                        </span>
                      ))}
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link href={`/opportunities/${opportunity.id}`} className="btn btn-ghost btn-sm">
                    View Role <ExternalLink size={14} />
                  </Link>

                  {applicationStatus ? (
                    <span className={`status-pill status-${applicationStatus}`}>
                      Status: {applicationStatus.replace('_', ' ')}
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedOpp({ opportunity, match, applicationStatus, isSaved: false });
                        setPitch('');
                      }}
                      className="btn btn-accent btn-sm"
                      id={`apply-btn-${opportunity.id}`}
                    >
                      <Send size={14} /> Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Pitch Modal */}
      {selectedOpp && (
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
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'var(--bg-surface)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="match-badge match-high" style={{ marginBottom: '0.25rem' }}>
                  {selectedOpp.match.score}% MATCH
                </span>
                <h3 style={{ marginTop: '0.25rem' }}>Apply for {selectedOpp.opportunity.title}</h3>
                <p style={{ fontSize: '0.8125rem' }}>at {selectedOpp.opportunity.org.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {applySuccess && <div className="alert alert-success">{applySuccess}</div>}

            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">
                  Your High-Agency Pitch / Intro Note
                </label>
                <textarea
                  required
                  rows={4}
                  className="textarea"
                  placeholder="Explain why you are excited, relevant proof of work, and how your skills align with what the startup is building..."
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                />
                <span className="form-hint">
                  Keep it concise, direct, and evidence-focused.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Featured Project / Proof-of-Work Link (Optional)
                </label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://github.com/your-username/project or live URL"
                  value={portfolioHighlight}
                  onChange={(e) => setPortfolioHighlight(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-accent"
                  id="confirm-submit-application"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
