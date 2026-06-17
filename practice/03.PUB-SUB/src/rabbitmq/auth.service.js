const amqp = require("amqplib");
const config = require("../config");

const authSubscriber = async () => {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();
    const exchange = config.rabbitMQ.exchange;

    await channel.assertExchange(exchange, "fanout", { durable: false });

    const { queue } = await channel.assertQueue("authQueue", {
      exclusive: true,
    });

    await channel.bindQueue(queue, exchange, "");

    channel.consume(
      queue,
      (msg) => {
        if (msg.content) {
          const data = JSON.parse(msg.content.toString());
          if (data.category === "auth") {
            console.log(`[Auth Subscriber] Received auth log: ${data.message}`);
          }
        }
      },
      { noAck: true },
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

authSubscriber();
