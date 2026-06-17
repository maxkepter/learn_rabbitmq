//* LIB
const createConsumer = require("./consumer");

//* Run all consumers simultaneously
const startAllConsumers = async () => {
  console.log("🚀 Starting all consumers...\n");

  // Kitchen — receives food & drink orders
  createConsumer("kitchen");
  console.log("   ✅ Kitchen consumer started (routing key: 'kitchen')\n");

  // Electronics — receives gadget & device orders
  createConsumer("electronics");
  console.log("   ✅ Electronics consumer started (routing key: 'electronics')\n");

  // Support — receives complaint & return orders
  createConsumer("support");
  console.log("   ✅ Support consumer started (routing key: 'support')\n");

  // Manager — receives ALL orders
  createConsumer(["kitchen", "electronics", "support"]);
  console.log("   ✅ Manager consumer started (routing keys: all)\n");

  console.log("⚡ All consumers are running. Waiting for messages...\n");
};

startAllConsumers();
