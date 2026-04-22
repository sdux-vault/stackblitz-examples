#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalCopy } from './global.class.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../../');

const globalCopy = new GlobalCopy({
  templatesDir: path.join(__dirname, 'templates', 'global'),
  angularExamplesDir: path.join(projectRoot, 'stackblitz', 'angular')
});

try {
  globalCopy.run();
} catch (err) {
  console.error(`❌ ${err.message}`);
  process.exit(1);
}

console.info('\n✅ Global templates applied successfully.\n');
