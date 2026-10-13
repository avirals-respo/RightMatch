import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Scale,
  Brain,
  Layers,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="container-narrow" style={{ padding: '4rem 1.5rem 6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--accent-primary)',
            marginBottom: '1.25rem',
          }}
        >
          <Sparkles size={14} /> Deterministic & Explainable Matching
        </div>
        <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2 }}>How the Matching Engine Works</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.75rem auto 0' }}>
          No opaque black boxes. We evaluate real candidate proof of work against structured startup criteria using transparent mathematical rules.
        </p>
      </div>

      {/* The Core Principles */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Hard Constraints vs. Soft Preferences</h2>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Traditional job boards rank people using arbitrary keyword searches. Our engine makes a fundamental architectural distinction between <strong>eligibility constraints</strong> and <strong>weighted preferences</strong>:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--danger-text)', marginBottom: '0.5rem' }}>Hard Eligibility Constraints</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Mandatory rules that must be satisfied. For example:
              <br />• Candidate available hours must meet the startup’s minimum weekly requirement (e.g. 20 hrs/week).
              <br />• If an opportunity requires onsite presence in Bengaluru and candidate is Remote only, the constraint is explicitly flagged.
              <br />• Missing skills explicitly marked as <em>Required</em> are flagged as unmet mandatory criteria.
            </p>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--success-text)', marginBottom: '0.5rem' }}>Soft Preferences</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Attributes that boost a candidate's compatibility score without disqualifying someone who lacks them:
              <br />• <em>Preferred skills</em> (e.g. Hubspot, Figma) add bonus points.
              <br />• Demonstrated GitHub repositories and live deployments enhance the proof-of-work score.
              <br />• Inferred skill synonyms (e.g. Next.js to React) receive canonical alignment credit.
            </p>
          </div>
        </div>
      </div>

      {/* The 6 Dimensions */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>The 6-Dimension Weighted Model</h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          When computing compatibility between candidate profile $C$ and opportunity $O$, the engine normalizes each dimension (0–100) and calculates the weighted sum:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              dim: '1. Required & Relevant Skills',
              weight: '35%',
              desc: 'Canonical skills matched using our synonym dictionary, weighted by candidate proficiency (Beginner 0.7x, Intermediate 0.9x, Advanced 1.0x, Expert 1.1x).',
            },
            {
              dim: '2. Role & Discipline Alignment',
              weight: '20%',
              desc: 'Compatibility between the candidate’s primary role (e.g. Growth Specialist) and the startup listing’s title, level, and opportunity category (Internship vs. Junior Role).',
            },
            {
              dim: '3. Proof of Work & Shipped Projects',
              weight: '15%',
              desc: 'High-agency evidence: active GitHub repositories, deployed applications, outbound campaigns, and case study documentation.',
            },
            {
              dim: '4. Availability & Weekly Commitment',
              weight: '10%',
              desc: 'Ensures the candidate’s weekly available hours satisfy the startup’s minimum requirement without overwhelming their university schedule.',
            },
            {
              dim: '5. Location & Work Arrangement',
              weight: '10%',
              desc: 'Remote match, hybrid alignment, or exact city proximity.',
            },
            {
              dim: '6. Preferred & Bonus Qualifications',
              weight: '10%',
              desc: 'Overlap with non-mandatory capabilities that make a candidate uniquely additive to the startup team.',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '1rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-canvas)',
                gap: '1rem',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 0.25rem' }}>{item.dim}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  flexShrink: 0,
                }}
              >
                {item.weight}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Sided Automation */}
      <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Two-Sided Recommendation Cycles</h2>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Users enter their information once. The matching engine powers two symmetric experiences:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>For Young Builders & Students</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your feed ranks opportunities with full match explanations, indicating exactly which of your skills triggered the match and any preferred bonus skills requested by the founder.
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>For Startup Hiring Teams</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your dashboard ranks registered talent by match score, presenting verified project repos and case studies ahead of generic credentials.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <Link href="/register" className="btn btn-primary btn-lg">
          Join the Proof-of-Work Network <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
