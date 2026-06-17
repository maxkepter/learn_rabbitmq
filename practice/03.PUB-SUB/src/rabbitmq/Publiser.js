const amqp = require("amqplib");
const config = require("../config");

const publishLog = async (event) => {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();
    const exchange = config.rabbitMQ.exchange;

    await channel.assertExchange(exchange, "fanout", { durable: false });

    await channel.publish(
      exchange,
      "",
      Buffer.from(`${JSON.stringify(event)}`),
    );
    console.log(`[x] Sent ${event.category} log: ${event.message}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error:", error);
  }
};

const events = [
  { category: "auth", message: "User #1234 logged in" },
  { category: "auth", message: "Failed login attempt for user #5678" },
  { category: "payment", message: "Order #9012 processed - $49.99" },
  { category: "payment", message: "Refund issued for order #3456 - $12.50" },
  { category: "shipping", message: "Package #7890 dispatched to Hanoi" },
  { category: "shipping", message: "Delivery #1234 delayed due to weather" },
];

setInterval(async () => {
  const event = events[Math.floor(Math.random() * events.length)];
  await publishLog(event);
}, 2000);
