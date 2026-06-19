class Producer {
  constructor(channel) {
    this.channel = channel;
  }

  async produceMessages(data, correlationId, replyToQueue) {
    // TODO: 1. Send the response back to the client's replyToQueue
    // TODO: 2. Convert data to a Buffer
    // TODO: 3. Pass the correlationId in the options object so the client can match it
    this.channel.sendToQueue(replyToQueue, Buffer.from(JSON.stringify(data)), {
      correlationId,
    });
  }
}

module.exports = Producer;
