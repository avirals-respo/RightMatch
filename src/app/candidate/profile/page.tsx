'use client';

import { useEffect, useState } from 'react';
import {
  User,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  Globe,
  Sparkles,
  Save,
  CheckCircle2,
  Eye,
} from 'lucide-react';

interface ProfileData {
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
  startDate: string;
  workArrangement: string;
  expectedCompensation?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  visibility: string;
  skills: { id: string; name: string; proficiency: string }[];
  projects: { id: string; title: string; description: string; liveUrl?: string; repoUrl?: string; skillsUsed?: string; featured: boolean }[];
}

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Skill form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('INTERMEDIATE');

  // New Project form state
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjLive, setNewProjLive] = useState('');
  const [newProjRepo, setNewProjRepo] = useState('');
  const [newProjSkills, setNewProjSkills] = useState('');
  const [showProjForm, setShowProjForm] = useState(false);

  async function loadProfile() {
    try {
      const res = await fetch('/api/candidate/profile');
      const data = await res.json();
      if (res.ok && data.profile) {
        setProfile(data.profile);
        setCompletion(data.completionPercentage || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setSaveSuccess(true);
        loadProfile();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await fetch('/api/candidate/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSkillName, proficiency: newSkillProficiency }),
      });

      if (res.ok) {
        setNewSkillName('');
        loadProfile();
      }
    } catch {
      alert('Failed to add skill');
    }
  }

  async function handleDeleteSkill(id: string) {
    try {
      const res = await fetch(`/api/candidate/skills?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadProfile();
      }
    } catch {
      alert('Failed to delete skill');
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjDesc.trim()) return;

    try {
      const res = await fetch('/api/candidate/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProjTitle,
          description: newProjDesc,
          liveUrl: newProjLive,
          repoUrl: newProjRepo,
          skillsUsed: newProjSkills,
          featured: true,
        }),
      });

      if (res.ok) {
        setNewProjTitle('');
        setNewProjDesc('');
        setNewProjLive('');
        setNewProjRepo('');
        setNewProjSkills('');
        setShowProjForm(false);
        loadProfile();
      }
    } catch {
      alert('Failed to add project');
    }
  }

  async function handleDeleteProject(id: string) {
    try {
      const res = await fetch(`/api/candidate/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadProfile();
      }
    } catch {
      alert('Failed to delete project');
    }
  }

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading your profile...</div>;
  }

  if (!profile) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Profile not found. Please log in.</div>;
  }

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem' }}>
      {/* Top Completion Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
          <div>
            <h1>Candidate Profile & Proof of Work</h1>
            <p style={{ marginTop: '0.25rem' }}>
              Your profile is continuously matched with startup opportunities as requirements and roles update.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
              {completion}% Complete
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${completion}%`,
              height: '100%',
              background: 'var(--accent-primary)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {saveSuccess && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} /> Profile changes successfully saved and re-indexed for matching!
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleProfileSave}>
        {/* Section 1: Basic Information */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>1. Basic & Contact Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="input"
                value={profile.fullName || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location (City, Country)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Bengaluru, India"
                value={profile.city || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Headline</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Growth Specialist | University Student & Community Lead"
              value={profile.headline || ''}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Background</label>
            <textarea
              rows={3}
              className="textarea"
              placeholder="Tell founders and recruiters about what you love building and your goals..."
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Current Status</label>
              <select
                className="select"
                value={profile.status || 'STUDENT'}
                onChange={(e) => setProfile({ ...profile, status: e.target.value })}
              >
                <option value="STUDENT">Student (Undergraduate / Postgrad)</option>
                <option value="FRESHER">Fresher (Recent Graduate)</option>
                <option value="BUILDER">Young Builder / Independent Creator</option>
                <option value="FREELANCER">Freelancer</option>
                <option value="EMPLOYED">Employed / Professional</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Role / Specialization</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Growth & Sales Specialist, Frontend Engineer"
                value={profile.primaryRole || ''}
                onChange={(e) => setProfile({ ...profile, primaryRole: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Opportunity Preferences & Availability */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>2. Availability & Role Preferences</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Availability (Hours / Week)</label>
              <input
                type="number"
                min={5}
                max={60}
                required
                className="input"
                value={profile.availabilityHoursPerWeek}
                onChange={(e) => setProfile({ ...profile, availabilityHoursPerWeek: parseInt(e.target.value) || 0 })}
              />
              <span className="form-hint">Used for hard eligibility checks on weekly hours.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Work Arrangement</label>
              <select
                className="select"
                value={profile.workArrangement || 'ANY'}
                onChange={(e) => setProfile({ ...profile, workArrangement: e.target.value })}
              >
                <option value="ANY">Any Arrangement (Flexible)</option>
                <option value="REMOTE">Remote Only</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Expected Start Date</label>
              <select
                className="select"
                value={profile.startDate || 'Immediate'}
                onChange={(e) => setProfile({ ...profile, startDate: e.target.value })}
              >
                <option value="Immediate">Immediate</option>
                <option value="Within 2 weeks">Within 2 weeks</option>
                <option value="Next month">Next month</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expected Compensation / Stipend</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. ₹25,000 / month or ₹8L / year"
                value={profile.expectedCompensation || ''}
                onChange={(e) => setProfile({ ...profile, expectedCompensation: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Visibility</label>
            <select
              className="select"
              value={profile.visibility || 'PUBLIC'}
              onChange={(e) => setProfile({ ...profile, visibility: e.target.value })}
            >
              <option value="PUBLIC">Public (Discoverable by community & startups)</option>
              <option value="COMPANIES_ONLY">Hiring Teams Only (Hidden from general public)</option>
              <option value="ANONYMOUS">Anonymous (Hide name until applying)</option>
              <option value="PRIVATE">Private (Only visible on explicit application)</option>
            </select>
          </div>
        </div>

        {/* Section 3: Verified Links */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>3. Professional & Portfolio Links</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://github.com/username"
                value={profile.githubUrl || ''}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://linkedin.com/in/username"
                value={profile.linkedinUrl || ''}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Personal Website / Portfolio</label>
            <input
              type="url"
              className="input"
              placeholder="https://yourname.dev or readcv / bento link"
              value={profile.portfolioUrl || ''}
              onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
          <button type="submit" disabled={saving} className="btn btn-primary btn-lg" id="save-profile-btn">
            <Save size={16} /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Section 4: Skills Management (Dynamic) */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>4. Verified Skills & Proficiency</h3>
        <p style={{ fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
          Canonical skills are directly matched against mandatory and preferred startup opportunity requirements.
        </p>

        {/* Existing Skills List */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {profile.skills.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No skills added yet. Add your core capabilities below.
            </p>
          )}

          {profile.skills.map((skill) => (
            <div
              key={skill.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>{skill.name}</strong>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>({skill.proficiency})</span>
              <button
                type="button"
                onClick={() => handleDeleteSkill(skill.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 2px' }}
                title="Remove skill"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Skill Mini-Form */}
        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input"
            style={{ flex: 2, minWidth: '180px' }}
            placeholder="Skill name (e.g. Cold Outreach, React, Figma)"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
          />
          <select
            className="select"
            style={{ flex: 1, minWidth: '140px' }}
            value={newSkillProficiency}
            onChange={(e) => setNewSkillProficiency(e.target.value)}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>
          <button type="submit" className="btn btn-secondary" id="add-skill-btn">
            <Plus size={14} /> Add Skill
          </button>
        </form>
      </div>

      {/* Section 5: Proof of Work Projects (Dynamic) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3>5. Proof of Work & Shipped Projects</h3>
            <p style={{ fontSize: '0.8125rem', margin: 0 }}>
              Tangible evidence of initiative, code repositories, design decks, or campaigns.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowProjForm(!showProjForm)}
            className="btn btn-secondary btn-sm"
            id="toggle-project-form-btn"
          >
            <Plus size={14} /> {showProjForm ? 'Close Form' : 'Add Project'}
          </button>
        </div>

        {showProjForm && (
          <form
            onSubmit={handleAddProject}
            style={{
              background: 'var(--bg-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Project Title</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. E-Cell Summit Sponsorship Campaign or Fullstack Kanban App"
                value={newProjTitle}
                onChange={(e) => setNewProjTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Impact</label>
              <textarea
                required
                rows={3}
                className="textarea"
                placeholder="What did you build? What were the metrics, results, or technologies used?"
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Live Link (Optional)</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://..."
                  value={newProjLive}
                  onChange={(e) => setNewProjLive(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Code Repository / Case Study Link</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://github.com/..."
                  value={newProjRepo}
                  onChange={(e) => setNewProjRepo(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Skills / Tools Used (comma-separated)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Cold Outreach, B2B Sales, CRM"
                value={newProjSkills}
                onChange={(e) => setNewProjSkills(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-accent btn-sm" id="save-project-btn">
              Save Project to Profile
            </button>
          </form>
        )}

        {/* List of projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {profile.projects.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No projects added yet. Showcasing proof of work increases match score significantly.
            </p>
          )}

          {profile.projects.map((proj) => (
            <div
              key={proj.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.125rem',
                background: 'var(--bg-canvas)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                <h4 style={{ margin: 0 }}>{proj.title}</h4>
                <button
                  type="button"
                  onClick={() => handleDeleteProject(proj.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Delete project"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {proj.description}
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                  >
                    <ExternalLink size={12} /> Live Link
                  </a>
                )}
                {proj.repoUrl && (
                  <a
                    href={proj.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                  >
                    <Code2 size={12} /> Source Code
                  </a>
                )}
                {proj.skillsUsed && (
                  <span style={{ color: 'var(--text-muted)' }}>
                    Tags: {proj.skillsUsed}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
