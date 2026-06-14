#!/bin/bash

# Start both producer and consumer concurrently
echo "Starting RabbitMQ Producer and Consumer..."
echo

# Run both in background, show their output
node src/looger.producer.js &
PRODUCER_PID=$!

node src/logger.consumer.js &
CONSUMER_PID=$!

echo "Producer (PID: $PRODUCER_PID) started."
echo "Consumer (PID: $CONSUMER_PID) started."
echo
echo "Press Ctrl+C to stop both."

# Trap to kill both on exit
trap "kill $PRODUCER_PID $CONSUMER_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for either to finish
wait
