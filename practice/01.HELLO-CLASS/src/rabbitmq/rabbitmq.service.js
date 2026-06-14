const amqp = require("amqplib");
const config = require("../config");
const Consumer = require("./consumer");
const Producer = require("./producer");

class RabbitMQService {
  constructor() {
    this.isInitialized = false;
    this.connection = null;
    this.producerChannel = null;
    this.consumerChannel = null;
    this.consumer = null;
    this.producer = null;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RabbitMQService();
    }
    return this.instance;
  }

  async initialize() {
    try {
      this.connection = await amqp.connect(config.rabbitMQ.url);

      this.producerChannel = await this.connection.createChannel();
      this.consumerChannel = await this.connection.createChannel();

      this.consumer = new Consumer(this.consumerChannel);
      this.producer = new Producer(this.producerChannel);

      this.isInitialized = true;
      console.log(`RabbitMQ Ready 🐇!!!`);
    } catch (error) {
      console.error("rabbitmq error...", error);
      throw error;
    }
  }

  async produce(data) {
    if (!this.isInitialized) await this.initialize();
    return await this.producer.produceMessages(data);
  }

  async consume(callback) {
    if (!this.isInitialized) await this.initialize();
    return await this.consumer.consumeMessages(callback);
  }

  async clearQueue() {
    if (!this.isInitialized) await this.initialize();

    const queue = config.rabbitMQ.queues.helloClassQueue;
    await this.producerChannel.assertQueue(queue, { durable: true });
    await this.producerChannel.purgeQueue(queue);
    console.log(`Queue "${queue}" cleared!`);
  }
}

module.exports = RabbitMQService;
