/* eslint
  one-var:0,
  one-var-declaration-per-line: 0,
  no-underscore-dangle:0,
*/
/* eslint-env node, jest */

import sit from './run-garbage-collection';

describe('run-garbage-collection', () => {
  let gcRef;

  beforeEach(() => {
    gcRef = global.gc;
  });

  afterEach(() => {
    global.gc = gcRef;
  });

  it('runs when global.gc present', () => {
    global.gc = jest.fn();
    const result = sit();
    expect(global.gc).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('runs when global.gc present', () => {
    global.gc = null;
    const result = sit();
    expect(result).toBe(false);
  });
});
