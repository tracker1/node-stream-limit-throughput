import path from 'path';
import fs from 'mz/fs';
import shell from 'shelljs';
import bluebird from 'bluebird';

const rimraf = bluebird.promisify(require('rimraf'));

async function main(skip) {
  if (skip) return;

  const root = path.resolve(__dirname, '../../');
  const src = path.resolve(__dirname, '../../src');
  const dist = path.resolve(__dirname, '../../dist/');

  if (fs.existsSync(dist)) await rimraf(dist);

  shell.mkdir(dist);
  shell.cd(src);

  const babelLine = `babel -d "${dist}" "./*.js"`;
  console.log(`\n\n${babelLine}\n\n`);
  shell.exec(babelLine);
  shell.cd(dist);
  shell.rm('*.test.js');
  shell.cd();
}

main(module.parent);
