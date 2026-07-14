import fs from 'node:fs';
import path from 'node:path';

/**
 * Cleans build and dependency artifacts from StackBlitz example projects.
 *
 * Iterates every `stackblitz/<language>/<example>` directory and removes:
 *
 * 1. `node_modules` folders
 * 2. `package-lock.json` files
 * 3. `.angular` cache folders (when present)
 *
 * Removal is performed with `fs.rmSync`, which allows tests to spy on the
 * removal call and validate behavior without deleting real files.
 */
export class CleanUp {
  /** @type {string} Absolute path to the `stackblitz` directory. */
  #stackblitzDir;

  /**
   * Artifact entries removed from each example directory.
   *
   * @type {ReadonlyArray<{ name: string, type: string }>}
   */
  static #CLEANUP_ENTRIES = [
    { name: 'node_modules', type: 'node_modules' },
    { name: 'package-lock.json', type: 'package-lock' },
    { name: '.angular', type: 'angular-cache' }
  ];

  /**
   * @param {object} config
   * @param {string} config.stackblitzDir - Absolute path to the `stackblitz` directory.
   */
  constructor({ stackblitzDir }) {
    this.#stackblitzDir = stackblitzDir;
  }

  /* -----------------------------------------------------------
   * COLLECT TARGETS
   * --------------------------------------------------------- */

  /**
   * Collects all cleanup targets that currently exist across every
   * `stackblitz/<language>/<example>` directory.
   *
   * @returns {Array<{ path: string, type: string, language: string, example: string }>}
   */
  collectTargets() {
    const targets = [];

    if (!fs.existsSync(this.#stackblitzDir)) {
      return targets;
    }

    const languages = fs
      .readdirSync(this.#stackblitzDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory());

    for (const language of languages) {
      const languageDir = path.join(this.#stackblitzDir, language.name);

      const examples = fs
        .readdirSync(languageDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory());

      for (const example of examples) {
        const exampleDir = path.join(languageDir, example.name);

        for (const entry of CleanUp.#CLEANUP_ENTRIES) {
          const targetPath = path.join(exampleDir, entry.name);

          if (fs.existsSync(targetPath)) {
            targets.push({
              path: targetPath,
              type: entry.type,
              language: language.name,
              example: example.name
            });
          }
        }
      }
    }

    return targets;
  }

  /* -----------------------------------------------------------
   * RUN
   * --------------------------------------------------------- */

  /**
   * Removes every collected cleanup target.
   *
   * @returns {{ removedCount: number, targets: Array<{ path: string, type: string, language: string, example: string }> }}
   */
  run() {
    const targets = this.collectTargets();

    for (const target of targets) {
      fs.rmSync(target.path, { recursive: true, force: true });
      console.info(`Removed ${target.type}: ${target.path}`);
    }

    console.info(`Clean-up complete. Removed ${targets.length} artifact(s).`);

    return { removedCount: targets.length, targets };
  }
}
