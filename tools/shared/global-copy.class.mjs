import fs from 'node:fs';
import path from 'node:path';

/**
 * Copies global template files into every example directory for a given language.
 *
 * Scans the templates/global directory recursively and copies each file
 * into all example directories found under `stackblitz/<language>/`.
 */
export class GlobalCopy {
  /** @type {string} Absolute path to the global templates directory. */
  #templatesDir;

  /** @type {string} Absolute path to the examples directory. */
  #examplesDir;

  /** @type {string} Language identifier (e.g. 'angular', 'react'). */
  #language;

  /**
   * @param {object} config
   * @param {string} config.templatesDir - Absolute path to the global templates directory.
   * @param {string} config.examplesDir - Absolute path to the examples directory.
   * @param {string} config.language - Language identifier for log messages.
   */
  constructor({ templatesDir, examplesDir, language }) {
    this.#templatesDir = templatesDir;
    this.#examplesDir = examplesDir;
    this.#language = language;
  }

  /* -----------------------------------------------------------
   * GET TEMPLATE FILES RECURSIVELY
   * --------------------------------------------------------- */

  /**
   * Recursively collects all file paths relative to a root directory.
   *
   * @param {string} dir - Absolute path to scan.
   * @param {string} [base=''] - Relative path prefix for recursion.
   * @returns {string[]} Array of relative file paths.
   */
  getTemplateFiles(dir, base = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const relative = path.join(base, entry.name);
      if (entry.isDirectory()) {
        files.push(
          ...this.getTemplateFiles(path.join(dir, entry.name), relative)
        );
      } else {
        files.push(relative);
      }
    }

    return files;
  }

  /* -----------------------------------------------------------
   * RUN
   * --------------------------------------------------------- */

  /**
   * Copies all global template files into every example directory.
   *
   * @returns {string[]} Array of example directory names that received copies.
   * @throws {Error} If the examples directory does not exist.
   */
  run() {
    if (!fs.existsSync(this.#examplesDir)) {
      throw new Error(`Examples directory not found: ${this.#examplesDir}`);
    }

    const filesToCopy = this.getTemplateFiles(this.#templatesDir);

    const examples = fs
      .readdirSync(this.#examplesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    if (examples.length === 0) {
      console.info(`No ${this.#language} examples found.`);
      return [];
    }

    console.info(
      `\n🔄 Copying global templates to ${examples.length} ${this.#language} example(s)...\n`
    );

    for (const example of examples) {
      const exampleDir = path.join(this.#examplesDir, example);

      for (const file of filesToCopy) {
        const src = path.join(this.#templatesDir, file);
        const dest = path.join(exampleDir, file);

        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(src, dest);
        console.info(`  ✅ ${example}/${file}`);
      }
    }

    console.info(
      `\n✅ ${this.#language} global templates applied successfully.\n`
    );

    return examples;
  }
}
