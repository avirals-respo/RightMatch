import { evaluateMatch, CandidateProfileInput, OpportunityInput } from './matching-engine';

// Scenario 1: Ananya (Sales/Growth Intern with verified proof of work & 25 hrs/week)
const ananya: CandidateProfileInput = {
  id: 'cand-ananya',
  fullName: 'Ananya Sharma',
  primaryRole: 'Growth & Sales Specialist',
  status: 'STUDENT',
  city: 'Bengaluru',
  country: 'India',
  availabilityHoursPerWeek: 25,
  workArrangement: 'HYBRID',
  yearsExperience: 0.5,
  skills: [
    { name: 'Cold Outreach', slug: 'cold-outreach', proficiency: 'ADVANCED' },
    { name: 'B2B Sales', slug: 'b2b-sales', proficiency: 'INTERMEDIATE' },
    { name: 'CRM (HubSpot)', slug: 'crm', proficiency: 'INTERMEDIATE' },
    { name: 'Copywriting', slug: 'copywriting', proficiency: 'ADVANCED' },
  ],
  projects: [
    {
      title: 'College Entrepreneurship Cell Outreach',
      liveUrl: 'https://ecell-summit.in',
      repoUrl: null,
      skillsUsed: 'Cold Outreach, B2B Sales, CRM',
    },
  ],
};

// Opportunity 1: Startup looking for Sales & Growth Intern
const salesInternOpp: OpportunityInput = {
  id: 'opp-growth-intern',
  title: 'Growth & Sales Intern',
  category: 'INTERNSHIP',
  location: 'Bengaluru',
  workArrangement: 'HYBRID',
  hoursPerWeekMin: 20,
  skills: [
    { name: 'Cold Outreach', slug: 'cold-outreach', isMandatory: true },
    { name: 'B2B Sales', slug: 'b2b-sales', isMandatory: true },
    { name: 'Figma', slug: 'figma', isMandatory: false }, // Preferred bonus
  ],
};

// Opportunity 2: High hour requirement (40 hrs/week Full-time Onsite in Mumbai)
const heavyOpp: OpportunityInput = {
  id: 'opp-mumbai-heavy',
  title: 'Full-time Operations Associate',
  category: 'FULL_TIME',
  location: 'Mumbai',
  workArrangement: 'ONSITE',
  hoursPerWeekMin: 40,
  skills: [{ name: 'Supply Chain', slug: 'supply-chain', isMandatory: true }],
};

console.log('--- RUNNING MATCHING ENGINE VERIFICATION ---');

// Test 1: Ideal match
const match1 = evaluateMatch(ananya, salesInternOpp);
console.log('TEST 1 (Ananya vs Sales Intern):');
console.log('Score:', match1.score);
console.log('Eligible:', match1.isEligible);
console.log('Explanation:', match1.explanation);
console.log('Matching Skills:', match1.matchingSkills.map((s) => s.name));
console.log('Missing Preferred:', match1.missingPreferredSkills);
console.log('Unmet Mandatory:', match1.unmetMandatory);

if (match1.score >= 80 && match1.isEligible && match1.unmetMandatory.length === 0) {
  console.log('>>> TEST 1 PASSED: High compatibility detected accurately!');
} else {
  console.error('>>> TEST 1 FAILED!');
  process.exit(1);
}

// Test 2: Unmet mandatory constraints
const match2 = evaluateMatch(ananya, heavyOpp);
console.log('\nTEST 2 (Ananya vs Mumbai Onsite 40hr):');
console.log('Score:', match2.score);
console.log('Eligible:', match2.isEligible);
console.log('Unmet Mandatory:', match2.unmetMandatory);

if (!match2.isEligible && match2.unmetMandatory.length >= 2) {
  console.log('>>> TEST 2 PASSED: Hard constraints flagged correctly!');
} else {
  console.error('>>> TEST 2 FAILED!');
  process.exit(1);
}

console.log('\nALL MATCHING ENGINE TESTS PASSED SUCCESSFULLY!');
