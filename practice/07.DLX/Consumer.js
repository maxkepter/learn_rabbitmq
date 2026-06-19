//* LIB
const amqp = require("amqplib");

//* REQUIRED
const config = require("./src/config");

const connectToRabbitMQ = async () => {
  const connection = await amqp.connect(config.rabbitMQ.url);
  const channel = await connection.createChannel();
  return { channel };
};

const createConsumer = async () => {
  try {
    const { channel } = await connectToRabbitMQ();

    const notificationExchange = config.rabbitMQ.notificationExchange;
    const notificationQueue = config.rabbitMQ.notificationQueue;
    const notificationExchangeDLX = config.rabbitMQ.notificationExDLX;
    const notificationRoutingKeyDLX = config.rabbitMQ.notificationRoutingKeyDLX;

    // TODO: 1. Assert the main exchange (direct, durable)
    // TODO: 2. Assert the main queue with DLX options:
    //          - deadLetterExchange: notificationExchangeDLX
    //          - deadLetterRoutingKey: notificationRoutingKeyDLX
    // TODO: 3. Bind the main queue to the main exchange
    // TODO: 4. Consume messages from the main queue:
    //          - Wrap processing in a try/catch block.
    //          - In try: Simulate a failure (e.g., throw an error 80% of the time).
    //            If successful, log success and acknowledge the message (channel.ack).
    //          - In catch: Log the error and reject the message using channel.nack(msg, false, false)
    //            so it gets routed to the Dead Letter Exchange.

    await channel.assertExchange(notificationExchange, "direct", {
      durable: true,
    });

    await channel.assertQueue(notificationQueue, {
      durable: true,
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
    });

    await channel.bindQueue(notificationQueue, notificationExchange, "");

    channel.consume(notificationQueue, (msg) => {
      try {
        const rate = Math.random();
        console.log("Processing message with random rate:", rate);
        if (rate < 0.8) {
          throw new Error("Simulated processing failure");
        }
        console.log("Message processed successfully:", msg.content.toString());
        channel.ack(msg);
      } catch (error) {
        console.error("Error processing message:", error);
        channel.nack(msg, false, false); // Reject the message without requeueing
      }
    });
  } catch (error) {
    // console.error("Error:", error);
  }
};

createConsumer();
