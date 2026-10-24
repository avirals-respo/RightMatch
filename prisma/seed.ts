import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.Prisma_Database_DATABASE_URL ||
  process.env.Prisma_Database_POSTGRES_URL;

if (!process.env.DATABASE_URL && dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}

const prisma = new PrismaClient({
  datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
});

// Safe password hashing using PBKDF2 (SHA-512)
export function hashPassword(password: string): string {
  const salt = 'talent-platform-secure-salt-2025';
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

async function main() {
  const existingCount = await prisma.user.count();
  if (existingCount > 0) {
    console.log(`[RightMatch Seed] Database already contains ${existingCount} users. Skipping seed to preserve data.`);
    return;
  }

  console.log('[RightMatch Seed] Database is empty. Seeding initial demo accounts & records...');

  const defaultPasswordHash = hashPassword('Password123!');

  // 1. Create Administrator
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@opportunity.internal',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 2. Create Organizations & Recruiter Users
  const founderUser = await prisma.user.create({
    data: {
      email: 'karan@nexuslabs.co',
      passwordHash: defaultPasswordHash,
      role: 'COMPANY',
      status: 'ACTIVE',
    },
  });

  const nexusOrg = await prisma.organization.create({
    data: {
      name: 'Nexus Labs',
      slug: 'nexus-labs',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
      website: 'https://nexuslabs.co',
      industry: 'Developer Tools & AI Infrastructure',
      size: '11-50',
      description: 'Building high-performance infrastructure for young engineering teams and autonomous agents.',
      location: 'Bengaluru, India',
      verified: true,
      members: {
        create: {
          userId: founderUser.id,
          role: 'OWNER',
        },
      },
    },
  });

  const recruiterUser = await prisma.user.create({
    data: {
      email: 'aisha@orbitmedia.in',
      passwordHash: defaultPasswordHash,
      role: 'COMPANY',
      status: 'ACTIVE',
    },
  });

  const orbitOrg = await prisma.organization.create({
    data: {
      name: 'Orbit Studio',
      slug: 'orbit-studio',
      logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=128&auto=format&fit=crop&q=80',
      website: 'https://orbitstudio.in',
      industry: 'Creative Tech & Digital Brands',
      size: '1-10',
      description: 'Design and narrative accelerator partnering with breakthrough consumer technology ventures.',
      location: 'Mumbai, India',
      verified: true,
      members: {
        create: {
          userId: recruiterUser.id,
          role: 'RECRUITER',
        },
      },
    },
  });

  // 3. Create Opportunities
  const oppSales = await prisma.opportunity.create({
    data: {
      orgId: nexusOrg.id,
      title: 'Growth & Business Development Intern',
      slug: 'nexus-growth-sales-intern',
      category: 'INTERNSHIP',
      description:
        'Join our founding go-to-market pod. You will run high-touch outbound campaigns to engineering leaders, qualify inbound startup interest, and support community onboarding.',
      responsibilities:
        '• Build targeted prospect lists of tech founders\n• Run personalized cold outreach sequences with high deliverability\n• Schedule demo discovery calls and maintain CRM hygiene\n• Partner with the founder on community engagement',
      eligibilityCriteria:
        'Undergraduates or recent graduates available for at least 20 hours/week. Strong written English and demonstrated initiative.',
      workArrangement: 'HYBRID',
      location: 'Bengaluru',
      hoursPerWeekMin: 20,
      compensationType: 'STIPEND',
      compensationAmount: '₹30,000 / month',
      duration: '3 months',
      openingsCount: 2,
      status: 'PUBLISHED',
      skills: {
        create: [
          { name: 'Cold Outreach', slug: 'cold-outreach', isMandatory: true },
          { name: 'B2B Sales', slug: 'b2b-sales', isMandatory: true },
          { name: 'CRM (HubSpot)', slug: 'crm', isMandatory: false },
          { name: 'Copywriting', slug: 'copywriting', isMandatory: false },
        ],
      },
    },
  });

  const oppDev = await prisma.opportunity.create({
    data: {
      orgId: nexusOrg.id,
      title: 'Junior Fullstack Engineer (Next.js & TypeScript)',
      slug: 'nexus-junior-fullstack-dev',
      category: 'FULL_TIME',
      description:
        'Looking for a builder who loves clean code, fast APIs, and modern React architectures. You will ship directly to production on customer-facing features.',
      responsibilities:
        '• Develop responsive full-stack features using Next.js App Router\n• Integrate PostgreSQL schemas and Prisma ORM\n• Author clean tests and maintain microsecond latency',
      eligibilityCriteria:
        'Available 35+ hours/week. Must have public GitHub repos demonstrating working web applications.',
      workArrangement: 'REMOTE',
      location: 'Remote (India)',
      hoursPerWeekMin: 35,
      compensationType: 'PAID_RANGE',
      compensationAmount: '₹8,00,000 - ₹12,00,000 / year',
      duration: 'Permanent',
      openingsCount: 1,
      status: 'PUBLISHED',
      skills: {
        create: [
          { name: 'React', slug: 'react', isMandatory: true },
          { name: 'TypeScript', slug: 'typescript', isMandatory: true },
          { name: 'Next.js', slug: 'next.js', isMandatory: true },
          { name: 'PostgreSQL', slug: 'postgresql', isMandatory: false },
        ],
      },
    },
  });

  const oppDesign = await prisma.opportunity.create({
    data: {
      orgId: orbitOrg.id,
      title: 'Product Design & UI Fellow',
      slug: 'orbit-product-design-fellow',
      category: 'CAMPUS_FELLOW',
      description:
        'Work closely with seasoned art directors to craft world-class mobile and web user interfaces for next-generation consumer apps.',
      responsibilities:
        '• Build comprehensive Figma design systems and interactive prototypes\n• Conduct user usability tests with young creators\n• Prepare developer-ready design handoffs',
      eligibilityCriteria:
        'Demonstrated portfolio with at least 2 case studies showing design thinking and Figma proficiency.',
      workArrangement: 'REMOTE',
      location: 'Remote',
      hoursPerWeekMin: 15,
      compensationType: 'STIPEND',
      compensationAmount: '₹22,000 / month',
      duration: '6 months',
      openingsCount: 2,
      status: 'PUBLISHED',
      skills: {
        create: [
          { name: 'Figma', slug: 'figma', isMandatory: true },
          { name: 'UI/UX', slug: 'ui-ux', isMandatory: true },
          { name: 'Design Systems', slug: 'design-systems', isMandatory: false },
        ],
      },
    },
  });

  // 4. Create Candidates
  // Candidate A: Ananya Sharma (The core example from specification)
  const ananyaUser = await prisma.user.create({
    data: {
      email: 'ananya@university.edu',
      passwordHash: defaultPasswordHash,
      role: 'CANDIDATE',
      status: 'ACTIVE',
    },
  });

  const ananyaProfile = await prisma.candidateProfile.create({
    data: {
      userId: ananyaUser.id,
      fullName: 'Ananya Sharma',
      headline: 'Aspiring Growth & Sales Specialist | University Student & Community Lead',
      bio: 'Final year student passionate about B2B growth, sales velocity, and community-led customer acquisition. High agency and quick learner.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
      city: 'Bengaluru',
      country: 'India',
      status: 'STUDENT',
      primaryRole: 'Growth & Sales Specialist',
      yearsExperience: 0.5,
      availabilityHoursPerWeek: 25,
      startDate: 'Immediate',
      workArrangement: 'HYBRID',
      expectedCompensation: '₹25,000 - ₹35,000 / month',
      linkedinUrl: 'https://linkedin.com/in/ananya-sharma-demo',
      portfolioUrl: 'https://readcv.com/ananya-growth',
      githubUrl: 'https://github.com/ananya-sharma-sample',
      visibility: 'PUBLIC',
      onboardingCompleted: true,
      skills: {
        create: [
          { name: 'Cold Outreach', slug: 'cold-outreach', proficiency: 'ADVANCED' },
          { name: 'B2B Sales', slug: 'b2b-sales', proficiency: 'INTERMEDIATE' },
          { name: 'CRM (HubSpot)', slug: 'crm', proficiency: 'INTERMEDIATE' },
          { name: 'Copywriting', slug: 'copywriting', proficiency: 'ADVANCED' },
        ],
      },
      projects: {
        create: [
          {
            title: 'Campus E-Cell Startup Summit Partnerships',
            description: 'Led outreach to 120+ early-stage startups, securing 18 sponsors and ₹4.5L in corporate partnerships.',
            liveUrl: 'https://ecell-summit-archive.in',
            skillsUsed: 'Cold Outreach, B2B Sales, CRM',
            featured: true,
          },
          {
            title: 'Substack Growth Breakdown for Indian D2C',
            description: 'Authored 6 deep-dive case studies on consumer startup acquisition loops, gaining 1,200 organic readers.',
            liveUrl: 'https://substack.com/@ananyawrites',
            skillsUsed: 'Copywriting, Research',
            featured: false,
          },
        ],
      },
      education: {
        create: [
          {
            institution: 'Bangalore University',
            degree: 'Bachelor of Commerce (Honours)',
            fieldOfStudy: 'Marketing & Business Management',
            startYear: 2022,
            endYear: 2025,
          },
        ],
      },
    },
  });

  // Candidate B: Rohan Verma (Frontend / Fullstack Builder)
  const rohanUser = await prisma.user.create({
    data: {
      email: 'rohan@builder.dev',
      passwordHash: defaultPasswordHash,
      role: 'CANDIDATE',
      status: 'ACTIVE',
    },
  });

  const rohanProfile = await prisma.candidateProfile.create({
    data: {
      userId: rohanUser.id,
      fullName: 'Rohan Verma',
      headline: 'Full-stack Next.js Builder & Open-Source Enthusiast',
      bio: 'Self-taught engineer crafting fast, accessible web software. Shipped 4 production web apps and love TypeScript.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80',
      city: 'Delhi',
      country: 'India',
      status: 'FRESHER',
      primaryRole: 'Frontend Engineer',
      yearsExperience: 1.0,
      availabilityHoursPerWeek: 40,
      startDate: 'Within 2 weeks',
      workArrangement: 'REMOTE',
      expectedCompensation: '₹9,00,000 / year',
      githubUrl: 'https://github.com/rohan-builder-demo',
      portfolioUrl: 'https://rohanverma.dev',
      visibility: 'PUBLIC',
      onboardingCompleted: true,
      skills: {
        create: [
          { name: 'React', slug: 'react', proficiency: 'EXPERT' },
          { name: 'TypeScript', slug: 'typescript', proficiency: 'ADVANCED' },
          { name: 'Next.js', slug: 'next.js', proficiency: 'ADVANCED' },
          { name: 'PostgreSQL', slug: 'postgresql', proficiency: 'INTERMEDIATE' },
        ],
      },
      projects: {
        create: [
          {
            title: 'HyperLog: Fast developer telemetry viewer',
            description: 'Built a lightweight logs dashboard capable of streaming 10,000 records/sec using Next.js and WebSockets.',
            liveUrl: 'https://hyperlog-preview.vercel.app',
            repoUrl: 'https://github.com/rohan-builder-demo/hyperlog',
            skillsUsed: 'Next.js, TypeScript, React',
            featured: true,
          },
        ],
      },
    },
  });

  // Candidate C: Priya Nair (Product Designer)
  const priyaUser = await prisma.user.create({
    data: {
      email: 'priya@design.io',
      passwordHash: defaultPasswordHash,
      role: 'CANDIDATE',
      status: 'ACTIVE',
    },
  });

  await prisma.candidateProfile.create({
    data: {
      userId: priyaUser.id,
      fullName: 'Priya Nair',
      headline: 'Product & Visual Designer | Creating Intuitive Interfaces',
      bio: 'Obsessed with micro-interactions, clean type, and user research. Worked on fintech and edtech design systems.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&auto=format&fit=crop&q=80',
      city: 'Mumbai',
      country: 'India',
      status: 'STUDENT',
      primaryRole: 'Product Designer',
      yearsExperience: 0.8,
      availabilityHoursPerWeek: 20,
      startDate: 'Immediate',
      workArrangement: 'REMOTE',
      expectedCompensation: '₹25,000 / month',
      portfolioUrl: 'https://bento.me/priyanair-design',
      visibility: 'PUBLIC',
      onboardingCompleted: true,
      skills: {
        create: [
          { name: 'Figma', slug: 'figma', proficiency: 'EXPERT' },
          { name: 'UI/UX', slug: 'ui-ux', proficiency: 'ADVANCED' },
          { name: 'Design Systems', slug: 'design-systems', proficiency: 'INTERMEDIATE' },
        ],
      },
      projects: {
        create: [
          {
            title: 'Kavach: Personal Micro-Budgeting App',
            description: 'Designed an intuitive spending companion for college students with zero friction transactions.',
            liveUrl: 'https://www.figma.com/@priyanair/kavach',
            skillsUsed: 'Figma, UI/UX',
            featured: true,
          },
        ],
      },
    },
  });

  // 5. Create Ananya's Real Application to Nexus Growth Intern
  const application = await prisma.application.create({
    data: {
      opportunityId: oppSales.id,
      candidateId: ananyaProfile.id,
      status: 'SHORTLISTED',
      pitch:
        "Hi Karan! I have been following Nexus Labs' infrastructure updates. In my university E-Cell, I personally scaled outbound sponsor conversions by 40% using structured email sequences. I would love to bring that hustle to your founding GTM pod.",
      portfolioHighlight: 'https://readcv.com/ananya-growth',
      matchScoreAtApplication: 84,
      notes: {
        create: [
          {
            authorId: founderUser.id,
            content: 'Great initiative in her E-cell summit work. High agency communication. Let us invite her for an intro round.',
          },
        ],
      },
    },
  });

  // 6. Create Initial In-App Notifications
  await prisma.notification.create({
    data: {
      userId: ananyaUser.id,
      title: 'Application Shortlisted! 🎉',
      message: 'Nexus Labs has shortlisted your application for Growth & Business Development Intern.',
      type: 'STATUS_CHANGE',
      link: `/candidate/applications`,
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: founderUser.id,
      title: 'High-Match Candidate Discovered ✨',
      message: 'Ananya Sharma (84% Match) applied for Growth & Business Development Intern.',
      type: 'MATCH_ALERT',
      link: `/company/opportunities/${oppSales.id}/pipeline`,
      read: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZED',
      targetType: 'Platform',
      details: JSON.stringify({ seededProfiles: 3, seededOpportunities: 3, organizations: 2 }),
    },
  });

  console.log('✅ Seeding complete!');
  console.log('Accounts ready:');
  console.log('- Candidate: ananya@university.edu (Password: Password123!)');
  console.log('- Candidate: rohan@builder.dev (Password: Password123!)');
  console.log('- Company Founder: karan@nexuslabs.co (Password: Password123!)');
  console.log('- Platform Admin: admin@opportunity.internal (Password: Password123!)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
