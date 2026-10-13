'use client';

import { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Sparkles,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';

interface ApplicationItem {
  id: string;
  status: string;
  pitch?: string;
  portfolioHighlight?: string;
  matchScoreAtApplication?: number;
  createdAt: string;
  candidate: {
    id: string;
    fullName: string;
    headline?: string;
    city?: string;
    status: string;
    primaryRole?: string;
    skills: { name: string; proficiency: string }[];
    projects: { title: string; liveUrl?: string; repoUrl?: string }[];
  };
  notes: {
    id: string;
    content: string;
    createdAt: string;
    author: { email: string };
  }[];
}

const STAGES = [
  'ALL',
  'SUBMITTED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'REJECTED',
  'HIRED',
];

function PipelineContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [oppTitle, setOppTitle] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Note form state
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  async function loadPipeline() {
    try {
      const res = await fetch(`/api/company/opportunities/${id}/applications`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch applicants');
      } else {
        setApplications(data.applications || []);
        setOppTitle(data.opportunity?.title || 'Role');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPipeline();
  }, [id]);

  async function updateStatus(applicationId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/company/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Optimistic update
        setApplications((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
        );
      } else {
        alert('Failed to update status');
      }
    } catch {
      alert('Network error updating status');
    }
  }

  async function handleAddNote(e: React.FormEvent, applicationId: string) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setNoteSubmitting(true);

    try {
      const res = await fetch(`/api/company/applications/${applicationId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent }),
      });

      if (res.ok) {
        setNoteContent('');
        setActiveAppId(null);
        loadPipeline();
      }
    } catch {
      alert('Failed to add note');
    } finally {
      setNoteSubmitting(false);
    }
  }

  const filteredApps =
    selectedStage === 'ALL'
      ? applications
      : applications.filter((app) => app.status === selectedStage);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2rem' }}>
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
        <h1>Applicant Hiring Pipeline</h1>
        <p style={{ marginTop: '0.25rem' }}>
          Applicants for <strong>"{oppTitle}"</strong>. Advance candidates, leave private internal notes, and track recruitment stages.
        </p>
      </div>

      {/* Stage Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {STAGES.map((stage) => {
          const count =
            stage === 'ALL'
              ? applications.length
              : applications.filter((a) => a.status === stage).length;

          return (
            <button
              key={stage}
              type="button"
              onClick={() => setSelectedStage(stage)}
              className={`btn btn-sm ${selectedStage === stage ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
              id={`pipeline-tab-${stage.toLowerCase()}`}
            >
              <span>{stage.replace('_', ' ')}</span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  opacity: 0.8,
                  padding: '0.1rem 0.35rem',
                  borderRadius: '10px',
                  background: selectedStage === stage ? '#3f3f46' : 'var(--bg-muted)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading applicant pipeline...
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && filteredApps.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <h3>No candidates in {selectedStage === 'ALL' ? 'this pipeline' : selectedStage.replace('_', ' ')}</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Check back as candidates discover and apply to your opportunity.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredApps.map((app) => (
          <div key={app.id} className="card" style={{ padding: '1.75rem' }}>
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
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {app.candidate.status}
                  </span>
                  <span style={{ color: 'var(--border-strong)' }}>•</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {app.candidate.city || 'India'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.375rem', margin: 0 }}>
                  <Link href={`/talent/${app.candidate.id}`}>{app.candidate.fullName}</Link>
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {app.candidate.primaryRole || 'Builder'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {app.matchScoreAtApplication && (
                  <span className="match-badge match-high">
                    <Sparkles size={13} /> {app.matchScoreAtApplication}% Match Score
                  </span>
                )}
                <span className={`status-pill status-${app.status}`}>
                  {app.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Candidate Pitch */}
            {app.pitch && (
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.8125rem',
                  marginBottom: '1rem',
                }}
              >
                <strong style={{ color: 'var(--text-primary)' }}>Application Pitch:</strong>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  "{app.pitch}"
                </p>
                {app.portfolioHighlight && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <a
                      href={app.portfolioHighlight}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <ExternalLink size={12} /> View Highlighted Portfolio Link
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Recruiter Action Stage Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
                  Update Stage:
                </span>
                {['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'].map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    disabled={app.status === stg}
                    onClick={() => updateStatus(app.id, stg)}
                    className={`btn btn-sm ${app.status === stg ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    id={`stage-btn-${app.id}-${stg.toLowerCase()}`}
                  >
                    {stg.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveAppId(activeAppId === app.id ? null : app.id)}
                  className="btn btn-secondary btn-sm"
                  id={`note-toggle-${app.id}`}
                >
                  <MessageSquare size={14} /> Notes ({app.notes.length})
                </button>
                <Link href={`/talent/${app.candidate.id}`} className="btn btn-ghost btn-sm">
                  Profile <ExternalLink size={14} />
                </Link>
              </div>
            </div>

            {/* Private Notes Panel */}
            {activeAppId === app.id && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Private Recruiter Notes (Internal Only)</h4>

                {app.notes.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.8125rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <p style={{ margin: 0, color: 'var(--text-primary)' }}>{n.content}</p>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      By {n.author.email} · {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}

                <form onSubmit={(e) => handleAddNote(e, app.id)} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Add an internal observation, round score, or interview note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                  <button type="submit" disabled={noteSubmitting} className="btn btn-primary btn-sm">
                    <Send size={12} /> Add
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OpportunityPipelinePage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading applicant pipeline...</div>}>
      <PipelineContent {...props} />
    </Suspense>
  );
}
