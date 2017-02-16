import through2 from 'through2';

export const fillTransform = (ts, context, chunk, cb) => {
  ts.push(chunk);
  const items = context.items += 1; // eslint-disable-line
  if (items >= context.max && !context.input.isPaused()) {
    context.input.pause();
    context.emit('filled');
  }
  cb();
};

export const createTf = context => function tf(chunk, enc, cb) {
  return fillTransform(this, context, chunk, cb);
};

export default context => through2(
  { objectMode: context.objectMode },
  createTf(context),
);
