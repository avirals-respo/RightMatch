'use client';

import { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ExternalLink,
  Code2,
  Link2,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface CandidateProfile {
  id: string;
  fullName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  status: string;
  primaryRole?: string;
  yearsExperience: number;
  availabilityHoursPerWeek: number;
  workArrangement: string;
  startDate?: string;
  expectedCompensation?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  skills: { id: string; name: string; proficiency: string }[];
  projects: { id: string; title: string; description: string; liveUrl?: string; repoUrl?: string; skillsUsed?: string; featured: boolean }[];
  education: { id: string; institution: string; degree: string; fieldOfStudy?: string; startYear?: number; endYear?: number }[];
  workExperience: { id: string; company: string; roleTitle: string; description?: string }[];
}

function TalentProfileContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/talent/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Candidate profile not found or private');
        } else {
          setCandidate(data.candidate);
        }
      } catch {
        setError('Network error loading profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [id]);

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading candidate profile...</div>;
  }

  if (error || !candidate) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h3>Profile Unavailable</h3>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>{error || 'Profile not found'}</p>
        <Link href="/talent" className="btn btn-secondary">
          Return to Talent Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href="/talent"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
          }}
        >
          <ArrowLeft size={14} /> Back to Talent Directory
        </Link>

        {/* Profile Header */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'var(--bg-muted)',
                backgroundImage: candidate.avatarUrl ? `url(${candidate.avatarUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.75rem',
                flexShrink: 0,
              }}
            >
              {!candidate.avatarUrl && candidate.fullName[0]}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {candidate.status}
                </span>
                <span style={{ color: 'var(--border-strong)' }}>•</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {candidate.city || 'India'}
                </span>
              </div>

              <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>{candidate.fullName}</h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.75rem' }}>
                {candidate.headline || candidate.primaryRole}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.25rem',
                }}
              >
                <span>
                  <strong>{candidate.availabilityHoursPerWeek}</strong> hrs/week available
                </span>
                <span>Work mode: <strong>{candidate.workArrangement}</strong></span>
                {candidate.startDate && <span>Starts: <strong>{candidate.startDate}</strong></span>}
                {candidate.expectedCompensation && <span>Expected: <strong>{candidate.expectedCompensation}</strong></span>}
              </div>

              {/* Links */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {candidate.portfolioUrl && (
                  <a
                    href={candidate.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Globe size={14} /> Portfolio Link
                  </a>
                )}
                {candidate.githubUrl && (
                  <a
                    href={candidate.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Code2 size={14} /> GitHub Profile
                  </a>
                )}
                {candidate.linkedinUrl && (
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Link2 size={14} /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {candidate.bio && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>About</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {candidate.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.875rem' }}>Verified Skills & Proficiency</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {candidate.skills.map((s) => (
              <span
                key={s.id}
                className="skill-tag"
                style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
              >
                {s.name} <strong style={{ color: 'var(--text-primary)', marginLeft: '0.25rem' }}>({s.proficiency})</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Shipped Proof of Work */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Proof of Work & Shipped Projects</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {candidate.projects.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No projects showcased yet.</p>
            )}

            {candidate.projects.map((p) => (
              <div
                key={p.id}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  background: 'var(--bg-canvas)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.0625rem' }}>{p.title}</h4>
                  {p.featured && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent-primary)',
                        padding: '0.125rem 0.4rem',
                        borderRadius: '4px',
                      }}
                    >
                      FEATURED
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.875rem', lineHeight: 1.5 }}>
                  {p.description}
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <ExternalLink size={13} /> Live Deployment
                    </a>
                  )}
                  {p.repoUrl && (
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Code2 size={13} /> Source Code
                    </a>
                  )}
                  {p.skillsUsed && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Tags: {p.skillsUsed}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education & Experience */}
        {candidate.education.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Education & Background</h3>
            {candidate.education.map((e) => (
              <div key={e.id} style={{ marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.9375rem' }}>{e.institution}</strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {e.degree} {e.fieldOfStudy ? `in ${e.fieldOfStudy}` : ''}
                  {e.startYear && ` (${e.startYear} - ${e.endYear || 'Present'})`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicCandidateProfilePage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading candidate profile...</div>}>
      <TalentProfileContent {...props} />
    </Suspense>
  );
}
