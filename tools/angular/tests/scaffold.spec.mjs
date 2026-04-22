import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Scaffold } from '../scaffold.class.mjs';

describe('Scaffold', () => {
  let tmpDir;
  let scaffoldingDir;
  let angularExamplesDir;
  let scaffold;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-test-'));
    scaffoldingDir = path.join(tmpDir, 'scaffolding');
    angularExamplesDir = path.join(tmpDir, 'angular');

    fs.mkdirSync(scaffoldingDir, { recursive: true });
    fs.mkdirSync(angularExamplesDir, { recursive: true });

    // Create a minimal scaffolding template
    fs.writeFileSync(path.join(scaffoldingDir, 'angular.json'), '{}');
    fs.writeFileSync(path.join(scaffoldingDir, 'package.json'), '{}');
    fs.mkdirSync(path.join(scaffoldingDir, 'src', 'app'), { recursive: true });
    fs.writeFileSync(path.join(scaffoldingDir, 'src', 'main.ts'), '');
    fs.writeFileSync(
      path.join(scaffoldingDir, 'src', 'app', 'app.config.ts'),
      ''
    );

    scaffold = new Scaffold({ scaffoldingDir, angularExamplesDir });

    spyOn(console, 'info');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('normalizeName', () => {
    it('should append -example if not present', () => {
      expect(scaffold.normalizeName('basic-filter')).toBe(
        'basic-filter-example'
      );
    });

    it('should not double-append -example', () => {
      expect(scaffold.normalizeName('basic-filter-example')).toBe(
        'basic-filter-example'
      );
    });

    it('should lowercase and kebab-case', () => {
      expect(scaffold.normalizeName('My New Demo')).toBe('my-new-demo-example');
    });

    it('should trim whitespace', () => {
      expect(scaffold.normalizeName('  spaced  ')).toBe('spaced-example');
    });

    it('should throw on empty input', () => {
      expect(() => scaffold.normalizeName('')).toThrowError(
        'Name cannot be empty.'
      );
    });

    it('should throw on whitespace-only input', () => {
      expect(() => scaffold.normalizeName('   ')).toThrowError(
        'Name cannot be empty.'
      );
    });
  });

  describe('run', () => {
    it('should create the example directory with all template files', () => {
      const name = scaffold.run('my-test');
      expect(name).toBe('my-test-example');

      const targetDir = path.join(angularExamplesDir, 'my-test-example');
      expect(fs.existsSync(targetDir)).toBe(true);
      expect(fs.existsSync(path.join(targetDir, 'angular.json'))).toBe(true);
      expect(fs.existsSync(path.join(targetDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(targetDir, 'src', 'main.ts'))).toBe(true);
      expect(
        fs.existsSync(path.join(targetDir, 'src', 'app', 'app.config.ts'))
      ).toBe(true);
    });

    it('should throw if example already exists', () => {
      scaffold.run('duplicate');
      expect(() => scaffold.run('duplicate')).toThrowError(
        /Example already exists/
      );
    });
  });
});
