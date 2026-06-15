//* LIB
const amqp = require("amqplib");

//* REQUIRED
const config = require("./src/config");

const createConsumer = async () => {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();

    //* Variable queue uniques for consumer
    const { queue } = await channel.assertQueue(
      config.rabbitMQ.queues.workQueues,
      { exclusive: false, durable: true },
    );

    await channel.prefetch(1);

    //* Handle message received
    channel.consume(
      queue,
      (msg) => {
        if (msg.content) {
          console.log(
            ` [x] Received message with queue 1 "${config.rabbitMQ.queues.workQueues}":`,
            msg.content.toString(),
          );
        }
        setTimeout(() => {
          console.log("Done processing consumer 1!");
          channel.ack(msg);
        }, 4000);
      },
      { noAck: false },
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

createConsumer();
