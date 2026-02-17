const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load config
const envPath = path.join(__dirname, '.env');
let config = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split('\n');
  let currentKey = '';
  let currentValue = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (/^[A-Z_]+=/.test(trimmed)) {
      if (currentKey) config[currentKey] = currentValue.trim();
      const [key, ...rest] = trimmed.split('=');
      currentKey = key;
      currentValue = rest.join('=');
    } else {
      currentValue += '\n' + trimmed;
    }
  }
  if (currentKey) config[currentKey] = currentValue.trim();
}

console.log('📋 Config loaded:', Object.keys(config));

if (!config.FIREBASE_SERVICE_ACCOUNT_JSON && !config.FIREBASE_SERVICE_ACCOUNT_PATH) {
  console.error('❌ No Firebase credentials found');
  process.exit(1);
}

if (!config.FIREBASE_DATABASE_URL) {
  console.error('❌ No FIREBASE_DATABASE_URL found');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_JSON);
  console.log('✅ Firebase credentials parsed');
} catch (e) {
  console.error('❌ Failed to parse JSON:', e.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.FIREBASE_DATABASE_URL,
});

const db = admin.database();
const projectId = '-OlgtvBsWKXNfOyQFBRf';

console.log('\n🔍 Checking Firebase Realtime Database...');
console.log('Project ID:', projectId);

// Check entire project structure
db.ref('projects/' + projectId).once('value', (snapshot) => {
  const projectData = snapshot.val();

  if (!projectData) {
    console.log('\n❌ Project not found in database');
    console.log('   Path: projects/' + projectId);

    // Check if projects exist
    db.ref('projects').once('value', (snap) => {
      const projects = snap.val();
      if (!projects) {
        console.log('\n❌ No projects at all in database');
      } else {
        console.log('\n✅ Projects found:');
        Object.keys(projects).forEach(id => {
          console.log('   -', id);
        });
      }
      process.exit(0);
    });
  } else {
    console.log('\n✅ Project found!');
    console.log('   Keys in project:', Object.keys(projectData));

    if (projectData.tasks) {
      const taskIds = Object.keys(projectData.tasks);
      console.log(`\n✅ Found ${taskIds.length} tasks:`);
      Object.entries(projectData.tasks).slice(0, 5).forEach(([id, task]) => {
        console.log(`   - ${task.title} (${task.status})`);
      });
      if (taskIds.length > 5) {
        console.log(`   ... and ${taskIds.length - 5} more`);
      }
    } else {
      console.log('\n❌ No "tasks" key in project');
    }

    process.exit(0);
  }
}, (error) => {
  console.error('Firebase error:', error);
  process.exit(1);
});

setTimeout(() => {
  console.error('\n⏱️ Timeout - no response from Firebase');
  process.exit(1);
}, 10000);
