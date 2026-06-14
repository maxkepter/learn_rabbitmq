function logger(message) {
  const timestamp = new Date().toISOString();
  const logType = message.type;
  const logMessage = message.content;
  console.log(`[${timestamp}] [${logType}] ${logMessage}`);
}

const RabbitMQService = require("./rabbitmq/rabbitmq.service");

const rabbitMQService = RabbitMQService.getInstance();

rabbitMQService.consume(logger);
