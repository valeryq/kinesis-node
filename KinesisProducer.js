class KinesisProducer {
  constructor(kinesis) {
    this.kinesis = kinesis;
  }

  /**
   * Emit data to stream
   * @param stream
   * @param partitionKey
   * @param data
   * @return {Promise<PromiseResult<D, E>>}
   */
  emit(stream, partitionKey, data) {
    return this.kinesis.putRecord({
      StreamName: stream,
      PartitionKey: partitionKey,
      Data: JSON.stringify(data),
    }).promise();
  }
}

module.exports = KinesisProducer;
