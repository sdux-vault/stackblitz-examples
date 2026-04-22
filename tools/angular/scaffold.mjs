#!/usr/bin/env node

import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { Scaffold } from './scaffold.class.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../../');

const scaffold = new Scaffold({
  scaffoldingDir: path.join(__dirname, 'templates', 'scaffolding'),
  angularExamplesDir: path.join(projectRoot, 'stackblitz', 'angular')
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nEnter the example name (kebab-case): ', (answer) => {
  rl.close();

  try {
    scaffold.run(answer);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
});
