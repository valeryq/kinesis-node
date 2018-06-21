const get = require('lodash/get');
const set = require('lodash/set');
const KinesisIteratorManager = require('./KinesisIteratorManager');

class KinesisMemoryIteratorManager extends KinesisIteratorManager {
  constructor() {
    super('memory');

    this.iterators = {};
  }

  getIterator({ streamName, shardId }) {
    return get(this.iterators, [this.consumerName, streamName, shardId], null);
  }

  setIterator({ streamName, shardId, shardIterator }) {
    set(this.iterators, [this.consumerName, streamName, shardId], shardIterator);
  }
}

module.exports = KinesisMemoryIteratorManager;
