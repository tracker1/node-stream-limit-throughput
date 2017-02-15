import path from 'path';
import glob from 'glob';

const base = path.resolve(__dirname, '../../');
const src = path.resolve(base, './src');

const allScripts = glob.sync(`${src}/**/*.js`);

const tests = allScripts.filter(s => (/\.test\.js$/).test(s));
const scripts = allScripts.filter(s => !(/\.((no)?test|disabled|unsafe)\./).test(s));

const untested = scripts.filter(s => !tests.includes(s.replace(/\.js$/, '.test.js')));

if (untested.length) {
  // eslint-disable-next-line no-console
  console.error('\n\nThe following scripts do not have a test file.');
  untested
    .map(s => path.resolve(s).replace(base, '').substr(1))
    .forEach(s => console.error(`     ${s}`));
  process.nextTick(() => process.exit(1));
}
