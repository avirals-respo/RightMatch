import Link from 'next/link';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import {
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Briefcase,
  Layers,
  FileCheck,
  Cpu,
  Users,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type OpportunityItem = Prisma.OpportunityGetPayload<{
  include: { org: true; skills: true };
}>;

type TalentProfileItem = Prisma.CandidateProfileGetPayload<{
  include: { skills: true; projects: true };
}>;

export default async function HomePage() {
  // Fetch real featured opportunities from database
  let opportunities: OpportunityItem[] = [];
  try {
    opportunities = await db.opportunity.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        org: true,
        skills: true,
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error(
      '[RightMatch DB Error] Failed to load opportunities for homepage:',
      error instanceof Error ? error.message : 'Database unavailable'
    );
  }

  // Fetch real verified talent profiles
  let talentProfiles: TalentProfileItem[] = [];
  try {
    talentProfiles = await db.candidateProfile.findMany({
      where: {
        visibility: 'PUBLIC',
        user: { status: 'ACTIVE' },
      },
      include: {
        skills: { take: 3 },
        projects: { take: 1 },
      },
      take: 3,
    });
  } catch (error) {
    console.error(
      '[RightMatch DB Error] Failed to load talent profiles for homepage:',
      error instanceof Error ? error.message : 'Database unavailable'
    );
  }

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Quick Demo Access Bar */}
      <div
        style={{
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.625rem 0',
          fontSize: '0.8125rem',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                background: 'var(--text-primary)',
                color: '#ffffff',
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 600,
              }}
            >
              DEMO PASS
            </span>
            <span>
              Pre-configured accounts: <strong>ananya@university.edu</strong> (Candidate),{' '}
              <strong>karan@nexuslabs.co</strong> (Founder), <strong>admin@opportunity.internal</strong> (Admin)
            </span>
          </div>
          <Link
            href="/login"
            style={{
              fontWeight: 600,
              color: 'var(--accent-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            One-Click Login Switcher <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{ padding: '5rem 0 3.5rem' }}>
        <div className="container-narrow" style={{ textAlign: 'center' }}>
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
              color: 'var(--text-secondary)',
              marginBottom: '1.75rem',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
              }}
            />
            <span>Community-Led Proof of Work Matching</span>
          </div>

          <h1
            style={{
              fontSize: '3rem',
              lineHeight: 1.15,
              fontWeight: 700,
              letterSpacing: '-0.035em',
              marginBottom: '1.5rem',
            }}
          >
            Where ambitious young builders discover opportunities, and startups discover emerging talent.
          </h1>

          <p
            style={{
              fontSize: '1.1875rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 2.25rem',
            }}
          >
            Build your profile once with verified GitHub projects, case studies, and availability.
            Our transparent matching engine pairs you with startup roles and campus fellowships based on
            genuine proof of work—not generic resumes.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/register?role=CANDIDATE"
              className="btn btn-accent btn-lg"
              id="hero-talent-btn"
            >
              Join as Talent (Students & Builders)
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/register?role=COMPANY"
              className="btn btn-secondary btn-lg"
              id="hero-company-btn"
            >
              Post a Role (Startups & Founders)
            </Link>
          </div>
        </div>
      </section>

      {/* The Core Story: Real Walkthrough (Ananya vs Nexus Labs) */}
      <section style={{ padding: '3.5rem 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ maxWidth: '640px', marginBottom: '2.5rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-primary)',
                marginBottom: '0.5rem',
              }}
            >
              How It Works in Practice
            </div>
            <h2>The Automated Discovery Workflow</h2>
            <p style={{ marginTop: '0.5rem' }}>
              No keyword black boxes. Watch how real candidate attributes pair with structured startup criteria.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Step 1: Candidate Profile */}
            <div className="card" style={{ background: 'var(--bg-canvas)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span
                  style={{
                    background: 'var(--text-primary)',
                    color: '#ffffff',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  1
                </span>
                <div>
                  <h4 style={{ margin: 0 }}>Candidate enters profile once</h4>
                  <p style={{ fontSize: '0.8125rem', margin: 0 }}>Ananya Sharma · Student at Bangalore University</p>
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Role:</strong> Growth & Sales Specialist
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Availability:</strong> 25 hrs/week · Hybrid Bengaluru
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span className="skill-tag">Cold Outreach (Advanced)</span>
                  <span className="skill-tag">B2B Sales</span>
                  <span className="skill-tag">CRM</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Proof of Work: <em>E-Cell Summit Partnerships (120+ Outbound Leads)</em>
                </div>
              </div>
            </div>

            {/* Step 2: Structured Startup Opportunity */}
            <div className="card" style={{ background: 'var(--bg-canvas)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span
                  style={{
                    background: 'var(--text-primary)',
                    color: '#ffffff',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  2
                </span>
                <div>
                  <h4 style={{ margin: 0 }}>Startup publishes requirements</h4>
                  <p style={{ fontSize: '0.8125rem', margin: 0 }}>Nexus Labs · AI Developer Infrastructure</p>
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Title:</strong> Growth & Business Development Intern
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Requirement:</strong> Min 20 hrs/week · Hybrid Bengaluru
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span className="skill-tag skill-tag-mandatory">Cold Outreach (Required)</span>
                  <span className="skill-tag skill-tag-mandatory">B2B Sales (Required)</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Stipend: ₹30,000 / month · 3 months duration
                </div>
              </div>
            </div>

            {/* Step 3: Transparent Evaluation */}
            <div className="card" style={{ border: '1px solid var(--success-border)', background: 'var(--success-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span
                  style={{
                    background: 'var(--success-text)',
                    color: '#ffffff',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  3
                </span>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--success-text)' }}>84% Match Score Computed</h4>
                  <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--success-text)' }}>Instant two-sided recommendation</p>
                </div>
              </div>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--success-text)', marginBottom: '0.375rem' }}>
                  Why this matched:
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  • 2 of 2 mandatory skills matched with advanced proficiency.
                  <br />• 25 hrs/week commitment satisfies 20 hr minimum.
                  <br />• Verified proof-of-work in outbound sales campaigns.
                </p>
                <span className="status-pill status-SHORTLISTED">Candidate Shortlisted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Real Opportunities */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-primary)',
                  marginBottom: '0.375rem',
                }}
              >
                Active Listings
              </div>
              <h2>Open Startup Opportunities</h2>
            </div>
            <Link
              href="/opportunities"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
            >
              Browse all {opportunities.length} opportunities <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {opportunities.length === 0 ? (
              <div
                className="card"
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  background: 'var(--bg-canvas)',
                }}
              >
                <Briefcase
                  size={40}
                  style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.6 }}
                />
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  No published opportunities yet
                </h3>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    maxWidth: '420px',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  Be the first startup or company to post an internship, project, or role on RightMatch.
                </p>
                <Link href="/register?role=COMPANY" className="btn btn-primary btn-sm">
                  Post an Opportunity
                </Link>
              </div>
            ) : (
              opportunities.map((opp) => (
              <div key={opp.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--accent-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {opp.category.replace('_', ' ')}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', marginTop: '0.25rem' }}>
                      <Link href={`/opportunities/${opp.id}`} style={{ color: 'inherit' }}>
                        {opp.title}
                      </Link>
                    </h3>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.125rem' }}>
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
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
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
                    View Details
                  </Link>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </section>

      {/* Proof of Work Community Section */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <div style={{ maxWidth: '640px', marginBottom: '2.5rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-primary)',
                marginBottom: '0.375rem',
              }}
            >
              Emerging Builders
            </div>
            <h2>Discovered by Real Proof of Work</h2>
            <p style={{ marginTop: '0.5rem' }}>
              Explore real projects shipped by students and young professionals on the platform.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {talentProfiles.length === 0 ? (
              <div
                className="card"
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  background: 'var(--bg-surface)',
                }}
              >
                <Users
                  size={40}
                  style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.6 }}
                />
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  No verified builder profiles published yet
                </h3>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    maxWidth: '420px',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  Create your profile to showcase verified proof of work, projects, and skills.
                </p>
                <Link href="/register?role=CANDIDATE" className="btn btn-accent btn-sm">
                  Join as Talent
                </Link>
              </div>
            ) : (
              talentProfiles.map((talent) => (
              <div key={talent.id} className="card" style={{ background: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'var(--bg-muted)',
                      backgroundImage: talent.avatarUrl ? `url(${talent.avatarUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '1rem',
                    }}
                  >
                    {!talent.avatarUrl && talent.fullName[0]}
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>
                      <Link href={`/talent/${talent.id}`}>{talent.fullName}</Link>
                    </h4>
                    <p style={{ fontSize: '0.8125rem', margin: 0 }}>
                      {talent.primaryRole || 'Builder'} · {talent.city || 'India'}
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.875rem',
                    lineHeight: 1.45,
                  }}
                >
                  {talent.headline || talent.bio?.slice(0, 100) || 'Active young builder.'}
                </p>

                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {talent.skills.map((s) => (
                    <span key={s.id} className="skill-tag">
                      {s.name}
                    </span>
                  ))}
                </div>

                {talent.projects[0] && (
                  <div
                    style={{
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.625rem',
                      fontSize: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Featured Project:</span>{' '}
                    <span>{talent.projects[0].title}</span>
                  </div>
                )}

                <Link href={`/talent/${talent.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  View Verified Profile
                </Link>
              </div>
            ))
            )}
          </div>
        </div>
      </section>

      {/* The 6-Dimension Engine Explanation */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div className="container-narrow" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-primary)',
                marginBottom: '0.375rem',
              }}
            >
              The Science of Fit
            </div>
            <h2>Configurable, Explainable 6-Dimension Scoring</h2>
            <p style={{ marginTop: '0.5rem' }}>
              We never guess. The engine mathematically weights six distinct factors and isolates hard eligibility constraints.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {[
              {
                weight: '35%',
                title: 'Required Skills & Proficiency',
                desc: 'Evaluates canonical skills against opportunity requirements, adjusting for beginner, intermediate, and advanced proficiency levels.',
              },
              {
                weight: '20%',
                title: 'Role & Category Alignment',
                desc: 'Matches career trajectory, primary discipline, and role type (internship vs. junior full-time vs. fellow).',
              },
              {
                weight: '15%',
                title: 'Proof of Work & Shipped Projects',
                desc: 'Rewards live deployment links, GitHub code repositories, and relevant domain case studies.',
              },
              {
                weight: '10%',
                title: 'Availability & Time Commitment',
                desc: 'Ensures candidate available weekly hours satisfy the startup’s minimum operational threshold.',
              },
              {
                weight: '10%',
                title: 'Location & Work Arrangement',
                desc: 'Distinguishes remote-friendly flexibility from mandatory onsite presence with zero guesswork.',
              },
              {
                weight: '10%',
                title: 'Preferred & Bonus Skills',
                desc: 'Adds positive weighting for nice-to-have capabilities without penalizing candidates who lack them.',
              },
            ].map((dim, i) => (
              <div key={i} className="card" style={{ background: 'var(--bg-canvas)' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {dim.weight}
                </div>
                <h4 style={{ marginBottom: '0.5rem' }}>{dim.title}</h4>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{dim.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ padding: '4rem 0 2rem' }}>
        <div
          className="container"
          style={{
            background: 'var(--text-primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: '#ffffff', fontSize: '2.25rem', marginBottom: '1rem' }}>
            Ready to turn your audience into an opportunity ecosystem?
          </h2>
          <p style={{ color: '#a1a1aa', maxWidth: '580px', margin: '0 auto 2rem', fontSize: '1.0625rem' }}>
            Enter your information once. Keep your profile updated. Benefit from automated matching as new opportunities and talent join the platform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register?role=CANDIDATE" className="btn btn-accent btn-lg">
              Create Candidate Profile
            </Link>
            <Link
              href="/register?role=COMPANY"
              className="btn btn-secondary btn-lg"
              style={{ background: 'transparent', color: '#ffffff', borderColor: '#3f3f46' }}
            >
              Register Startup
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
