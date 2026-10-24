// Deterministic, explainable matching engine for candidates and opportunities

export interface CanonicalSkill {
  name: string;
  slug: string;
  proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  isMandatory?: boolean;
}

export interface CandidateProfileInput {
  id: string;
  fullName: string;
  primaryRole?: string | null;
  status?: string | null; // STUDENT, FRESHER, EMPLOYED, FREELANCER, BUILDER
  city?: string | null;
  country?: string | null;
  availabilityHoursPerWeek: number;
  workArrangement: string; // REMOTE, HYBRID, ONSITE, ANY
  yearsExperience: number;
  skills: { name: string; slug: string; proficiency: string }[];
  projects: { title: string; liveUrl?: string | null; repoUrl?: string | null; skillsUsed?: string | null }[];
  expectedCompensation?: string | null;
}

export interface OpportunityInput {
  id: string;
  title: string;
  category: string; // INTERNSHIP, FULL_TIME, FREELANCE, CONTRACT, CAMPUS_FELLOW
  location: string;
  workArrangement: string; // REMOTE, HYBRID, ONSITE
  hoursPerWeekMin: number;
  skills: { name: string; slug: string; isMandatory: boolean }[];
  compensationType?: string;
  compensationAmount?: string | null;
}

export interface MatchResult {
  score: number; // 0 - 100
  isEligible: boolean;
  unmetMandatory: string[];
  matchingSkills: { name: string; proficiency: string; isMandatory: boolean }[];
  missingPreferredSkills: string[];
  missingInformation: string[];
  explanation: string;
  dimensionScores: {
    requiredSkills: number;
    roleAlignment: number;
    proofOfWork: number;
    availability: number;
    locationWorkMode: number;
    preferredSkills: number;
  };
}

// Canonical Skill Dictionary & Synonyms
const SYNONYMS: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  reactjs: 'react',
  'react.js': 'react',
  nextjs: 'next.js',
  'next.js': 'next.js',
  node: 'node.js',
  nodejs: 'node.js',
  py: 'python',
  'ui/ux': 'ui-ux',
  figma: 'figma',
  'product-design': 'ui-ux',
  'cold-email': 'cold-outreach',
  'cold-outreach': 'cold-outreach',
  'sales-development': 'sdr',
  sdr: 'sdr',
  b2b: 'b2b-sales',
  'b2b-sales': 'b2b-sales',
  leadgen: 'lead-generation',
  'lead-generation': 'lead-generation',
  seo: 'seo',
  content: 'content-marketing',
  copywriting: 'copywriting',
  postgres: 'postgresql',
  sql: 'postgresql',
  tailwind: 'tailwind-css',
  'tailwind-css': 'tailwind-css',
};

export function normalizeSkillSlug(skill: string): string {
  const cleaned = skill
    .toLowerCase()
    .trim()
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-');
  return SYNONYMS[cleaned] || cleaned;
}

const PROFICIENCY_MULTIPLIER: Record<string, number> = {
  BEGINNER: 0.7,
  INTERMEDIATE: 0.9,
  ADVANCED: 1.0,
  EXPERT: 1.1,
};

/**
 * Evaluates candidate profile suitability against an opportunity.
 * Completely deterministic, transparent, and explainable.
 */
export function evaluateMatch(
  candidate: CandidateProfileInput,
  opportunity: OpportunityInput
): MatchResult {
  const unmetMandatory: string[] = [];
  const missingInformation: string[] = [];
  const matchingSkills: { name: string; proficiency: string; isMandatory: boolean }[] = [];
  const missingPreferredSkills: string[] = [];

  // Map candidate skills by canonical slug
  const candidateSkillMap = new Map<string, { name: string; proficiency: string }>();
  for (const s of candidate.skills) {
    const canonical = normalizeSkillSlug(s.slug || s.name);
    candidateSkillMap.set(canonical, {
      name: s.name,
      proficiency: s.proficiency || 'INTERMEDIATE',
    });
  }

  // 1. Mandatory Skills & Preferred Skills check
  const requiredOppSkills = opportunity.skills.filter((s) => s.isMandatory);
  const preferredOppSkills = opportunity.skills.filter((s) => !s.isMandatory);

  let requiredSkillPoints = 0;
  const maxRequiredSkillPoints = Math.max(requiredOppSkills.length, 1);

  for (const req of requiredOppSkills) {
    const slug = normalizeSkillSlug(req.slug || req.name);
    const matched = candidateSkillMap.get(slug);
    if (matched) {
      const multiplier = PROFICIENCY_MULTIPLIER[matched.proficiency] || 0.9;
      requiredSkillPoints += Math.min(1.0, multiplier);
      matchingSkills.push({
        name: matched.name,
        proficiency: matched.proficiency,
        isMandatory: true,
      });
    } else {
      unmetMandatory.push(`Missing mandatory skill: ${req.name}`);
    }
  }

  let preferredSkillPoints = 0;
  const maxPreferredPoints = Math.max(preferredOppSkills.length, 1);

  for (const pref of preferredOppSkills) {
    const slug = normalizeSkillSlug(pref.slug || pref.name);
    const matched = candidateSkillMap.get(slug);
    if (matched) {
      preferredSkillPoints += 1;
      matchingSkills.push({
        name: matched.name,
        proficiency: matched.proficiency,
        isMandatory: false,
      });
    } else {
      missingPreferredSkills.push(pref.name);
    }
  }

  // 2. Hard Eligibility: Hours per week commitment
  let availabilityScore = 100;
  if (candidate.availabilityHoursPerWeek < opportunity.hoursPerWeekMin) {
    const deficit = opportunity.hoursPerWeekMin - candidate.availabilityHoursPerWeek;
    if (deficit > 5) {
      unmetMandatory.push(
        `Requires min ${opportunity.hoursPerWeekMin} hrs/week (candidate currently specifies ${candidate.availabilityHoursPerWeek} hrs/week)`
      );
      availabilityScore = Math.max(10, Math.round((candidate.availabilityHoursPerWeek / opportunity.hoursPerWeekMin) * 70));
    } else {
      availabilityScore = 75;
    }
  } else {
    availabilityScore = 100;
  }

  // 3. Hard Eligibility: Location & Work Arrangement
  let locationScore = 100;
  const oppArrangement = (opportunity.workArrangement || 'REMOTE').toUpperCase();
  const candArrangement = (candidate.workArrangement || 'ANY').toUpperCase();

  if (oppArrangement === 'ONSITE') {
    if (candArrangement === 'REMOTE') {
      unmetMandatory.push(
        `Position requires Onsite presence in ${opportunity.location}, but candidate preferred arrangement is Remote only`
      );
      locationScore = 20;
    } else if (candidate.city && opportunity.location) {
      const candCity = candidate.city.toLowerCase().trim();
      const oppCity = opportunity.location.toLowerCase().trim();
      if (!oppCity.includes(candCity) && !candCity.includes(oppCity)) {
        locationScore = 60; // Different cities, may require relocation
      } else {
        locationScore = 100;
      }
    }
  } else if (oppArrangement === 'HYBRID') {
    if (candArrangement === 'REMOTE') {
      locationScore = 65;
    } else {
      locationScore = 95;
    }
  } else {
    // Remote
    locationScore = 100;
  }

  // 4. Role & Category Alignment
  let roleScore = 60;
  const roleText = (candidate.primaryRole || '').toLowerCase();
  const titleText = opportunity.title.toLowerCase();

  if (roleText) {
    const roleWords = roleText.split(/\s+/).filter((w) => w.length > 2);
    let matchedWords = 0;
    for (const w of roleWords) {
      if (titleText.includes(w)) matchedWords++;
    }
    if (matchedWords >= 2 || titleText.includes(roleText) || roleText.includes(titleText)) {
      roleScore = 100;
    } else if (matchedWords === 1) {
      roleScore = 80;
    } else {
      roleScore = 65;
    }
  } else {
    missingInformation.push('Candidate primary role not specified');
    roleScore = 60;
  }

  // Check category fit (Internship fits students/freshers)
  const candStatus = (candidate.status || '').toUpperCase();
  if (opportunity.category === 'INTERNSHIP') {
    if (candStatus === 'STUDENT' || candStatus === 'FRESHER') {
      roleScore = Math.min(100, roleScore + 10);
    }
  }

  // 5. Proof of Work & Projects
  let proofScore = 40;
  const projects = candidate.projects || [];
  if (projects.length > 0) {
    let scoreAcc = 50;
    for (const p of projects) {
      if (p.liveUrl) scoreAcc += 15;
      if (p.repoUrl) scoreAcc += 15;
      if (p.skillsUsed) scoreAcc += 10;
    }
    proofScore = Math.min(100, scoreAcc);
  } else {
    missingInformation.push('No portfolio projects submitted yet');
    proofScore = 40;
  }

  // Dimension calculations (0 - 100)
  const requiredSkillsScore =
    requiredOppSkills.length > 0
      ? Math.min(100, Math.round((requiredSkillPoints / maxRequiredSkillPoints) * 100))
      : 85;

  const preferredSkillsScore =
    preferredOppSkills.length > 0
      ? Math.min(100, Math.round((preferredSkillPoints / maxPreferredPoints) * 100))
      : 80;

  // Weighted formula:
  // Required skills: 35%
  // Role & Category: 20%
  // Proof of work: 15%
  // Availability: 10%
  // Location / Arrangement: 10%
  // Preferred skills: 10%
  const rawWeightedScore =
    requiredSkillsScore * 0.35 +
    roleScore * 0.2 +
    proofScore * 0.15 +
    availabilityScore * 0.1 +
    locationScore * 0.1 +
    preferredSkillsScore * 0.1;

  // Apply penalty if hard constraints are violated
  let finalScore = Math.round(rawWeightedScore);
  const isEligible = unmetMandatory.length === 0;

  if (!isEligible) {
    // If hard constraints violated, cap or discount score so eligible candidates always rank higher
    finalScore = Math.min(finalScore, Math.max(30, finalScore - unmetMandatory.length * 15));
  }

  // Generate transparent human explanation
  const explanationParts: string[] = [];

  if (requiredOppSkills.length > 0 && matchingSkills.filter((s) => s.isMandatory).length > 0) {
    const matchedCount = matchingSkills.filter((s) => s.isMandatory).length;
    explanationParts.push(
      `Strong alignment on ${matchedCount} of ${requiredOppSkills.length} required skills (${matchingSkills
        .filter((s) => s.isMandatory)
        .map((s) => s.name)
        .slice(0, 3)
        .join(', ')})`
    );
  }

  if (roleScore >= 80) {
    explanationParts.push(`Direct role alignment with candidate focus as "${candidate.primaryRole}"`);
  }

  if (projects.length > 0 && proofScore >= 70) {
    explanationParts.push(
      `Verified proof-of-work with ${projects.length} project${projects.length > 1 ? 's' : ''}`
    );
  }

  if (unmetMandatory.length > 0) {
    explanationParts.push(`Note: ${unmetMandatory.join('; ')}`);
  } else if (availabilityScore === 100) {
    explanationParts.push(
      `Full commitment compatibility (${candidate.availabilityHoursPerWeek} hrs/week available)`
    );
  }

  const explanation =
    explanationParts.length > 0
      ? explanationParts.join('. ') + '.'
      : 'Candidate meets general platform profile criteria.';

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    isEligible,
    unmetMandatory,
    matchingSkills,
    missingPreferredSkills,
    missingInformation,
    explanation,
    dimensionScores: {
      requiredSkills: requiredSkillsScore,
      roleAlignment: roleScore,
      proofOfWork: proofScore,
      availability: availabilityScore,
      locationWorkMode: locationScore,
      preferredSkills: preferredSkillsScore,
    },
  };
}
