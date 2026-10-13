'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SkillInput {
  name: string;
  isMandatory: boolean;
}

export default function NewOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('INTERNSHIP');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [workArrangement, setWorkArrangement] = useState('REMOTE');
  const [location, setLocation] = useState('Remote (India)');
  const [hoursPerWeekMin, setHoursPerWeekMin] = useState(20);
  const [compensationType, setCompensationType] = useState('STIPEND');
  const [compensationAmount, setCompensationAmount] = useState('₹25,000 / month');
  const [duration, setDuration] = useState('3 months');
  const [openingsCount, setOpeningsCount] = useState(1);

  // Skills
  const [skills, setSkills] = useState<SkillInput[]>([
    { name: 'Cold Outreach', isMandatory: true },
    { name: 'B2B Sales', isMandatory: true },
    { name: 'CRM (HubSpot)', isMandatory: false },
  ]);
  const [newSkillText, setNewSkillText] = useState('');
  const [newSkillMandatory, setNewSkillMandatory] = useState(true);

  function addSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!newSkillText.trim()) return;
    setSkills([...skills, { name: newSkillText.trim(), isMandatory: newSkillMandatory }]);
    setNewSkillText('');
  }

  function removeSkill(idx: number) {
    setSkills(skills.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/company/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          responsibilities,
          eligibilityCriteria,
          workArrangement,
          location,
          hoursPerWeekMin,
          compensationType,
          compensationAmount,
          duration,
          openingsCount,
          skills,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to publish opportunity');
        setLoading(false);
        return;
      }

      router.push(`/company/opportunities/${data.opportunity.id}/matches`);
      router.refresh();
    } catch {
      setError('An unexpected error occurred while creating the opportunity.');
      setLoading(false);
    }
  }

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem' }}>
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
        <h1>Publish New Opportunity</h1>
        <p style={{ marginTop: '0.25rem' }}>
          Define structured requirements. The engine will automatically evaluate and rank matching candidates.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Core Opportunity Info */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>1. Role Overview & Category</h3>

          <div className="form-group">
            <label className="form-label">Role Title</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Growth & Business Development Intern or Founding Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="opp-title-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Opportunity Category</label>
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="FULL_TIME">Junior / Full-time Role</option>
                <option value="CAMPUS_FELLOW">Campus Fellow / Ambassador</option>
                <option value="FREELANCE">Freelance Project</option>
                <option value="CONTRACT">Contract / Contractor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Work Arrangement</label>
              <select
                className="select"
                value={workArrangement}
                onChange={(e) => setWorkArrangement(e.target.value)}
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. Bengaluru, India or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Hours / Week (Hard Eligibility Rule)</label>
              <input
                type="number"
                min={5}
                max={60}
                required
                className="input"
                value={hoursPerWeekMin}
                onChange={(e) => setHoursPerWeekMin(parseInt(e.target.value) || 0)}
              />
              <span className="form-hint">Candidates with fewer available hours will be flagged.</span>
            </div>
          </div>
        </div>

        {/* Structured Skills & Requirements */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0 }}>2. Required vs Preferred Skills</h3>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Required skills are treated as mandatory; preferred skills provide scoring bonuses without disqualifying.
            </p>
          </div>

          {/* Current Skills Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {skills.map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: s.isMandatory ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                  border: `1px solid ${s.isMandatory ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                  color: s.isMandatory ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                }}
              >
                <strong>{s.name}</strong>
                <span style={{ fontSize: '0.6875rem' }}>({s.isMandatory ? 'Required' : 'Preferred'})</span>
                <button
                  type="button"
                  onClick={() => removeSkill(idx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Skill mini-form */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input"
              style={{ flex: 2, minWidth: '180px' }}
              placeholder="e.g. Next.js, Figma, Cold Outreach"
              value={newSkillText}
              onChange={(e) => setNewSkillText(e.target.value)}
            />
            <select
              className="select"
              style={{ flex: 1, minWidth: '130px' }}
              value={newSkillMandatory ? 'REQUIRED' : 'PREFERRED'}
              onChange={(e) => setNewSkillMandatory(e.target.value === 'REQUIRED')}
            >
              <option value="REQUIRED">Required (Mandatory)</option>
              <option value="PREFERRED">Preferred (Bonus)</option>
            </select>
            <button type="button" onClick={addSkill} className="btn btn-secondary">
              <Plus size={14} /> Add Skill
            </button>
          </div>
        </div>

        {/* Detailed Descriptions & Compensation */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>3. Role Details & Compensation</h3>

          <div className="form-group">
            <label className="form-label">Role Description</label>
            <textarea
              rows={4}
              required
              className="input"
              placeholder="Outline the mission, team context, and what the candidate will be doing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Responsibilities</label>
            <textarea
              rows={3}
              className="input"
              placeholder="• Lead outbound email campaigns&#10;• Coordinate startup demo calls"
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Eligibility Criteria</label>
            <textarea
              rows={2}
              className="input"
              placeholder="e.g. Students in 3rd/4th year or freshers available for 20+ hrs/week"
              value={eligibilityCriteria}
              onChange={(e) => setEligibilityCriteria(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Compensation / Stipend</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. ₹30,000 / month or ₹8L - ₹12L / year"
                value={compensationAmount}
                onChange={(e) => setCompensationAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Duration</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. 3 months or Permanent"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link href="/company/opportunities" className="btn btn-secondary btn-lg">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-accent btn-lg"
            id="submit-create-opp-btn"
          >
            {loading ? 'Publishing Role...' : 'Publish Opportunity & Discover Matches'}
          </button>
        </div>
      </form>
    </div>
  );
}
