/* eslint
  one-var:0,
  one-var-declaration-per-line: 0,
  no-underscore-dangle:0,
*/
/* eslint-env node, jest */

import createDrain, { drainTransform, createTf, __RewireAPI__ } from './create-drain';

const { __Rewire__: wire, __ResetDependency__: unwire } = __RewireAPI__;

describe('create-drain', () => {
  let context;

  beforeEach(() => {
    context = {
      max: 2,
      objectMode: false,
      items: 1,
      input: {
        isPaused: jest.fn(() => false),
        pause: jest.fn(),
        resume: jest.fn(),
      },
      emit: jest.fn(),
      on: jest.fn(),
    };
  });

  describe('default export method', () => {
    let through2, ts, ctfres, ctf;

    beforeEach(() => {
      ts = { push: jest.fn() };
      through2 = jest.fn(() => ts);
      ctfres = jest.fn();
      ctf = jest.fn(() => ctfres);

      wire('through2', through2);
      wire('createTf', ctf);
    });

    afterEach(() => {
      unwire('through2');
      unwire('createTf');
    });

    it('will return a through2 stream', () => {
      const result = createDrain(context);

      expect(result).toBe(ts);

      expect(through2).toHaveBeenCalledTimes(1);
      expect(through2).toHaveBeenCalledWith(
        { objectMode: context.objectMode },
        ctfres,
      );

      expect(ctf).toHaveBeenCalledTimes(1);
      expect(ctf).toHaveBeenCalledWith(context);
    });
  });

  describe('createTf method', () => {
    let dtf;

    beforeEach(() => {
      dtf = jest.fn();
      wire('drainTransform', dtf);
    });

    afterEach(() => {
      unwire('drainTransform');
    });

    it('will return a function', () => {
      const result = createTf(context);
      expect(typeof result).toBe('function');
      expect(dtf).not.toHaveBeenCalled();
    });

    it('will passthrough', () => {
      const result = createTf(context);
      const ts = {};
      result.call(ts, 'chunk', 'enc', 'cb');
      expect(dtf).toHaveBeenCalledTimes(1);
      expect(dtf).toHaveBeenCalledWith(ts, context, 'chunk', 'cb');
    });
  });

  describe('drainTransform method', () => {
    let ts, chunk, cb;

    beforeEach(() => {
      ts = { push: jest.fn() };
      chunk = {};
      cb = jest.fn();
    });

    it('will decrement items count', () => {
      context.items = 10;
      drainTransform(ts, context, chunk, cb);
      expect(context.items).toBe(9);
    });

    it('will emit drained when reaching 0', () => {
      context.items = 1;
      drainTransform(ts, context, chunk, cb);
      expect(context.items).toBe(0);
      expect(context.emit).toHaveBeenCalledTimes(1);
      expect(context.emit).toHaveBeenCalledWith('drained');
    });

    it('will resume at half-drained', () => {
      context.items = 2;
      context.input.isPaused = jest.fn(() => true);
      drainTransform(ts, context, chunk, cb);
      expect(context.input.isPaused).toHaveBeenCalledTimes(1);
      expect(context.input.resume).toHaveBeenCalledTimes(1);
      expect(context.emit).toHaveBeenCalledTimes(1);
      expect(context.emit).toHaveBeenCalledWith('filling');
    });

    it('will passthrough chunk', () => {
      drainTransform(ts, context, chunk, cb);
      expect(ts.push).toHaveBeenCalledTimes(1);
      expect(ts.push).toHaveBeenCalledWith(chunk);
      expect(cb).toHaveBeenCalledTimes(1);
    });
  });
});
