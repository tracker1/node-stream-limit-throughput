/* eslint
  one-var:0,
  one-var-declaration-per-line: 0,
  no-underscore-dangle:0,
*/
/* eslint-env node, jest */

import sit, { DEFAULT_MAX_ITEMS_IN_FLIGHT, MAX_ALLOWED_ITEMS } from './index';

describe('index', () => {
  let context, ee, is, gc, cf, cd;
  let options;

  beforeEach(() => {
    options = { input: {}, max: 10, objectMode: false };
    context = { on: jest.fn() };
    ee = jest.fn(() => context);
    is = jest.fn(() => true);
    gc = jest.fn();
    cf = jest.fn(() => 'fill-result');
    cd = jest.fn(() => 'drain-result');

    sit.__Rewire__('EventEmitter', ee);
    sit.__Rewire__('isStream', is);
    sit.__Rewire__('gc', gc);
    sit.__Rewire__('createFill', cf);
    sit.__Rewire__('createDrain', cd);
  });

  afterEach(() => {
    sit.__ResetDependency__('EventEmitter');
    sit.__ResetDependency__('isStream');
    sit.__ResetDependency__('gc');
    sit.__ResetDependency__('createFill');
    sit.__ResetDependency__('createDrain');
  });

  it('will return defaults', () => {
    const result = sit(options);
    expect(result).toBe(context);
    expect(result.input).toBe(options.input);
    expect(result.objectMode).toBe(options.objectMode);
    expect(result.items).toBe(0);
    expect(result.fill).toBe('fill-result');
    expect(result.drain).toBe('drain-result');
    expect(result.on).toHaveBeenCalledTimes(1);
    expect(result.on).toHaveBeenCalledWith('filling', gc);
  });

  it('will throw if no input specified', () => {
    sit.__ResetDependency__('isStream');
    sit.__Rewire__('isStream', () => false);
    expect(() => sit()).toThrowError('inputStream is required');
  });

  it('will set default max if too low', () => {
    options.max = 0;
    const result = sit(options);
    expect(result.max).toBe(DEFAULT_MAX_ITEMS_IN_FLIGHT);
  });

  it('will set default max if too high', () => {
    options.max = MAX_ALLOWED_ITEMS + 1;
    const result = sit(options);
    expect(result.max).toBe(DEFAULT_MAX_ITEMS_IN_FLIGHT);
  });
});
