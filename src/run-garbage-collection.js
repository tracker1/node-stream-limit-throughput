// if there's a garbage collector, run it
// this will reduce memory usage while running
export default () => {
  if (typeof global.gc === 'function') {
    global.gc();
    return true;
  }
  return false;
};
