const amqp = require("amqplib");
const config = require("./src/config");
const fs = require("fs");
const offsetFilePath = "./offset.txt";
const dataWarehouseFilePath = "./dataWarehouse.txt";

// Save data warehouse
async function saveToDataWarehouse(message) {
  return new Promise((resolve, reject) => {
    fs.appendFile(dataWarehouseFilePath, message + "\n", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function consumeMessages() {
  try {
    const connection = await amqp.connect(config.rabbitMQ.url, { frameMax: 0 });
    const channel = await connection.createChannel();

    // TODO: Assert the queue with the correct stream argument
    await channel.assertQueue(config.queue.name, {
      arguments: { "x-queue-type": "stream" },
    });

    await channel.prefetch(1);

    // TODO: Read the offset from offsetFilePath. If it doesn't exist, default to 'first'
    let offset = fs.existsSync(offsetFilePath)
      ? parseInt(fs.readFileSync(offsetFilePath, "utf8"))
      : "first";
    console.log(`Starting from offset: ${offset}`);

    // TODO: Consume from the stream queue starting from the specified offset
    channel.consume(
      config.queue.name,
      async (msg) => {
        if (msg !== null) {
          try {
            const messageContent = msg.content.toString();
            console.log(`Received: ${messageContent}`);
            await saveToDataWarehouse(messageContent);

            // TODO: Extract the offset (deliveryTag) from the message and save it to offsetFilePath
            offset = msg.fields.deliveryTag;
            fs.writeFileSync(offsetFilePath, offset.toString(), "utf8");

            channel.ack(msg);
          } catch (error) {
            console.error("Error processing message:", error);
          }
        }
      },
      {
        noAck: false,
        // TODO: Pass the stream offset argument here
      }
    );

    console.log("Waiting for messages.");
  } catch (error) {
    console.error("Error consuming messages:", error);
  }
}

consumeMessages();
