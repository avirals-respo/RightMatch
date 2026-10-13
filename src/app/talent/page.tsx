'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  MapPin,
  ExternalLink,
  Globe,
  ArrowRight,
} from 'lucide-react';

interface TalentItem {
  id: string;
  fullName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  status: string;
  primaryRole?: string;
  availabilityHoursPerWeek: number;
  workArrangement: string;
  portfolioUrl?: string;
  githubUrl?: string;
  skills: { id: string; name: string; proficiency: string }[];
  projects: { id: string; title: string; description: string; liveUrl?: string; repoUrl?: string }[];
}

export default function TalentDirectoryPage() {
  const [talent, setTalent] = useState<TalentItem[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [arrangement, setArrangement] = useState('ALL');
  const [loading, setLoading] = useState(true);

  async function fetchTalent() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (arrangement !== 'ALL') params.set('arrangement', arrangement);

      const res = await fetch(`/api/talent?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setTalent(data.talent || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTalent();
  }, [roleFilter, arrangement]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchTalent();
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1>Talent & Builder Community</h1>
        <p style={{ marginTop: '0.25rem' }}>
          Discover ambitious students, freshers, and young operators with verified proof of work.
        </p>
      </div>

      {/* Filter Bar */}
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
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
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
              placeholder="Search by name, skills, background, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" id="search-talent-btn">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Discipline:</span>
            <select
              className="select"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', width: 'auto' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Disciplines</option>
              <option value="Growth">Growth & Sales</option>
              <option value="Engineer">Engineering / Development</option>
              <option value="Designer">Product & UI Design</option>
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
          Loading builder community...
        </div>
      )}

      {!loading && talent.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <h3>No profiles match your search criteria</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Try broadening your search filters.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {talent.map((t) => (
          <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--bg-muted)',
                  backgroundImage: t.avatarUrl ? `url(${t.avatarUrl})` : undefined,
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
                {!t.avatarUrl && t.fullName[0]}
              </div>

              <div>
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>
                  <Link href={`/talent/${t.id}`}>{t.fullName}</Link>
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {t.primaryRole || 'Builder'} · {t.city || 'India'}
                </p>
              </div>
            </div>

            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
                flex: 1,
                lineHeight: 1.5,
              }}
            >
              {t.headline || t.bio?.slice(0, 110) || 'Active young builder.'}
            </p>

            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {t.skills.map((s) => (
                <span key={s.id} className="skill-tag">
                  {s.name}
                </span>
              ))}
            </div>

            {t.projects[0] && (
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Featured Project: </span>
                <span>{t.projects[0].title}</span>
              </div>
            )}

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
              <span style={{ color: 'var(--text-muted)' }}>
                {t.availabilityHoursPerWeek} hrs/week available
              </span>
              <Link href={`/talent/${t.id}`} className="btn btn-secondary btn-sm">
                View Profile <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
