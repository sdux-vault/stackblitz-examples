import fs from 'node:fs';
import path from 'node:path';

export class Scaffold {
  #scaffoldingDir;
  #angularExamplesDir;

  constructor({ scaffoldingDir, angularExamplesDir }) {
    this.#scaffoldingDir = scaffoldingDir;
    this.#angularExamplesDir = angularExamplesDir;
  }

  /* -----------------------------------------------------------
   * NORMALIZE NAME
   * --------------------------------------------------------- */

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

  run(name) {
    const normalized = this.normalizeName(name);
    const targetDir = path.join(this.#angularExamplesDir, normalized);

    if (fs.existsSync(targetDir)) {
      throw new Error(`Example already exists: ${targetDir}`);
    }

    console.info(
      `\n🔧 Scaffolding new example: stackblitz/angular/${normalized}\n`
    );

    this.copyDir(this.#scaffoldingDir, targetDir);

    console.info(`✅ Created: stackblitz/angular/${normalized}`);
    console.info(`\nNext steps:`);
    console.info(`  cd stackblitz/angular/${normalized}`);
    console.info(`  npm install`);
    console.info(`  npm start\n`);

    return normalized;
  }
}
