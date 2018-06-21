class KinesisObserver {
  constructor() {
    this.subscribers = {};
  }

  /**
   * Subscribe to notification by key
   * @param key
   * @param listener
   */
  subscribe(key, listener) {
    if (!this.subscribers[key]) {
      this.subscribers[key] = { listeners: [] };
    }

    this.subscribers[key].listeners.push(listener);
  }

  /**
   * Notify all subscribers by key
   * @param key
   * @param data
   */
  notify(key, data) {
    if (this.subscribers[key] && this.subscribers[key].listeners.length > 0) {
      this.subscribers[key].listeners.forEach(listener => listener(data));
    }
  }
}

module.exports = KinesisObserver;
