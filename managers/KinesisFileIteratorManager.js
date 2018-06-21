const fs = require('fs');
const get = require('lodash/get');
const set = require('lodash/set');
const KinesisIteratorManager = require('./KinesisIteratorManager');

class KinesisMemoryIteratorManager extends KinesisIteratorManager {
  constructor() {
    super('file');

    this.iterators = {};
    this.filePath = `${process.cwd()}/kinesis_iterators`;
  }

  _readFile() {
    return new Promise((resolve) => {
      fs.readFile(this.filePath, (err, data) => {
        if (err) {
          resolve({});
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  _writeFile(data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.filePath, JSON.stringify(data), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getIterator({ streamName, shardId }) {
    const iterators = await this._readFile();

    return get(iterators, [this.consumerName, streamName, shardId]);
  }

  async setIterator({ streamName, shardId, shardIterator }) {
    const iterators = await this._readFile();
    const updatedIterators = set(iterators, [this.consumerName, streamName, shardId], shardIterator);

    await this._writeFile(updatedIterators);
  }
}

module.exports = KinesisMemoryIteratorManager;
