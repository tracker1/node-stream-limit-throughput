/* eslint
  one-var:0,
  one-var-declaration-per-line: 0,
  no-underscore-dangle:0,
*/
/* eslint-env node, jest */

import fs from 'mz/fs';
import path from 'path';
import through2 from 'through2';
import split2 from 'split2';
import streamLimit from '../../dist'; // eslint-disable-line

function handleItem(chunk, enc, cb) {
  const ts = this;
  setTimeout(() => {
    ts.push(`${chunk}\n`);
    cb();
  }, 1);
}

describe('tools/test/integration', () => {
  const tmp = path.resolve(__dirname, '../../temp');
  const inPath = path.join(tmp, 'test-input-dist.txt');
  const outPath = path.join(tmp, 'test-output-dist.txt');
  const randomData = Array.from(new Array(500)).map(() => `${Math.random()}\n`).join('');

  beforeAll(async () => {
    if (!fs.existsSync(tmp)) await fs.mkdir(tmp);
    await fs.writeFile(inPath, randomData);
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
        .pipe(split2())
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
