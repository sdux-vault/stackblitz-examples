#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../../');
const templatesDir = path.join(__dirname, 'templates', 'global');
const angularExamplesDir = path.join(projectRoot, 'stackblitz', 'angular');

function getTemplateFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = path.join(base, entry.name);
    if (entry.isDirectory()) {
      files.push(...getTemplateFiles(path.join(dir, entry.name), relative));
    } else {
      files.push(relative);
    }
  }

  return files;
}

const filesToCopy = getTemplateFiles(templatesDir);

if (!fs.existsSync(angularExamplesDir)) {
  console.error(
    `❌ Angular examples directory not found: ${angularExamplesDir}`
  );
  process.exit(1);
}

const examples = fs
  .readdirSync(angularExamplesDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

if (examples.length === 0) {
  console.info('No angular examples found.');
  process.exit(0);
}

console.info(
  `\n🔄 Copying global templates to ${examples.length} angular example(s)...\n`
);

for (const example of examples) {
  const exampleDir = path.join(angularExamplesDir, example);

  for (const file of filesToCopy) {
    const src = path.join(templatesDir, file);
    const dest = path.join(exampleDir, file);

    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(src, dest);
    console.info(`  ✅ ${example}/${file}`);
  }
}

console.info('\n✅ Global templates applied successfully.\n');
