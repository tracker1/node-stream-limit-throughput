/* eslint
  one-var:0,
  one-var-declaration-per-line: 0,
  no-underscore-dangle:0,
*/
/* eslint-env node, jest */

import fs from 'mz/fs';
import path from 'path';
import shell from 'shelljs';
import through2 from 'through2';
import linestream from 'line-stream';
import bluebird from 'bluebird';
import streamLimit from '../../dist'; // eslint-disable-line

const rimraf = bluebird.promisify(require('rimraf'));

function handleItem(chunk, enc, cb) {
  const ts = this;
  setTimeout(() => {
    ts.push(chunk);
    cb();
  }, 1);
}

describe('tools/test/integration', () => {
  const tmp = path.resolve(__dirname, '../../tmp');

  const inPath = path.join(tmp, 'test-input.txt');
  const outPath = path.join(tmp, 'test-output.txt');
  const randomData = Array.from(new Array(500)).map(() => `${Math.random()}\n`).join('');

  beforeAll(async () => {
    shell.mkdir(tmp);
    await fs.writeFile(inPath, randomData);
  });

  afterAll(async () => {
    await rimraf(tmp);
  });

  it('will create expected output', async () => {
    const input = fs.createReadStream(inPath);
    const output = fs.createWriteStream(outPath);
    const limiter = streamLimit({ input, max: 200, objectMode: false });

    const onDrained = jest.fn();
    const onFilling = jest.fn();
    const onFilled = jest.fn();

    limiter.on('drained', onDrained);
    limiter.on('filling', onFilling);
    limiter.on('filled', onFilled);

    await new Promise((resolve, reject) => {
      input
        .pipe(linestream({ delimiter: '\n' }))
        .pipe(limiter.fill)
        .pipe(through2(handleItem))
        .pipe(limiter.drain)
        .pipe(output)
        .on('error', reject)
        .on('close', resolve);
    });

    const results = await fs.readFile(outPath, 'utf8');
    expect(results).toBe(randomData);
    expect(onDrained).toHaveBeenCalled();
    expect(onFilling).toHaveBeenCalled();
    expect(onFilled).toHaveBeenCalled();
  });
});
