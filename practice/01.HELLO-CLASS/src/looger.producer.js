const RabbitMQService = require("./rabbitmq/rabbitmq.service");

const rabbitMQService = RabbitMQService.getInstance();

const logMessage = [
  {
    type: "INFO",
    content: "This is a log message.",
  },
  {
    type: "ERROR",
    content: "This is an error message.",
  },
  {
    type: "WARNING",
    content: "This is a warning message.",
  },
];

setInterval(() => {
  rabbitMQService.produce(
    logMessage[Math.floor(Math.random() * logMessage.length)],
  );
}, 4000);
