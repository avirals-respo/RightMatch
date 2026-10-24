// scripts/db-deploy.js
// Safe database initialization and migration runner for Vercel builds
const { execSync } = require('child_process');

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.Prisma_Database_DATABASE_URL ||
  process.env.Prisma_Database_POSTGRES_URL;

console.log('[RightMatch Build] Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

if (dbUrl && !dbUrl.startsWith('file:')) {
  console.log('[RightMatch Build] PostgreSQL database URL detected.');
  const env = { ...process.env, DATABASE_URL: dbUrl };

  try {
    console.log('[RightMatch Build] Deploying pending Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
    console.log('[RightMatch Build] Migrations deployed successfully.');
  } catch (err) {
    console.warn('[RightMatch Build] Migration notice:', err.message);
  }

  try {
    console.log('[RightMatch Build] Checking database seed status...');
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env });
    console.log('[RightMatch Build] Seed check complete.');
  } catch (err) {
    console.warn('[RightMatch Build] Seed check notice:', err.message);
  }
} else {
  console.log('[RightMatch Build] Skipping remote migration (no remote DATABASE_URL configured during build).');
}
