class Consumer {
  constructor(channel, replyQueueName, eventEmitter) {
    this.channel = channel;
    this.replyQueueName = replyQueueName;
    this.eventEmitter = eventEmitter;
  }

  async consumeMessages() {
    console.log("Ready to consume messages...");

    // TODO: 1. Consume messages from the exclusive reply queue (this.replyQueueName)
    // TODO: 2. Extract the correlationId from message.properties
    // TODO: 3. Emit the response data using the eventEmitter with the correlationId as the event name
    // TODO: 4. Set noAck to true since we don't need manual acknowledgments for this temporary queue
    this.channel.consume(
      this.replyQueueName,
      (message) => {
        const { correlationId } = message.properties;
        const response = JSON.parse(message.content.toString());

        this.eventEmitter.emit(correlationId, response);
      },
      { noAck: true },
    );
  }
}

module.exports = Consumer;
