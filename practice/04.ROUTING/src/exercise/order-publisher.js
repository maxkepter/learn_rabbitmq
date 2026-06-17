//* LIB
const amqp = require("amqplib");

//* REQUIRED
const config = require("../config");

const createPublisher = async (routingKey, message) => {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();
    const exchange = config.rabbitMQ.exchange;

    await channel.assertExchange(exchange, "direct", { durable: false });

    await channel.publish(exchange, routingKey, Buffer.from(message));
    console.log(` [x] Sent to "${routingKey}": ${message}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error:", error);
  }
};
const orders = [
  { category: "food", item: "Pizza Margherita", table: 5 },
  { category: "drink", item: "Espresso", table: 3 },
  { category: "gadget", item: "Bluetooth Speaker", orderId: 1024 },
  { category: "device", item: "USB-C Hub", orderId: 1025 },
  { category: "complaint", item: "Late delivery", customerId: "C001" },
  { category: "return", item: "Defective keyboard", customerId: "C002" },
];

const categoryToRoutingKey = {
  food: "kitchen",
  drink: "kitchen",
  gadget: "electronics",
  device: "electronics",
  complaint: "support",
  return: "support",
};

setInterval(async () => {
  const order = orders[Math.floor(Math.random() * orders.length)];
  const routingKey = categoryToRoutingKey[order.category];
  const payload = JSON.stringify(order);

  await createPublisher(routingKey, payload);
}, 1000);
