'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  PlusCircle,
  Users,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface OppItem {
  id: string;
  title: string;
  category: string;
  status: string;
  location: string;
  workArrangement: string;
  hoursPerWeekMin: number;
  compensationAmount?: string;
  createdAt: string;
  skills: { id: string; name: string; isMandatory: boolean }[];
  _count: {
    applications: number;
  };
}

export default function CompanyOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OppItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOpps() {
    try {
      const res = await fetch('/api/company/opportunities');
      const data = await res.json();
      if (res.ok) {
        setOpportunities(data.opportunities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOpps();
  }, []);

  async function toggleStatus(oppId: string, currentStatus: string) {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/company/opportunities/${oppId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        loadOpps();
      }
    } catch {
      alert('Failed to update status');
    }
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <h1>Organization Opportunities</h1>
          <p style={{ marginTop: '0.25rem' }}>
            Manage published roles, view ranked candidate recommendations, and track hiring pipelines.
          </p>
        </div>
        <Link href="/company/opportunities/new" className="btn btn-accent" id="create-new-opp-btn">
          <PlusCircle size={16} /> Post New Opportunity
        </Link>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading your company opportunities...
        </div>
      )}

      {!loading && opportunities.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Briefcase size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No opportunities created yet</h3>
          <p style={{ maxWidth: '440px', margin: '0.5rem auto 1.5rem' }}>
            Publish your first role with structured requirements to start discovering and ranking matching young builders.
          </p>
          <Link href="/company/opportunities/new" className="btn btn-primary">
            Create Your First Listing
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {opportunities.map((opp) => (
          <div key={opp.id} className="card" style={{ padding: '1.75rem' }}>
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
                      color: 'var(--accent-primary)',
                    }}
                  >
                    {opp.category.replace('_', ' ')}
                  </span>
                  <span style={{ color: 'var(--border-strong)' }}>•</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      background: opp.status === 'PUBLISHED' ? 'var(--success-bg)' : 'var(--bg-muted)',
                      color: opp.status === 'PUBLISHED' ? 'var(--success-text)' : 'var(--text-muted)',
                    }}
                  >
                    {opp.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.375rem', margin: 0 }}>
                  <Link href={`/company/opportunities/${opp.id}/pipeline`}>
                    {opp.title}
                  </Link>
                </h3>

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
                    <MapPin size={14} /> {opp.location} ({opp.workArrangement})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> Min {opp.hoursPerWeekMin} hrs/week
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {opp.compensationAmount || 'Stipend Disclosed'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => toggleStatus(opp.id, opp.status)}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  {opp.status === 'PUBLISHED' ? 'Pause Listing' : 'Publish Listing'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {opp.skills.map((s) => (
                <span
                  key={s.id}
                  className={`skill-tag ${s.isMandatory ? 'skill-tag-mandatory' : ''}`}
                >
                  {s.name} {s.isMandatory && '(Required)'}
                </span>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8125rem' }}>
                <span>
                  <strong>{opp._count.applications}</strong> Applicants in pipeline
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link
                  href={`/company/opportunities/${opp.id}/matches`}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
                  id={`matches-btn-${opp.id}`}
                >
                  <Sparkles size={14} /> View Ranked Matches
                </Link>

                <Link
                  href={`/company/opportunities/${opp.id}/pipeline`}
                  className="btn btn-primary btn-sm"
                  id={`pipeline-btn-${opp.id}`}
                >
                  <Users size={14} /> Review Applicants ({opp._count.applications})
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
