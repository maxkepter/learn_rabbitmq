const amqp = require("amqplib");
const config = require("./config");
const setupDelay = async () => {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url, { frameMax: 0 });
    const channel = await connection.createConfirmChannel();

    const routing = "go";

    await channel.assertExchange(config.queue.exchange, "direct", {
      durable: true,
    });

    await channel.assertQueue(config.queue.queue.delay, {
      arguments: {
        "x-message-ttl": 10000,
        "x-dead-letter-exchange": config.queue.exchange,
        "x-dead-letter-routing-key": routing,
      },
      durable: true,
    });
    await channel.assertQueue(config.queue.queue.retry, {
      arguments: {
        "x-message-ttl": 5000,
        "x-dead-letter-exchange": config.queue.exchange,
        "x-dead-letter-routing-key": routing,
      },
      durable: true,
    });
    await channel.assertQueue(config.queue.queue.deadLetter, { durable: true });
    await channel.assertQueue(config.queue.queue.target, { durable: true });
    await channel.bindQueue(
      config.queue.queue.target,
      config.queue.exchange,
      routing,
    );

    console.log(" [*] Delay setup ready.");
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error(error);
  }
};

setupDelay().catch(console.error);
