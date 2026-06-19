//* LIB
const amqp = require("amqplib");

//* REQUIRED
const config = require("./src/config");

const Producer = async () => {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();

    const notificationExchange = config.rabbitMQ.notificationExchange;
    const notificationQueue = config.rabbitMQ.notificationQueue;
    const notificationExchangeDLX = config.rabbitMQ.notificationExDLX;
    const notificationRoutingKeyDLX = config.rabbitMQ.notificationRoutingKeyDLX;

    // TODO: 1. Assert the main exchange (direct, durable)
    // TODO: 2. Assert the main queue with DLX options:
    //          - deadLetterExchange: notificationExchangeDLX
    //          - deadLetterRoutingKey: notificationRoutingKeyDLX
    // TODO: 3. Bind the main queue to the main exchange
    // TODO: 4. Publish a message to the main queue with a TTL (expiration) of 3000ms (3 seconds)

    await channel.assertExchange(notificationExchange, "direct", {
      durable: true,
    });

    await channel.assertQueue(notificationQueue, {
      durable: true,
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
    });

    await channel.bindQueue(notificationQueue, notificationExchange, "");

    const message = {
      title: "System Update",
      content: "A critical system update will be applied at midnight.",
    };

    channel.publish(
      notificationExchange,
      "",
      Buffer.from(JSON.stringify(message)),
      {
        expiration: 3000, // Message will expire after 3 seconds
      },
    );

    console.log("Producer setup completed. Message sent.");
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error:", error);
  }
};

Producer();
