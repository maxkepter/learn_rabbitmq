//* LIB
const amqp = require("amqplib");

//* REQUIRED
const config = require("./src/config");

const connectToRabbitMQ = async () => {
  const connection = await amqp.connect(config.rabbitMQ.url);
  const channel = await connection.createChannel();
  return { channel };
};

const consumerToQueueFail = async () => {
  try {
    const { channel } = await connectToRabbitMQ();
    const notificationExchangeDLX = config.rabbitMQ.notificationExDLX;
    const notificationRoutingKeyDLX = config.rabbitMQ.notificationRoutingKeyDLX;
    const notificationHandler = config.rabbitMQ.notificationHotFix;

    // TODO: 1. Assert the Dead Letter Exchange (direct, durable)
    // TODO: 2. Assert the Dead Letter Queue (notificationHandler)
    // TODO: 3. Bind the Dead Letter Queue to the Dead Letter Exchange using the routing key
    // TODO: 4. Consume messages from the Dead Letter Queue and log them as failed messages requiring hotfix

    await channel.assertExchange(notificationExchangeDLX, "direct", {
      durable: true,
    });

    await channel.assertQueue(notificationHandler, {
      durable: true,
    });

    await channel.bindQueue(
      notificationHandler,
      notificationExchangeDLX,
      notificationRoutingKeyDLX,
    );

    channel.consume(notificationHandler, (msg) => {
      const failedMessage = JSON.parse(msg.content.toString());
      console.log("Received failed message for hotfix:", failedMessage);
      channel.ack(msg);
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

consumerToQueueFail();
