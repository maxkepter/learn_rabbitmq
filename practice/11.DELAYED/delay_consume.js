const amqp = require("amqplib");
const config = require("./config");
const Noftication = require("./dto/nofti");

function randomRate(rate) {
  if (rate <= 1) {
    return true;
  }
  let random = Math.random() * rate;

  return random <= 1;
}

const consume = async () => {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url, { frameMax: 0 });
    const channel = await connection.createConfirmChannel();

    await channel.assertQueue(config.queue.queue.target, { durable: true });

    channel.consume(
      config.queue.queue.target,
      async (msg) => {
        if (!msg) return;

        try {
          const notif = Noftication.fromJSON(msg.content.toString());
          console.log("\n--------------------------------------------------");
          console.log("[x] Received:", notif.toString());

          if (randomRate(2)) {
            console.log(`[✓] SUCCESS: Processed notification for ${notif.email}`);
            channel.ack(msg);
          } else {
            console.warn(`[!] FAILED: Processing simulated failure for ${notif.email}`);

            if (notif.canRetry(3)) {
              notif.incrementRetry();
              console.log(
                `[↻] RETRY (${notif.retryCount}/3): Routing to '${config.queue.queue.retry}'...`
              );

              channel.sendToQueue(
                config.queue.queue.retry,
                Buffer.from(notif.toJSON()),
                { persistent: true }
              );
            } else {
              console.error(
                `[✗] DEAD-LETTER: Max retries (3/3) exceeded -> Routing to '${config.queue.queue.deadLetter}'`
              );

              channel.sendToQueue(
                config.queue.queue.deadLetter,
                Buffer.from(notif.toJSON()),
                { persistent: true }
              );
            }

            channel.ack(msg);
          }
        } catch (error) {
          console.error("[!] Parse/Process Error:", error.message);
          channel.nack(msg, false, false);
        }
      },
      {
        noAck: false,
      }
    );

    console.log("Waiting for messages.");
  } catch (error) {
    console.error(error);
  }
};

consume();
