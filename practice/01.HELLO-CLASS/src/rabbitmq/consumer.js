const config = require("../config");

class Consumer {
  constructor(channel, queue) {
    this.channel = channel;
    this.queue = queue;
  }

  async consumeMessages(callback) {
    const queue = config.rabbitMQ.queues.helloClassQueue;
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.consume(
      queue,
      async (msg) => {
        if (msg.content) {
          try {
            const message = JSON.parse(msg.content.toString());
            console.log(
              `Received message with queue "${queue}":`,
              msg.content.toString(),
            );
            if (callback) {
              await callback(message);
            }
            // Acknowledge: delete message from queue after success
            this.channel.ack(msg);
          } catch (error) {
            console.error("Error processing message:", error);
            // Reject & requeue (false = don't requeue to discard it)
            this.channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false },
    );
  }
}

module.exports = Consumer;
