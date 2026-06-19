const MessageHandler = require("../messageHandler");

class Consumer {
  constructor(channel, rpcQueue, produce) {
    this.channel = channel;
    this.rpcQueue = rpcQueue;
    this.producer = produce;
  }

  async consumeMessages() {
    console.log("Ready to consume messages...");

    // TODO: 1. Consume messages from the main RPC queue (this.rpcQueue)
    //          - PRODUCTION REQUIREMENT: Set noAck to false to enable manual acknowledgments.
    // TODO: 2. Wrap the message processing in a try/catch block for graceful error handling.
    // TODO: 3. Inside the try block:
    //          - Extract correlationId, replyTo, and the operation header from the message.
    //          - Call MessageHandler.handle with the operation, parsed message content, correlationId, and replyTo.
    //          - Send the response back using this.producer.produceMessages(response, correlationId, replyTo).
    //          - Acknowledge the message using this.channel.ack(message).
    // TODO: 4. Inside the catch block:
    //          - Log the error.
    //          - Send a structured error response back to the client (e.g., { error: error.message }) via the producer.
    //          - Acknowledge the message using this.channel.ack(message) so it is removed from the queue.

    this.channel.consume(
      this.rpcQueue,
      async (message) => {
        const { correlationId, replyTo } = message.properties;
        try {
          const operation = message.properties.headers.function;
          const data = JSON.parse(message.content.toString());

          if (!operation) {
            throw new Error("Missing operation header");
          }

          console.log(
            "Received message with operation:",
            operation,
            "and data:",
            data,
          );

          const { response } = await MessageHandler.handle(
            operation,
            data,
            correlationId,
            replyTo,
          );

          await this.producer.produceMessages(response, correlationId, replyTo);
          this.channel.ack(message);
        } catch (error) {
          console.error("Error processing message:", error);

          const errorResponse = {
            error: error.message || "Internal Server Error",
          };
          await this.producer.produceMessages(
            errorResponse,
            correlationId,
            replyTo,
          );
          this.channel.ack(message);
        }
      },
      {
        noAck: false,
      },
    );
  }
}

module.exports = Consumer;
