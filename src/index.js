import EventEmitter from 'events';
import isStream from 'is-stream';

import gc from './run-garbage-collection';
import createFill from './create-fill';
import createDrain from './create-drain';

export const DEFAULT_MAX_ITEMS_IN_FLIGHT = 50;
export const MAX_ALLOWED_ITEMS = 4096;

export default function streamLimitThroughput({ input, max, objectMode } = {}) {
  // set input stream property
  if (!isStream(input)) throw new Error('inputStream is required');

  // context as EventEmitter
  const context = new EventEmitter();
  context.input = input;
  context.objectMode = objectMode;
  context.items = 0;
  context.max = ~~max; // eslint-disable-line no-bitwise

  if (context.max < 2 || context.max > MAX_ALLOWED_ITEMS) {
    context.max = DEFAULT_MAX_ITEMS_IN_FLIGHT;
  }

  context.fill = createFill(context);
  context.drain = createDrain(context);

  context.on('filling', gc);

  return context;
}
