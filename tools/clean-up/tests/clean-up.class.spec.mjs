import fs from 'node:fs';
import path from 'node:path';
import { CleanUp } from '../clean-up.class.mjs';

/**
 * Absolute virtual root used for all tests. No real path is ever touched —
 * every `fs` interaction is served by spies over an in-memory tree.
 */
const STACKBLITZ_DIR = path.join('/virtual', 'stackblitz');

describe('CleanUp', () => {
  /** @type {CleanUp} */
  let cleanUp;

  /**
   * Set of absolute paths that the virtual filesystem reports as existing.
   *
   * @type {Set<string>}
   */
  let existingPaths;

  /**
   * Map of absolute directory path → child entry names, used by the
   * `readdirSync` spy to return `Dirent`-like objects.
   *
   * @type {Map<string, string[]>}
   */
  let directoryChildren;

  /**
   * Registers a directory and its child entries in the virtual tree.
   *
   * @param {string} dirPath - Absolute directory path.
   * @param {string[]} children - Child entry names within the directory.
   */
  function addDirectory(dirPath, children) {
    existingPaths.add(dirPath);
    directoryChildren.set(dirPath, children);
    for (const child of children) {
      existingPaths.add(path.join(dirPath, child));
    }
  }

  /**
   * Builds a `Dirent`-like object for the `readdirSync` spy. Names ending in
   * `.json` are treated as files; everything else is treated as a directory.
   *
   * @param {string} name - Entry name.
   * @returns {{ name: string, isDirectory: () => boolean }}
   */
  function toDirent(name) {
    return { name, isDirectory: () => !name.endsWith('.json') };
  }

  beforeEach(() => {
    existingPaths = new Set();
    directoryChildren = new Map();

    spyOn(fs, 'existsSync').and.callFake((target) =>
      existingPaths.has(String(target))
    );

    spyOn(fs, 'readdirSync').and.callFake((dir) => {
      const children = directoryChildren.get(String(dir)) ?? [];
      return children.map(toDirent);
    });

    spyOn(fs, 'rmSync');
    spyOn(console, 'info');

    cleanUp = new CleanUp({ stackblitzDir: STACKBLITZ_DIR });
  });

  describe('collectTargets', () => {
    it('should return an empty array when the stackblitz directory does not exist', () => {
      // existingPaths is empty, so existsSync reports the root as missing.
      expect(cleanUp.collectTargets()).toEqual([]);
      expect(fs.readdirSync).not.toHaveBeenCalled();
    });

    it('should collect node_modules, package-lock.json, and .angular targets', () => {
      addDirectory(STACKBLITZ_DIR, ['angular']);
      addDirectory(path.join(STACKBLITZ_DIR, 'angular'), ['demo-1-example']);
      addDirectory(path.join(STACKBLITZ_DIR, 'angular', 'demo-1-example'), [
        'dist',
        'node_modules',
        'package-lock.json',
        '.angular'
      ]);

      const targets = cleanUp.collectTargets();
      const types = targets.map((t) => t.type).sort();

      expect(types).toEqual([
        'angular-cache',
        'dist',
        'node_modules',
        'package-lock'
      ]);
    });

    it('should only collect artifacts that exist', () => {
      addDirectory(STACKBLITZ_DIR, ['react']);
      addDirectory(path.join(STACKBLITZ_DIR, 'react'), ['demo-2-example']);
      addDirectory(path.join(STACKBLITZ_DIR, 'react', 'demo-2-example'), [
        'node_modules'
      ]);

      const targets = cleanUp.collectTargets();

      expect(targets.length).toBe(1);
      expect(targets[0].type).toBe('node_modules');
      expect(targets[0].language).toBe('react');
      expect(targets[0].example).toBe('demo-2-example');
    });

    it('should iterate across multiple languages and examples', () => {
      addDirectory(STACKBLITZ_DIR, ['angular', 'vue', 'svelte']);

      addDirectory(path.join(STACKBLITZ_DIR, 'angular'), ['demo-1-example']);
      addDirectory(path.join(STACKBLITZ_DIR, 'angular', 'demo-1-example'), [
        'node_modules'
      ]);

      addDirectory(path.join(STACKBLITZ_DIR, 'vue'), ['demo-2-example']);
      addDirectory(path.join(STACKBLITZ_DIR, 'vue', 'demo-2-example'), [
        'package-lock.json'
      ]);

      addDirectory(path.join(STACKBLITZ_DIR, 'svelte'), ['demo-3-example']);
      addDirectory(path.join(STACKBLITZ_DIR, 'svelte', 'demo-3-example'), [
        '.angular'
      ]);

      const targets = cleanUp.collectTargets();

      expect(targets.length).toBe(3);
      expect(targets.map((t) => t.language).sort()).toEqual([
        'angular',
        'svelte',
        'vue'
      ]);
    });

    it('should ignore language directories that contain no examples', () => {
      addDirectory(STACKBLITZ_DIR, ['nodejs']);
      addDirectory(path.join(STACKBLITZ_DIR, 'nodejs'), []);

      expect(cleanUp.collectTargets()).toEqual([]);
    });
  });

  describe('run', () => {
    it('should call fs.rmSync for every target without touching the real OS', () => {
      addDirectory(STACKBLITZ_DIR, ['angular']);
      addDirectory(path.join(STACKBLITZ_DIR, 'angular'), ['demo-1-example']);
      addDirectory(path.join(STACKBLITZ_DIR, 'angular', 'demo-1-example'), [
        'node_modules',
        'package-lock.json',
        '.angular'
      ]);

      const nodeModulesPath = path.join(
        STACKBLITZ_DIR,
        'angular',
        'demo-1-example',
        'node_modules'
      );

      const result = cleanUp.run();

      expect(fs.rmSync).toHaveBeenCalledTimes(3);
      expect(fs.rmSync).toHaveBeenCalledWith(nodeModulesPath, {
        recursive: true,
        force: true
      });
      expect(result.removedCount).toBe(3);
    });

    it('should not call fs.rmSync when there are no targets', () => {
      addDirectory(STACKBLITZ_DIR, ['react']);
      addDirectory(path.join(STACKBLITZ_DIR, 'react'), ['demo-1-example']);
      addDirectory(path.join(STACKBLITZ_DIR, 'react', 'demo-1-example'), []);

      const result = cleanUp.run();

      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(result.removedCount).toBe(0);
    });

    it('should pass recursive and force options to every removal', () => {
      addDirectory(STACKBLITZ_DIR, ['vue']);
      addDirectory(path.join(STACKBLITZ_DIR, 'vue'), ['demo-1-example']);
      addDirectory(path.join(STACKBLITZ_DIR, 'vue', 'demo-1-example'), [
        'node_modules',
        'package-lock.json'
      ]);

      cleanUp.run();

      for (const call of fs.rmSync.calls.allArgs()) {
        expect(call[1]).toEqual({ recursive: true, force: true });
      }
    });

    it('should log a completion summary', () => {
      addDirectory(STACKBLITZ_DIR, ['angular']);
      addDirectory(path.join(STACKBLITZ_DIR, 'angular'), ['demo-1-example']);
      addDirectory(path.join(STACKBLITZ_DIR, 'angular', 'demo-1-example'), [
        'node_modules'
      ]);

      cleanUp.run();

      expect(console.info).toHaveBeenCalledWith(
        jasmine.stringContaining('Clean-up complete')
      );
    });
  });
});
