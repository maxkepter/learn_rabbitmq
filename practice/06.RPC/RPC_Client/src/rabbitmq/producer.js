//* LIB
const { randomUUID } = require("crypto");
const config = require("../config");

class Producer {
  constructor(channel, replyQueueName, eventEmitter) {
    this.channel = channel;
    this.replyQueueName = replyQueueName;
    this.eventEmitter = eventEmitter;
  }

  async produceMessages(data) {
    // TODO: 1. Generate a unique correlationId (UUID)
    // TODO: 2. Publish the message to the RPC queue (config.rabbitMQ.queues.rpcQueue)
    //          - Convert data to a Buffer
    //          - Pass options: replyTo (this.replyQueueName), correlationId, and headers (e.g., function: data.operation)
    // TODO: 3. Return a Promise that resolves when the eventEmitter receives an event with the correlationId
    //          - PRODUCTION REQUIREMENT: Implement a 5-second timeout. If the response is not received within 5 seconds,
    //            reject the Promise with a "Request timed out" error.
    //          - PRODUCTION REQUIREMENT: Clean up the event listener using `this.eventEmitter.off(correlationId, ...)`
    //            in both success and timeout cases to prevent memory leaks.
    console.log("Producing message with data:", data);

    const correlationId = randomUUID();
    this.channel.sendToQueue(
      config.rabbitMQ.queues.rpcQueue,
      Buffer.from(JSON.stringify(data)),
      {
        replyTo: this.replyQueueName,
        correlationId,
        headers: { function: data.operation },
      },
    );

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.eventEmitter.off(correlationId, onResponse);
        reject(new Error("Request timed out"));
      }, 5000);

      const onResponse = (response) => {
        clearTimeout(timeout);
        this.eventEmitter.off(correlationId, onResponse);
        resolve(response);
      };

      this.eventEmitter.on(correlationId, onResponse);
    });
  }
}

module.exports = Producer;
