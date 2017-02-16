import through2 from 'through2';

export const drainTransform = (ts, context, chunk, cb) => {
  ts.push(chunk);
  const items = context.items -= 1; // eslint-disable-line
  if (items === 0 || items <= Math.floor(context.max / 2)) {
    if (items === 0) context.emit('drained');
    if (context.input.isPaused()) {
      context.input.resume();
      context.emit('filling');
    }
  }
  cb();
};

export const createTf = context => function tf(chunk, enc, cb) {
  return drainTransform(this, context, chunk, cb);
};

export default context => through2(
  { objectMode: context.objectMode },
  createTf(context),
);
