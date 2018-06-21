const AWS = require('aws-sdk');
const KinesisObserver = require('./KinesisObserver');
const KinesisProducer = require('./KinesisProducer');
const KinesisConsumer = require('./KinesisConsumer');

class Kinesis {
  constructor(config, iteratorManager) {
    this.kinesis = new AWS.Kinesis(config);
    this.kinsesisObserver = new KinesisObserver();
    this.kinesisProducer = new KinesisProducer(this.kinesis);
    this.kinesisConsumer = new KinesisConsumer(this.kinesis, iteratorManager);

    this.consuming = false;
  }

  /**
   * Listen events by stream name
   * @param stream string
   * @param listener function
   */
  on(stream, listener) {
    this.kinsesisObserver.subscribe(stream, listener);


    if (!this.consuming) {
      this.consuming = true;

      this.kinesisConsumer.on(stream, data => this.kinsesisObserver.notify(stream, data));
    }
  }

  /**
   * Emit event by stream name
   * @param stream string
   * @param partitionKey string
   * @param data Object
   * @return {Promise.<PromiseResult.<D, E>>}
   */
  emit(stream, partitionKey, data) {
    return this.kinesisProducer.emit(stream, partitionKey, data);
  }
}

module.exports = Kinesis;
