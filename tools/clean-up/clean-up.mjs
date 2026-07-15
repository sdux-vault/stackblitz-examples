/**
 * Clean-up tool for SDuX Vault StackBlitz examples.
 *
 * Removes `node_modules` folders, `package-lock.json` files, and `.angular`
 * cache folders from every `stackblitz/<language>/<example>` directory.
 *
 * @example
 * ```sh
 * node tools/clean-up/clean-up.mjs
 * ```
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CleanUp } from './clean-up.class.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../../');
const stackblitzDir = path.join(projectRoot, 'stackblitz');

const cleanUp = new CleanUp({ stackblitzDir });
const result = cleanUp.run();

if (result.removedCount === 0) {
  console.info('\nClean-up finished. No artifacts found.');
} else {
  console.info(
    `\nClean-up finished. Removed ${result.removedCount} artifact(s).`
  );
}
