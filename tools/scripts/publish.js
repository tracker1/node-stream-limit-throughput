import shell from 'shelljs';
import path from 'path';
import fs from 'mz/fs';
import Promise from 'bluebird';

const rimraf = Promise.promisify(require("rimraf"));

async function publish() {
  console.log('\n\n\nbuilding...');
  shell.cd(path.resolve(__dirname,'../../'));
  shell.exec('npm run build');
  shell.cd(path.resolve(__dirname,'../../dist'));

  console.log('\npublishing dist/');
  shell.exec('npm publish');
}

async function main(skip) {
  if (skip) return;
  console.log(`TAG: ${process.env.TRAVIS_TAG}`);
  if (process.env.TRAVIS_TAG) await publish();
}

main((module.parent || !process.env.CI))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
