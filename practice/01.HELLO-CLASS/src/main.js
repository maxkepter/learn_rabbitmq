const RabbitMQService = require("./rabbitmq/rabbitmq.service");

const rabbitmqService = RabbitMQService.getInstance();

rabbitmqService.clearQueue().then(() => {
  console.log("Queue cleared, starting producer and consumer...");
});
