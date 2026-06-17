//* LIB
const createConsumer = require("./consumer");

//* Create consumer for manager — receives ALL orders (kitchen + electronics + support)
createConsumer(["kitchen", "electronics", "support"]);
