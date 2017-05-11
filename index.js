'use strict';

module.exports = BatchArray;

function noop() {}

function BatchArray(options) {
  if (!(this instanceof BatchArray)) {
    return new BatchArray(options);
  }
  options = options || {};
  if (typeof options.batchInterval !== 'number') {
    throw new Error('options.batchInterval required');
  }
  if (typeof options.batchFn !== 'function') {
    throw new Error('options.onBatch required');
  }
  this.batchInterval = options.batchInterval;
  this.batch = options.initialBatch || [];
  this.batchFn = options.batchFn;

  this.startInterval();
}

BatchArray.prototype.push = function push(obj) {
  this.batch.push(obj);
};

BatchArray.prototype._flush = function _flush(cb) {
  var currentBatch = this.batch;
  this.batch = [];
  this.batchFn(currentBatch, cb);
};

BatchArray.prototype.flush = function flush(cb) {
  this.stopInterval();
  var self = this;
  cb = cb || noop;
  this._flush(function onDone() {
    self.startInterval();
    cb.apply(null, [].slice.call(arguments));
  });
};

BatchArray.prototype.startInterval = function startInterval() {
  this._interval = setInterval(
    this._flush.bind(this, noop),
    this.batchInterval
  );
};

BatchArray.prototype.stopInterval = function stopInterval() {
  clearInterval(this._interval);
};
