class KinesisIteratorManager {
  constructor(consumerName) {
    this.consumerName = consumerName;
    this.iterators = {};
  }

  /**
   * Get shard iterator by consumer name, stream name and shard id
   * @param streamName
   * @param shardId
   * @return string
   */
  getIterator({ streamName, shardId }) {
    throw new Error('Method getIterator should be implemented');
  }

  /**
   * Store shard iterator by consumer name, stream name and shard id
   * @param streamName
   * @param shardId
   * @param shardIterator
   */
  setIterator({ streamName, shardId, shardIterator }) {
    throw new Error('Method setIterator should be implemented');
  }
}

module.exports = KinesisIteratorManager;
