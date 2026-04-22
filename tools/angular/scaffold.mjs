#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../../');
const scaffoldingDir = path.join(__dirname, 'templates', 'scaffolding');
const angularExamplesDir = path.join(projectRoot, 'stackblitz', 'angular');

/* -----------------------------------------------------------
 * PROMPT
 * --------------------------------------------------------- */

function askForName() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\nEnter the example name (kebab-case): ', (answer) => {
      rl.close();

      const name = answer.trim().toLowerCase().replace(/\s+/g, '-');

      if (!name) {
        console.error('❌ Name cannot be empty.');
        process.exit(1);
      }

      resolve(name);
    });
  });
}

/* -----------------------------------------------------------
 * COPY DIRECTORY RECURSIVELY
 * --------------------------------------------------------- */

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/* -----------------------------------------------------------
 * MAIN
 * --------------------------------------------------------- */

const name = await askForName();
const targetDir = path.join(angularExamplesDir, name);

if (fs.existsSync(targetDir)) {
  console.error(`❌ Example already exists: ${targetDir}`);
  process.exit(1);
}

console.info(`\n🔧 Scaffolding new example: stackblitz/angular/${name}\n`);

copyDir(scaffoldingDir, targetDir);

console.info(`✅ Created: stackblitz/angular/${name}`);
console.info(`\nNext steps:`);
console.info(`  cd stackblitz/angular/${name}`);
console.info(`  npm install`);
console.info(`  npm start\n`);
