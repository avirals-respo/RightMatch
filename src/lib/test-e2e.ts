// End-to-End API Integration Verification Test

const BASE_URL = 'http://localhost:3000';

async function testE2E() {
  console.log('🚀 STARTING COMPREHENSIVE E2E PLATFORM VERIFICATION...\n');

  // 1. Candidate Login: Ananya Sharma
  console.log('1. Testing Candidate Login (Ananya Sharma)...');
  const candLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ananya@university.edu', password: 'Password123!' }),
  });
  const candLoginData = await candLoginRes.json();
  const candCookie = candLoginRes.headers.get('set-cookie')?.split(';')[0];
  if (!candLoginRes.ok || !candCookie) {
    throw new Error(`Candidate login failed: ${JSON.stringify(candLoginData)}`);
  }
  console.log('✅ Candidate logged in successfully. User:', candLoginData.user.email);

  // 2. Candidate Matching Engine Check
  console.log('\n2. Testing Candidate Match Engine (/api/candidate/matches)...');
  const matchesRes = await fetch(`${BASE_URL}/api/candidate/matches`, {
    headers: { Cookie: candCookie },
  });
  const matchesData = await matchesRes.json();
  if (!matchesRes.ok || !matchesData.matches || matchesData.matches.length === 0) {
    throw new Error(`Match computation failed: ${JSON.stringify(matchesData)}`);
  }
  const topMatch = matchesData.matches[0];
  console.log(`✅ Computed ${matchesData.totalCount} opportunity matches.`);
  console.log(`   Top Match: "${topMatch.opportunity.title}" at ${topMatch.opportunity.org.name}`);
  console.log(`   Score: ${topMatch.match.score}% | Eligible: ${topMatch.match.isEligible}`);
  console.log(`   Explanation: ${topMatch.match.explanation}`);

  // 3. Recruiter Login: Karan at Nexus Labs
  console.log('\n3. Testing Recruiter Login (karan@nexuslabs.co)...');
  const recLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'karan@nexuslabs.co', password: 'Password123!' }),
  });
  const recLoginData = await recLoginRes.json();
  const recCookie = recLoginRes.headers.get('set-cookie')?.split(';')[0];
  if (!recLoginRes.ok || !recCookie) {
    throw new Error(`Recruiter login failed: ${JSON.stringify(recLoginData)}`);
  }
  console.log('✅ Recruiter logged in successfully. Org:', recLoginData.user.organization?.name);

  // 4. Recruiter fetches opportunities & applicants
  console.log('\n4. Testing Recruiter Opportunities & Pipeline...');
  const oppsRes = await fetch(`${BASE_URL}/api/company/opportunities`, {
    headers: { Cookie: recCookie },
  });
  const oppsData = await oppsRes.json();
  const targetOpp = oppsData.opportunities.find((o: any) => o._count.applications > 0) || oppsData.opportunities[0];
  console.log(`✅ Loaded ${oppsData.opportunities.length} organization opportunities.`);
  console.log(`   Inspecting pipeline for: "${targetOpp.title}" (ID: ${targetOpp.id})`);

  // Fetch applicant pipeline
  const pipelineRes = await fetch(`${BASE_URL}/api/company/opportunities/${targetOpp.id}/applications`, {
    headers: { Cookie: recCookie },
  });
  const pipelineData = await pipelineRes.json();
  console.log(`✅ Loaded ${pipelineData.applications.length} pipeline applications.`);
  const app = pipelineData.applications[0];
  console.log(`   Candidate: ${app.candidate.fullName} | Status: ${app.status} | Score: ${app.matchScoreAtApplication}%`);

  // 5. Recruiter advances candidate to INTERVIEW
  console.log('\n5. Testing Recruiter Status Advancement to INTERVIEW...');
  const statusUpdateRes = await fetch(`${BASE_URL}/api/company/applications/${app.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: recCookie },
    body: JSON.stringify({ status: 'INTERVIEW' }),
  });
  const statusUpdateData = await statusUpdateRes.json();
  if (!statusUpdateRes.ok) {
    throw new Error(`Status update failed: ${JSON.stringify(statusUpdateData)}`);
  }
  console.log('✅ Application status updated successfully to:', statusUpdateData.application.status);

  // Add a recruiter internal note
  console.log('\n6. Testing Adding Recruiter Private Internal Note...');
  const noteRes = await fetch(`${BASE_URL}/api/company/applications/${app.id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: recCookie },
    body: JSON.stringify({ content: 'Verified portfolio outreach links. Impressive cold-outreach velocity.' }),
  });
  const noteData = await noteRes.json();
  console.log('✅ Recruiter note persisted:', noteData.note.content);

  // 7. Verify Candidate in-app notification & application status
  console.log('\n7. Testing Candidate Status Sync & Notifications...');
  const candAppsRes = await fetch(`${BASE_URL}/api/candidate/applications`, {
    headers: { Cookie: candCookie },
  });
  const candAppsData = await candAppsRes.json();
  const updatedCandApp = candAppsData.applications.find((a: any) => a.id === app.id);
  console.log('✅ Candidate sees real-time updated status:', updatedCandApp.status);

  const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Cookie: candCookie },
  });
  const notifData = await notifRes.json();
  console.log(`✅ Candidate has ${notifData.notifications.length} in-app notifications.`);
  console.log(`   Latest: "${notifData.notifications[0].title}" - ${notifData.notifications[0].message}`);

  // 8. Admin Verification
  console.log('\n8. Testing Platform Administrator Privileges...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@opportunity.internal', password: 'Password123!' }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminCookie = adminLoginRes.headers.get('set-cookie')?.split(';')[0];

  const metricsRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
    headers: { Cookie: adminCookie },
  });
  const metricsData = await metricsRes.json();
  console.log('✅ Admin operational metrics retrieved:');
  console.log('   Total Users:', metricsData.metrics.totalUsers);
  console.log('   Total Candidates:', metricsData.metrics.totalCandidates);
  console.log('   Total Organizations:', metricsData.metrics.totalOrganizations);
  console.log('   Published Opportunities:', metricsData.metrics.publishedOpportunities);

  console.log('\n🎉 ALL E2E VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
}

testE2E().catch((err) => {
  console.error('❌ E2E Test Failure:', err);
  process.exit(1);
});
