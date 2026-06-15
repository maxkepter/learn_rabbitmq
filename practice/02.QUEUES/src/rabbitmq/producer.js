const config = require("../config");

class Producer {
  constructor(channel) {
    this.channel = channel;
  }

  async produceMessages(data) {
    const queue = config.rabbitMQ.queues.helloClassQueue;
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(data))
    );
    return queue;
  }
}

module.exports = Producer;
