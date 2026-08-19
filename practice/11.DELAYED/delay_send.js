const amqp = require("amqplib");
const config = require("./config");
const Noftication = require("./dto/nofti");

const sendMessage = async () => {
  const connection = await amqp.connect(config.rabbitMQ.url, { frameMax: 0 });
  const channel = await connection.createConfirmChannel();

  const notifications = [
    new Noftication(
      "user1@example.com",
      "Welcome to Service!",
      "Thank you for signing up for our service.",
    ),
    new Noftication(
      "user2@example.com",
      "Payment Reminder",
      "Your monthly subscription is due tomorrow.",
    ),
    new Noftication(
      "user3@example.com",
      "Password Reset Request",
      "Click the link below to reset your password.",
    ),
  ];

  for (const notif of notifications) {
    channel.sendToQueue(config.queue.queue.delay, Buffer.from(notif.toJSON()), {
      persistent: true,
    });
    console.log(`[x] Sent: ${notif.toString()}`);
  }

  await channel.waitForConfirms();
  await channel.close();
  await connection.close();
};

sendMessage().catch(console.error);
