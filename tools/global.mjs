#!/usr/bin/env node

/**
 * CLI entry point for copying global template files to all examples across all languages.
 *
 * Discovers language folders under `tools/` (each must contain `templates/global/`),
 * then copies every global template file into each example directory for that language.
 *
 * Supports `--language=<name>` to target a single language.
 *
 * @module global
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalCopy } from './shared/global-copy.class.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../');

/**
 * Discovers all language directories that contain a `templates/global/` folder.
 *
 * @returns {string[]} Array of language folder names.
 */
function discoverLanguages() {
  return fs
    .readdirSync(__dirname, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name !== 'shared')
    .filter((dirent) =>
      fs.existsSync(path.join(__dirname, dirent.name, 'templates', 'global'))
    )
    .map((dirent) => dirent.name);
}

const languageFlag = process.argv
  .find((arg) => arg.startsWith('--language='))
  ?.split('=')[1];

const languages = languageFlag ? [languageFlag] : discoverLanguages();

if (languages.length === 0) {
  console.info('No languages with global templates found.');
  process.exit(0);
}

let hasError = false;

for (const language of languages) {
  const templatesDir = path.join(__dirname, language, 'templates', 'global');
  const examplesDir = path.join(projectRoot, 'stackblitz', language);

  if (!fs.existsSync(templatesDir)) {
    console.error(
      `❌ No global templates found for ${language}: ${templatesDir}`
    );
    hasError = true;
    continue;
  }

  const globalCopy = new GlobalCopy({
    templatesDir,
    examplesDir,
    language
  });

  try {
    globalCopy.run();
  } catch (err) {
    console.error(`❌ [${language}] ${err.message}`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.info('\n✅ All global templates applied successfully.\n');
