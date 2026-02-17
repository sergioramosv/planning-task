#!/usr/bin/env node

/**
 * Manual Release Script
 * Actualiza la versión en package.json y CHANGELOG.md localmente
 * Basado en los commits desde la última versión
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.join(__dirname, '../package.json');
const changelogPath = path.join(__dirname, '../CHANGELOG.md');

// Leer package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const currentVersion = packageJson.version;

console.log('📦 Current version:', currentVersion);

// Obtener commits desde el último tag
let commits = [];
try {
  const output = execSync('git log --oneline --pretty=%B $(git rev-list --tags --max-count=1)..HEAD 2>/dev/null || git log --oneline --pretty=%B', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'ignore']
  });

  commits = output.split('\n').filter(line => line.trim().length > 0);
} catch (e) {
  console.log('No tags found, using all commits');
  try {
    const output = execSync('git log --oneline --pretty=%B --reverse', { encoding: 'utf-8' });
    commits = output.split('\n').filter(line => line.trim().length > 0);
  } catch (err) {
    console.error('Error reading commits:', err.message);
    process.exit(1);
  }
}

console.log(`📝 Found ${commits.length} commits since last version`);

// Analizar commits para determinar nueva versión
let hasBreaking = false;
let hasFeature = false;
let hasFix = false;

commits.forEach(commit => {
  if (commit.includes('BREAKING CHANGE') || commit.startsWith('feat!:')) {
    hasBreaking = true;
  } else if (commit.startsWith('feat:')) {
    hasFeature = true;
  } else if (commit.startsWith('fix:')) {
    hasFix = true;
  }
});

// Calcular nueva versión (semver)
const [major, minor, patch] = currentVersion.split('.').map(Number);
let newVersion;

if (hasBreaking) {
  newVersion = `${major + 1}.0.0`;
  console.log('🔴 Breaking changes detected → MAJOR version bump');
} else if (hasFeature) {
  newVersion = `${major}.${minor + 1}.0`;
  console.log('🟢 Features detected → MINOR version bump');
} else if (hasFix) {
  newVersion = `${major}.${minor}.${patch + 1}`;
  console.log('🟡 Fixes detected → PATCH version bump');
} else {
  console.log('ℹ️  No versionable commits found. Skipping release.');
  process.exit(0);
}

console.log(`✨ New version: ${newVersion}`);

// Actualizar package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Updated package.json');

// Actualizar CHANGELOG.md
const now = new Date();
const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
const changelogEntry = `## [${newVersion}] - ${dateStr}

### Added
${commits.filter(c => c.startsWith('feat:')).map(c => `- ${c.replace(/^feat:\s*/, '')}`).join('\n') || '- No new features'}

### Fixed
${commits.filter(c => c.startsWith('fix:')).map(c => `- ${c.replace(/^fix:\s*/, '')}`).join('\n') || '- No fixes'}

### Changed
${commits.filter(c => c.startsWith('refactor:') || c.startsWith('perf:')).map(c => `- ${c.replace(/^(refactor:|perf:)\s*/, '')}`).join('\n') || ''}

`;

const existingChangelog = fs.readFileSync(changelogPath, 'utf-8');
const newChangelog = changelogEntry + '\n' + existingChangelog;
fs.writeFileSync(changelogPath, newChangelog);
console.log('✅ Updated CHANGELOG.md');

// Crear commit
try {
  execSync(`git add package.json CHANGELOG.md`);
  execSync(`git commit -m "chore(release): ${newVersion}"`);
  console.log(`✅ Created commit: chore(release): ${newVersion}`);

  // Crear tag
  execSync(`git tag v${newVersion}`);
  console.log(`✅ Created tag: v${newVersion}`);

  console.log('\n🎉 Release prepared successfully!');
  console.log(`\nNext steps:`);
  console.log(`1. Verify changes: git show HEAD`);
  console.log(`2. Push commits: git push origin main`);
  console.log(`3. Push tags: git push origin v${newVersion}`);
} catch (err) {
  console.error('❌ Error creating commit/tag:', err.message);
  process.exit(1);
}
