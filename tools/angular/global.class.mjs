import fs from 'node:fs';
import path from 'node:path';

/**
 * Copies global template files into every Angular example directory.
 *
 * Scans the templates/global directory recursively and copies each file
 * into all example directories found under `stackblitz/angular/`.
 */
export class GlobalCopy {
  /** @type {string} Absolute path to the global templates directory. */
  #templatesDir;

  /** @type {string} Absolute path to the angular examples directory. */
  #angularExamplesDir;

  /**
   * @param {object} config
   * @param {string} config.templatesDir - Absolute path to the global templates directory.
   * @param {string} config.angularExamplesDir - Absolute path to the angular examples directory.
   */
  constructor({ templatesDir, angularExamplesDir }) {
    this.#templatesDir = templatesDir;
    this.#angularExamplesDir = angularExamplesDir;
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
   * Copies all global template files into every Angular example directory.
   *
   * @returns {string[]} Array of example directory names that received copies.
   * @throws {Error} If the angular examples directory does not exist.
   */
  run() {
    if (!fs.existsSync(this.#angularExamplesDir)) {
      throw new Error(
        `Angular examples directory not found: ${this.#angularExamplesDir}`
      );
    }

    const filesToCopy = this.getTemplateFiles(this.#templatesDir);

    const examples = fs
      .readdirSync(this.#angularExamplesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    if (examples.length === 0) {
      console.info('No angular examples found.');
      return [];
    }

    console.info(
      `\n🔄 Copying global templates to ${examples.length} angular example(s)...\n`
    );

    for (const example of examples) {
      const exampleDir = path.join(this.#angularExamplesDir, example);

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

    console.info('\n✅ Global templates applied successfully.\n');

    return examples;
  }
}
