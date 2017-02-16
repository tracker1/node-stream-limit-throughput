import path from 'path';
import fs from 'mz/fs';
import shell from 'shelljs';
import bluebird from 'bluebird';

const rimraf = bluebird.promisify(require('rimraf'));

async function main(skip) {
  if (skip) return;

  // paths to create
  const root = path.resolve(__dirname, '../../');
  const src = path.resolve(__dirname, '../../src');
  const dist = path.resolve(__dirname, '../../dist/');
  const pkgin = path.resolve(__dirname, '../../package.json');
  const pkgout = path.resolve(dist, 'package.json');

  // remove existing dist
  if (fs.existsSync(dist)) await rimraf(dist);

  //make dist
  shell.mkdir(dist);

  // babel on source files, to dist output
  shell.cd(src);
  const babelLine = `babel -d "${dist}" "./*.js"`;
  console.log(`\n\n${babelLine}\n\n`);
  shell.exec(babelLine);
  shell.cd(dist);
  shell.rm('*.test.js');
  shell.cd();

  // create package.json for dist
  const pkg = JSON.parse(await fs.readFile(pkgin));
  pkg.devDependencies = undefined;
  pkg.babel = undefined;
  pkg.eslintConfig = undefined;
  pkg.jest = undefined;
  pkg.scripts = undefined;
  pkg.main = 'index.js';
  await fs.writeFile(pkgout, JSON.stringify(pkg, null, 2));
}

main(module.parent);
