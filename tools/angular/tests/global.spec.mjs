import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { GlobalCopy } from '../global.class.mjs';

describe('GlobalCopy', () => {
  let tmpDir;
  let templatesDir;
  let angularExamplesDir;
  let globalCopy;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'global-test-'));
    templatesDir = path.join(tmpDir, 'global');
    angularExamplesDir = path.join(tmpDir, 'angular');

    // Create template files
    fs.mkdirSync(templatesDir, { recursive: true });
    fs.writeFileSync(
      path.join(templatesDir, 'package.json'),
      '{"global":true}'
    );
    fs.writeFileSync(path.join(templatesDir, 'angular.json'), '{}');
    fs.mkdirSync(path.join(templatesDir, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(templatesDir, 'src', 'styles.scss'),
      '/* global */'
    );

    // Create example directories
    fs.mkdirSync(path.join(angularExamplesDir, 'example-a', 'src'), {
      recursive: true
    });
    fs.mkdirSync(path.join(angularExamplesDir, 'example-b', 'src'), {
      recursive: true
    });

    globalCopy = new GlobalCopy({ templatesDir, angularExamplesDir });

    spyOn(console, 'info');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('getTemplateFiles', () => {
    it('should return all files recursively', () => {
      const files = globalCopy.getTemplateFiles(templatesDir);
      expect(files.sort()).toEqual(
        ['angular.json', 'package.json', path.join('src', 'styles.scss')].sort()
      );
    });
  });

  describe('run', () => {
    it('should copy all template files to all examples', () => {
      const result = globalCopy.run();
      expect(result).toEqual(['example-a', 'example-b']);

      for (const example of ['example-a', 'example-b']) {
        const exampleDir = path.join(angularExamplesDir, example);
        expect(fs.existsSync(path.join(exampleDir, 'package.json'))).toBe(true);
        expect(
          fs.readFileSync(path.join(exampleDir, 'package.json'), 'utf-8')
        ).toBe('{"global":true}');
        expect(fs.existsSync(path.join(exampleDir, 'angular.json'))).toBe(true);
        expect(fs.existsSync(path.join(exampleDir, 'src', 'styles.scss'))).toBe(
          true
        );
      }
    });

    it('should return empty array when no examples exist', () => {
      fs.rmSync(angularExamplesDir, { recursive: true, force: true });
      fs.mkdirSync(angularExamplesDir, { recursive: true });

      const result = globalCopy.run();
      expect(result).toEqual([]);
    });

    it('should create missing subdirectories in examples', () => {
      // example-c has no src/ subdirectory
      fs.mkdirSync(path.join(angularExamplesDir, 'example-c'), {
        recursive: true
      });

      const noCopy = new GlobalCopy({ templatesDir, angularExamplesDir });
      noCopy.run();

      expect(
        fs.existsSync(
          path.join(angularExamplesDir, 'example-c', 'src', 'styles.scss')
        )
      ).toBe(true);
    });

    it('should throw if angular examples directory does not exist', () => {
      const badCopy = new GlobalCopy({
        templatesDir,
        angularExamplesDir: path.join(tmpDir, 'nonexistent')
      });

      expect(() => badCopy.run()).toThrowError(
        /Angular examples directory not found/
      );
    });
  });
});
