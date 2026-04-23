import fs from 'node:fs';
import path from 'node:path';

/**
 * Scaffolds new StackBlitz example projects from a template directory.
 *
 * Copies the full scaffolding template tree into a new example folder
 * under `stackblitz/<language>/`, normalizing the provided name to kebab-case
 * and appending `-example` when not already present.
 */
export class Scaffold {
  /** @type {string} Absolute path to the scaffolding template directory. */
  #scaffoldingDir;

  /** @type {string} Absolute path to the examples output directory. */
  #examplesDir;

  /** @type {string} Language identifier (e.g. 'angular', 'react'). */
  #language;

  /**
   * @param {object} config
   * @param {string} config.scaffoldingDir - Absolute path to the scaffolding template directory.
   * @param {string} config.examplesDir - Absolute path to the examples output directory.
   * @param {string} config.language - Language identifier for log messages.
   */
  constructor({ scaffoldingDir, examplesDir, language }) {
    this.#scaffoldingDir = scaffoldingDir;
    this.#examplesDir = examplesDir;
    this.#language = language;
  }

  /* -----------------------------------------------------------
   * NORMALIZE NAME
   * --------------------------------------------------------- */

  /**
   * Normalizes a raw user input string into a kebab-case example name.
   *
   * Trims whitespace, lowercases, replaces spaces with hyphens,
   * and appends `-example` if not already present.
   *
   * @param {string} input - Raw name input from the user.
   * @returns {string} Normalized kebab-case name ending in `-example`.
   * @throws {Error} If the input is empty or whitespace-only.
   */
  normalizeName(input) {
    const name = input.trim().toLowerCase().replace(/\s+/g, '-');

    if (!name) {
      throw new Error('Name cannot be empty.');
    }

    return name.endsWith('-example') ? name : `${name}-example`;
  }

  /* -----------------------------------------------------------
   * COPY DIRECTORY RECURSIVELY
   * --------------------------------------------------------- */

  /**
   * Recursively copies all files and directories from source to destination.
   *
   * @param {string} src - Absolute path to the source directory.
   * @param {string} dest - Absolute path to the destination directory.
   */
  copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /* -----------------------------------------------------------
   * RUN
   * --------------------------------------------------------- */

  /**
   * Scaffolds a new example project.
   *
   * Normalizes the name, validates the target does not already exist,
   * then copies the full scaffolding template into the new directory.
   *
   * @param {string} name - Raw example name provided by the user.
   * @returns {string} The normalized example directory name.
   * @throws {Error} If the target directory already exists.
   */
  run(name) {
    const normalized = this.normalizeName(name);
    const targetDir = path.join(this.#examplesDir, normalized);

    if (fs.existsSync(targetDir)) {
      throw new Error(`Example already exists: ${targetDir}`);
    }

    console.info(
      `\n🔧 Scaffolding new ${this.#language} example: stackblitz/${this.#language}/${normalized}\n`
    );

    this.copyDir(this.#scaffoldingDir, targetDir);

    console.info(`✅ Created: stackblitz/${this.#language}/${normalized}`);
    console.info(`\nNext steps:`);
    console.info(`  cd stackblitz/${this.#language}/${normalized}`);
    console.info(`  npm install`);
    console.info(`  npm start\n`);

    return normalized;
  }
}
