'use client';

import { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  Clock,
  Code2,
  Globe,
  Users,
} from 'lucide-react';

interface CandidateMatch {
  candidate: {
    id: string;
    fullName: string;
    headline?: string;
    bio?: string;
    avatarUrl?: string;
    city?: string;
    status: string;
    primaryRole?: string;
    yearsExperience: number;
    availabilityHoursPerWeek: number;
    workArrangement: string;
    portfolioUrl?: string;
    githubUrl?: string;
    skills: { name: string; proficiency: string }[];
    featuredProjects: { title: string; liveUrl?: string; repoUrl?: string; description: string }[];
  };
  match: {
    score: number;
    isEligible: boolean;
    unmetMandatory: string[];
    matchingSkills: { name: string; proficiency: string; isMandatory: boolean }[];
    missingPreferredSkills: string[];
    explanation: string;
    dimensionScores: {
      requiredSkills: number;
      roleAlignment: number;
      proofOfWork: number;
      availability: number;
    };
  };
  applicationStatus: string | null;
}

function MatchesContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [oppTitle, setOppTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch(`/api/company/opportunities/${id}/matches`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to compute matches');
        } else {
          setMatches(data.matches || []);
          setOppTitle(data.opportunityTitle || 'Opportunity');
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [id]);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <Link
          href="/company/opportunities"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={14} /> Back to My Opportunities
        </Link>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--accent-primary)', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Sparkles size={14} /> Candidate Discovery & Suitability Engine
        </div>
        <h1 style={{ marginTop: '0.375rem' }}>Ranked Candidates for "{oppTitle}"</h1>
        <p style={{ marginTop: '0.25rem' }}>
          The backend automatically identified and ranked candidates matching your required skills, hours, and proof of work.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Evaluating candidates across 6 dimensions...
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && matches.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <h3>No matching candidates found</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            As more builders and students register their profiles, matching scores will update automatically.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {matches.map(({ candidate, match, applicationStatus }, index) => {
          const scoreClass =
            match.score >= 80 ? 'match-high' : match.score >= 50 ? 'match-mid' : 'match-low';

          return (
            <div key={candidate.id} className="card" style={{ padding: '1.75rem' }}>
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
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'var(--bg-muted)',
                      backgroundImage: candidate.avatarUrl ? `url(${candidate.avatarUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      flexShrink: 0,
                    }}
                  >
                    {!candidate.avatarUrl && candidate.fullName[0]}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        RANK #{index + 1}
                      </span>
                      <span style={{ color: 'var(--border-strong)' }}>•</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {candidate.status}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.375rem', margin: 0 }}>
                      <Link href={`/talent/${candidate.id}`}>{candidate.fullName}</Link>
                    </h2>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {candidate.primaryRole || 'Builder'} · {candidate.city || 'India'} ({candidate.workArrangement})
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                  <div className={`match-badge ${scoreClass}`} style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
                    <Sparkles size={14} />
                    <span>{match.score}% MATCH</span>
                  </div>
                  {applicationStatus && (
                    <span className={`status-pill status-${applicationStatus}`}>
                      Applied: {applicationStatus.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Match Explanation */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Why this candidate matches:</div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {match.explanation}
                </p>

                {match.unmetMandatory.length > 0 && (
                  <div style={{ marginTop: '0.5rem', color: 'var(--danger-text)', fontWeight: 500 }}>
                    <strong>Unmet mandatory constraints:</strong> {match.unmetMandatory.join('; ')}
                  </div>
                )}
              </div>

              {/* Shipped Proof of Work Preview */}
              {candidate.featuredProjects && candidate.featuredProjects.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                    Featured Proof of Work
                  </div>
                  {candidate.featuredProjects.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.75rem 1rem',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>{p.title}: </strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{p.description}</span>
                      <div style={{ marginTop: '0.375rem', display: 'flex', gap: '0.75rem' }}>
                        {p.liveUrl && (
                          <a href={p.liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ExternalLink size={12} /> Live Link
                          </a>
                        )}
                        {p.repoUrl && (
                          <a href={p.repoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Code2 size={12} /> GitHub Repo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills matched & actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.875rem' }}>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {match.matchingSkills.map((s, idx) => (
                    <span key={idx} className="skill-tag skill-tag-matched">
                      ✓ {s.name} ({s.proficiency})
                    </span>
                  ))}
                  {match.missingPreferredSkills.map((name, idx) => (
                    <span key={idx} className="skill-tag" style={{ borderStyle: 'dashed' }}>
                      + {name}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link href={`/talent/${candidate.id}`} className="btn btn-secondary btn-sm">
                    View Full Profile
                  </Link>
                  <Link href={`/company/opportunities/${id}/pipeline`} className="btn btn-primary btn-sm">
                    Open Pipeline
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OpportunityCandidateMatchesPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading candidate recommendations...</div>}>
      <MatchesContent {...props} />
    </Suspense>
  );
}
