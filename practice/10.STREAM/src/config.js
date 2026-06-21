const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  rabbitMQ: {
    url: `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@localhost/${process.env.RABBITMQ_DEFAULT_VHOST || ""}?frameMax=65536`,
  },
  queue: {
    name: "my_stream",
  },
};
