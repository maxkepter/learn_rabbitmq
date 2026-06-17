//* LIB
const amqp = require("amqplib");

//* REQUIRED
const config = require("../config");

const createConsumer = async (routingKeys) => {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();
    const exchange = config.rabbitMQ.exchange;

    await channel.assertExchange(exchange, "direct", { durable: false });

    const { queue } = await channel.assertQueue("", { exclusive: true });

    // Support both single string and array of routing keys
    const keys = Array.isArray(routingKeys) ? routingKeys : [routingKeys];
    for (const key of keys) {
      await channel.bindQueue(queue, exchange, key);
    }
    console.log(
      ` [*] Waiting for messages in ${queue} with routing key(s): "${keys.join(", ")}". To exit press CTRL+C`,
    );

    channel.consume(
      queue,
      (msg) => {
        if (msg.content) {
          const data = JSON.parse(msg.content.toString());

          console.log(
            `[x] Recieved order ${data.category} item: ${data.item} by: ${data.table || data.orderId || data.customerId} with routing key: ${keys.join(", ")}}`,
          );
        }
      },
      { noAck: true },
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = createConsumer;
