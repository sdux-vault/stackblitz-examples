#!/usr/bin/env node

/**
 * CLI entry point for scaffolding a new StackBlitz example.
 *
 * Prompts the user for an example name and optionally accepts a `--language=<name>`
 * flag. When no flag is provided, scaffolds for all discovered languages.
 *
 * @module scaffold
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { Scaffold } from './shared/scaffold.class.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../');

/**
 * Discovers all language directories that contain a `templates/scaffolding/` folder.
 *
 * @returns {string[]} Array of language folder names.
 */
function discoverLanguages() {
  return fs
    .readdirSync(__dirname, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name !== 'shared')
    .filter((dirent) =>
      fs.existsSync(
        path.join(__dirname, dirent.name, 'templates', 'scaffolding')
      )
    )
    .map((dirent) => dirent.name);
}

const languageFlag = process.argv
  .find((arg) => arg.startsWith('--language='))
  ?.split('=')[1];

const languages = languageFlag ? [languageFlag] : discoverLanguages();

if (languages.length === 0) {
  console.info('No languages with scaffolding templates found.');
  process.exit(0);
}

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

  const normalized = name.endsWith('-example') ? name : `${name}-example`;

  // Check for existing examples across all target languages before scaffolding
  const existing = languages.filter((language) => {
    const targetDir = path.join(
      projectRoot,
      'stackblitz',
      language,
      normalized
    );
    return fs.existsSync(targetDir);
  });

  if (existing.length > 0) {
    console.error(
      `\n❌ Example "${normalized}" already exists for: ${existing.join(', ')}`
    );
    console.error(
      '   Remove the existing directories first or choose a different name.\n'
    );
    process.exit(1);
  }

  let hasError = false;

  for (const language of languages) {
    const scaffoldingDir = path.join(
      __dirname,
      language,
      'templates',
      'scaffolding'
    );
    const examplesDir = path.join(projectRoot, 'stackblitz', language);

    if (!fs.existsSync(scaffoldingDir)) {
      console.error(
        `❌ No scaffolding templates found for ${language}: ${scaffoldingDir}`
      );
      hasError = true;
      continue;
    }

    const scaffold = new Scaffold({
      scaffoldingDir,
      examplesDir,
      language
    });

    try {
      scaffold.run(answer);
    } catch (err) {
      console.error(`❌ [${language}] ${err.message}`);
      hasError = true;
    }
  }

  if (hasError) {
    process.exit(1);
  }
});
