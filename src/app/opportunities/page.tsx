'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface OppItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  location: string;
  workArrangement: string;
  hoursPerWeekMin: number;
  compensationAmount?: string;
  createdAt: string;
  org: {
    id: string;
    name: string;
    logoUrl?: string;
    verified: boolean;
    industry?: string;
  };
  skills: { id: string; name: string; isMandatory: boolean }[];
}

export default function PublicOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OppItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [arrangement, setArrangement] = useState('ALL');
  const [loading, setLoading] = useState(true);

  async function fetchOpps() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (category !== 'ALL') params.set('category', category);
      if (arrangement !== 'ALL') params.set('arrangement', arrangement);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
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
    fetchOpps();
  }, [category, arrangement]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchOpps();
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1>Discover Opportunities</h1>
        <p style={{ marginTop: '0.25rem' }}>
          Explore open internships, junior roles, and campus fellowships from verified startups.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by role title, startup name, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" id="search-opps-btn">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Category:</span>
            <select
              className="select"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', width: 'auto' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FULL_TIME">Full-time</option>
              <option value="CAMPUS_FELLOW">Campus Fellow</option>
              <option value="FREELANCE">Freelance</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Work Mode:</span>
            <select
              className="select"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', width: 'auto' }}
              value={arrangement}
              onChange={(e) => setArrangement(e.target.value)}
            >
              <option value="ALL">All Modes</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">Onsite</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Searching opportunities...
        </div>
      )}

      {!loading && opportunities.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <h3>No opportunities match your search</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Try adjusting your search query or removing filters.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {opportunities.map((opp) => (
          <div key={opp.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <div>
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
                <h3 style={{ fontSize: '1.1875rem', marginTop: '0.25rem' }}>
                  <Link href={`/opportunities/${opp.id}`}>{opp.title}</Link>
                </h3>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.125rem' }}>
                  {opp.org.name} · {opp.location} ({opp.workArrangement})
                </p>
              </div>
              {opp.org.verified && (
                <span title="Verified Startup" style={{ color: '#0369a1' }}>
                  <ShieldCheck size={18} />
                </span>
              )}
            </div>

            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
                flex: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}
            >
              {opp.description}
            </p>

            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {opp.skills.map((s) => (
                <span
                  key={s.id}
                  className={`skill-tag ${s.isMandatory ? 'skill-tag-mandatory' : ''}`}
                >
                  {s.name}
                </span>
              ))}
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8125rem',
              }}
            >
              <span style={{ fontWeight: 600 }}>{opp.compensationAmount || 'Stipend Disclosed'}</span>
              <Link href={`/opportunities/${opp.id}`} className="btn btn-secondary btn-sm">
                View & Apply <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
