const forever = require('./utils/forever');
const KinesisIteratorManager = require('./managers/KinesisIteratorManager');

class KinesisConsumer {
  constructor(kinesis, iteratorManager) {
    if (!(iteratorManager instanceof KinesisIteratorManager)) {
      throw new Error('IteratorManager should be instance of KinesisIteratorManager');
    }

    this.kinesis = kinesis;
    this.iteratorManager = iteratorManager;
  }

  /**
   * Decode records from base64 buffer and parse json result
   * @param records
   * @private
   */
  _decodeRecords(records) {
    return records.map(record => JSON.parse(Buffer.from(record.Data, 'base64').toString('utf8')));
  }

  /**
   * Listen events by stream name
   *
   * NOTICE: If this method will invoking multiple times -> it will cause that request to kinesis will increase in the
   * arithmetic progression.
   *
   * @param stream
   * @param listener
   */
  on(stream, listener) {
    forever(async (done) => {
      try {
        // Get description about stream
        const { StreamDescription: { Shards } } = await this.kinesis.describeStream({ StreamName: stream }).promise();

        // Collect requests for each shard to get records
        const promises = Shards.map(async (shard) => {
          // If shardIterator is empty -> get iterator from Kinesis
          if (!await this.iteratorManager.getIterator({ streamName: stream, shardId: shard.ShardId })) {
            const { ShardIterator } = await this.kinesis.getShardIterator({
              ShardId: shard.ShardId,
              ShardIteratorType: 'TRIM_HORIZON',
              StreamName: stream,
            }).promise();

            await this.iteratorManager.setIterator({
              streamName: stream,
              shardId: shard.ShardId,
              shardIterator: ShardIterator,
            });
          }

          const shardIterator = await this.iteratorManager.getIterator({ streamName: stream, shardId: shard.ShardId });

          const {
            Records,
            NextShardIterator,
          } = await this.kinesis.getRecords({ ShardIterator: shardIterator }).promise();

          // Set next shard iterator for next stream iterations
          await this.iteratorManager.setIterator({
            streamName: stream,
            shardId: shard.ShardId,
            shardIterator: NextShardIterator,
          });

          // Call callback only if data available in a response
          if (Records.length) {
            listener(this._decodeRecords(Records));
          }
        });

        await Promise.all(promises);
        done();
      } catch (e) {
        if (!['LimitExceededException', 'ProvisionedThroughputExceededException'].includes(e.name)) {
          console.log('======>', e.name);
          throw e;
        }

        done();
      }
    });
  }
}

module.exports = KinesisConsumer;
