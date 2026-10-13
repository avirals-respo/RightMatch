'use client';

import { useEffect, useState } from 'react';
import { Building2, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OrgData {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  location?: string;
  logoUrl?: string;
  verified: boolean;
}

export default function CompanyOrganizationPage() {
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadOrg() {
      try {
        const res = await fetch('/api/company/organization');
        const data = await res.json();
        if (res.ok && data.organization) {
          setOrg(data.organization);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrg();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/company/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(org),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('Failed to update organization');
      }
    } catch {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading organization profile...</div>;
  }

  if (!org) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>No organization found.</div>;
  }

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h1 style={{ margin: 0 }}>Organization Profile</h1>
          {org.verified && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#0369a1',
                background: '#e0f2fe',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <ShieldCheck size={14} /> Verified Startup
            </span>
          )}
        </div>
        <p style={{ marginTop: '0.25rem' }}>
          Your public organization profile and details visible to young talent and applicants.
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} /> Organization details successfully updated!
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="card">
          <div className="form-group">
            <label className="form-label">Startup / Company Name</label>
            <input
              type="text"
              required
              className="input"
              value={org.name}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="url"
                className="input"
                placeholder="https://..."
                value={org.website || ''}
                onChange={(e) => setOrg({ ...org, website: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Industry / Sector</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. AI & Developer Infrastructure"
                value={org.industry || ''}
                onChange={(e) => setOrg({ ...org, industry: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Headquarters / Location</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Bengaluru, India"
                value={org.location || ''}
                onChange={(e) => setOrg({ ...org, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Team Size</label>
              <select
                className="select"
                value={org.size || '1-10'}
                onChange={(e) => setOrg({ ...org, size: e.target.value })}
              >
                <option value="1-10">1 - 10 people (Early Stage)</option>
                <option value="11-50">11 - 50 people (High Growth)</option>
                <option value="51-200">51 - 200 people</option>
                <option value="201+">201+ people</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">About the Company / Mission</label>
            <textarea
              rows={4}
              className="textarea"
              placeholder="What problem are you solving? Describe your engineering or startup culture..."
              value={org.description || ''}
              onChange={(e) => setOrg({ ...org, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" id="save-org-btn">
              <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Organization Details'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
