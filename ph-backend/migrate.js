/**
 * Migration script runner
 *
 * This script compiles and runs the TypeScript migration script to update the database schema.
 *
 * Usage:
 * node migrate.js
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Compiling TypeScript migration script...');
  execSync('npx tsc src/migration-script.ts --outDir dist', { stdio: 'inherit' });

  console.log('Running migration...');
  execSync('node dist/migration-script.js', { stdio: 'inherit' });

  console.log('Migration process completed.');
} catch (error) {
  console.error('Migration process failed:', error.message);
  process.exit(1);
}
