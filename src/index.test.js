/* eslint
  one-var:0,
  one-var-declaration-per-line: 0,
  no-underscore-dangle:0,
*/
/* eslint-env node, jest */

import sit from './index';
import expected from './stream-limit-throughput';

describe('index', () => {
  it('exports stream-limit-throughput', () => {
    expect(sit).toBe(expected);
  });
});
