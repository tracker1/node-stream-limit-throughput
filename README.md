# node-stream-limit-thoughput

***NOTE: Node 6+ Required***

Advanced throughput throttling for node streams.

The purpose of this module is to prevent the usage of too much memory
while processing an input stream.  When you process large data files
in node, it's possible for the processing to take longer than it takes
to read in each respective item.  In this case, you can allow for
up to `N` number of items to be in the pipeline at once.

When the pipeline is full, the input stream is paused, and once the
pipeline is at least half drained, the input stream will be unpaused.

## Installation

    npm i --save stream-limit-throughput

## Usage

Creating a StreamLimiter

    import streamLimit from 'stream-limit-throughput';
    ...
    var limiter = streamLimit(options);
    input.pipe(limiter.fill).pipe(expensiveProcess).pipe(limiter.drain);

### options

* `options.input` - root stream to pause/unpause
* `options.max` - max items in processing, default: 50, min: 1, max: 4096
* `options.objectMode` - fill/drain streams should be in objectMode

## Example

    import fs from 'fs';
    import streamLimit from 'stream-limit-throughput';
    import split2 from 'split2';
    import takesTime from 'handle-input-record';

    export default function processStream(inpath, outpath) {
      const input = fs.createReadStream(inpath);
      const output = fs.createWriteStream(outpath);
      const limitStream = streamLimit({
        input,
        max: 10,
        objectMode: true,
      });

      return new Promise((resolve, reject) => {
        input.pipe(split2())          // start with the input, read a line at a time
            .pipe(limitStream.fill)   // pipe through the limiter's fill stream
            .pipe(takesTime())        // do your tasks that have high overhead and take time
            .pipe(limitStream.drain)  // pipe through limiter's drain stream
            .pipe(output)             // pipe to the output stream
            .on('error', reject)
            .on('close', resolve);
      });
    }

## License

This project is [MIT licensed](https://github.com/tracker1/node-stream-limit-thoughput/blob/master/LICENSE.txt).
