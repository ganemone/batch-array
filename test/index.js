'use strict';

var test = require('tape');
var setTimeout = require('timers').setTimeout;
var BatchArray = require('../');

test('BatchArray', function t(assert) {
  assert.ok(typeof BatchArray === 'function', 'exported correctly');

  assert.end();
});

test('A batch array with no batchInterval option', function assert(t) {
  t.throws(
    function createBatch() {
      BatchArray({
        batchFn: function noop() {}
      });
    },
    'options.batchInterval required'
  );
  t.end();
});

test('A batch array with no batchFn option', function assert(t) {
  t.throws(
    function createBatch() {
      BatchArray({
        batchInterval: 1000
      });
    },
    'options.batchFn required'
  );
  t.end();
});

test('A valid batch', function assert(t) {
  var expected = ['a', 'b'];
  var batcher = BatchArray({
    batchFn: handleBatch,
    batchInterval: 10
  });
  batcher.push('a');
  batcher.push('b');

  setTimeout(batcher.push.bind(batcher, 'c'), 50);

  function handleBatch(batch) {
    t.deepLooseEqual(
      batch,
      expected,
      'calls the batch function with the correct arguments'
    );
    batcher.stopInterval();
    t.end();
  }
});

test('Multiple batches', function assert(t) {
  var expected = ['a', 'b'];
  var batcher = BatchArray({
    batchFn: handleBatch,
    batchInterval: 10
  });
  batcher.push('a');
  batcher.push('b');

  setTimeout(batcher.push.bind(batcher, 'c'), 15);

  var shouldQuit = false;
  function handleBatch(batch) {
    t.deepLooseEqual(
      batch,
      expected,
      'calls the batch function with the correct arguments'
    );
    if (shouldQuit) {
      batcher.stopInterval();
      t.end();
    }
    expected = ['c'];
    shouldQuit = true;
  }
});

test('Flushing a batch', function assert(t) {
  var expected = ['a', 'b'];
  var batcher = BatchArray({
    batchFn: handleBatch,
    batchInterval: 50
  });
  batcher.push('a');
  batcher.push('b');
  var shouldQuit = false;
  batcher.flush(function onFlushed() {
    expected = [];
    shouldQuit = true;
  });

  function handleBatch(batch, cb) {
    t.deepLooseEqual(
      batch,
      expected,
      'calls the batch function with the correct arguments'
    );
    if (shouldQuit) {
      batcher.stopInterval();
      t.end();
    }
    return cb();
  }
});

test('Flushing a batch with no callback', function assert(t) {
  var expected = ['a', 'b'];
  var shouldQuit = false;
  var batcher = BatchArray({
    batchFn: handleBatch,
    batchInterval: 50
  });
  batcher.push('a');
  batcher.push('b');

  batcher.flush();

  batcher.push('c');

  function handleBatch(batch, cb) {
    if (shouldQuit === false) {
      t.deepLooseEqual(
        batch,
        expected,
        'calls the batch function with the correct arguments'
      );
      shouldQuit = true;
    } else {
      batcher.stopInterval();
      t.end();
    }
    return cb();
  }
});
