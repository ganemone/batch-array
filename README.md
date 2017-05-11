# batch-array

A simple library to handle batching up an array before calling a function with it. Each call to `batcher.push(item)` adds an item to the current batch. After `batchInterval`, `batchFn` is called with an array of the items pushed.

```
npm install batch-array
```

## Usage

```js
var BatchArray = require('batch-array');
var myBatcher = new BatchArray({
  batchFn: handleBatch,
  batchInterval: 1000
});

function handleBatch(batch, cb) {
  console.log(batch);
  return cb();
}

myBatcher.push('a');
myBatcher.push('b');

setTimeout(function() {
  myBatcher.push('c');
  myBatcher.push('d');
}, 1500);

setTimeout(function() {
  myBatcher.push('e');
  myBatcher.push('f');
  myBatcher.flush();
}, 2500);

// OUTPUT
['a', 'b'] // at 1000ms elapsed
['c', 'd'] // at 2000ms elapsed
['e', 'f'] // at 2500ms elapsed
[] // at 3500ms elapsed
```

## Interface

`var myBatcher = new BatchArray(options)`
`options.batchFn` { function(batch, cb) | required } - function to be called on an interval with the batch and a callback.
`options.batchInterval` { number | required } - interval in ms to call the batch function with the batched arguments.

`myBatcher.push(item)` - pushes an item into the current batch.
`myBatcher.flush(cb)` - causes an immediate call to the batch function and resets the batchInterval, "flushing" out the current batch. Callback is passed to the batch function.
`myBatcher.startInterval()` - starts the batch interval. Automatically called upon creating a batch object.
`myBatcher.stopInterval()` - stops the batch interval
