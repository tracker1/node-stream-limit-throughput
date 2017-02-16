# node-stream-limit-thoughput

Advanced throughput throttling for node streams.

The purpose of this module is to prevent the usage of too much memory
while processing an input stream.  When you process large data files
in node, it's possible for the processing to take longer than it takes
to read in each respective item.  In this case, you can allow for
up to `N` number of items to be in the pipeline at once.

When the pipeline is full, the input stream is paused, and once the
pipeline is fully drained, the input stream will be unpaused.

**NOTE: Node 4+ Required**

## Installation

    npm i --save stream-limit-throughput

## Usage

Creating a StreamLimiter

    import streamLimit from 'stream-limit-throughput';
    ...
    var limiter = streamLimit({
      input: rootInputStream, // root stream to pause/unpause
      max: maxItemsInFlight,  // max items in processing, default: 50, min: 2, max: 4096
      objectMode: false       // fill/drain streams should be in objectMode
    });

    input.pipe(limiter.fill).pipe(expensiveProcess).pipe(limiter.drain);

## Example

    import streamLimit from 'stream-limit-throughput';
    import linestream from 'line-stream';
    import takesTime from 'handle-input-record';

    export default function processStream(input, output) {
      const limitStream = streamLimit({
        input,
        max: 100,
        objectMode: true,
      });

      return input.pipe(lineStream())   // start with the input, read a line at a time
        .pipe(limitStream.fill)         // pipe through the limiter's fill stream
        .pipe(stakesTime())             // do your tasks that have high overhead and take time
        .pipe(limitStream.drain)        // pipe through limiter's drain stream
        .pipe(output);                  // pipe to the output stream
    }
