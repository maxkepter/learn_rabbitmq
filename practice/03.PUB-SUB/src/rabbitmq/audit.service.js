const amqp = require("amqplib");
const config = require("../config");

const auditSubscriber = async () => {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();
    const exchange = config.rabbitMQ.exchange;

    await channel.assertExchange(exchange, "fanout", { durable: false });

    const { queue } = await channel.assertQueue("auditQueue", {
      exclusive: true,
    });

    await channel.bindQueue(queue, exchange, "");

    const logArray = [];

    channel.consume(
      queue,
      (msg) => {
        if (msg.content) {
          const data = JSON.parse(msg.content.toString());
          logArray.push(data);

          console.log(`[Audit Subscriber] Received log: ${data.message}`);
        }
      },
      { noAck: true },
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

auditSubscriber();
