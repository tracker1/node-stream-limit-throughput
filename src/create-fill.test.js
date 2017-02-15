/* eslint
  one-var:0,
  one-var-declaration-per-line: 0,
  no-underscore-dangle:0,
*/
/* eslint-env node, jest */

import createFill, { fillTransform, createTf } from './create-fill';

describe('create-fill', () => {
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

      createFill.__Rewire__('through2', through2);
      createFill.__Rewire__('createTf', ctf);
    });

    afterEach(() => {
      createFill.__ResetDependency__('through2');
      createFill.__ResetDependency__('createTf');
    });

    it('will return a through2 stream', () => {
      const result = createFill(context);

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
      createFill.__Rewire__('fillTransform', dtf);
    });

    afterEach(() => {
      createFill.__ResetDependency__('fillTransform');
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

  describe('fillTransform method', () => {
    let ts, chunk, cb;

    beforeEach(() => {
      ts = { push: jest.fn() };
      chunk = {};
      cb = jest.fn();
    });

    it('will increment items', () => {
      context.items = 0;
      fillTransform(ts, context, chunk, cb);
      expect(context.items).toBe(1);
      expect(context.input.pause).not.toHaveBeenCalled();
      expect(ts.push).toHaveBeenCalledTimes(1);
      expect(ts.push).toHaveBeenCalledWith(chunk);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('will pause when full', () => {
      context.items = 1;
      fillTransform(ts, context, chunk, cb);
      expect(context.items).toBe(2);
      expect(context.input.pause).toHaveBeenCalledTimes(1);
    });

    it('will emit filled', () => {
      context.items = 1;
      fillTransform(ts, context, chunk, cb);
      expect(context.items).toBe(2);
      expect(context.emit).toHaveBeenCalledTimes(1);
      expect(context.emit).toHaveBeenCalledWith('filled');
    });

    it('will not pause when already paused', () => {
      context.items = 1;
      context.input.isPaused = jest.fn(() => true);
      fillTransform(ts, context, chunk, cb);
      expect(context.input.pause).not.toHaveBeenCalled();
    });
  });
});
