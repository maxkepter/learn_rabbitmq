const dotenv = require("dotenv");

dotenv.config();

const rabbitMQ = {
  url: `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@localhost/${process.env.RABBITMQ_DEFAULT_VHOST || ""}?frameMax=65536`,
};

const queue = {
  exchange: "main_exchange",
  queue: {
    delay: "delay_queue_10s",
    target: "delayed_target_10s",
    retry: "retry_queue",
    deadLetter: "dead_letter_queue",
  },
};

module.exports = { rabbitMQ, queue };
