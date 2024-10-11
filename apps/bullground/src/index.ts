import { Queue, Worker } from 'bullmq';
import { redis } from '@cicd-test-workspace/redis'

const queueName = "fast"

const queue = new Queue(queueName, {
  connection: redis
});

const worker = new Worker(queueName, async (job) => {
  // Will print { foo: 'bar'} for the first job
  // and { qux: 'baz' } for the second.
  console.log(job.data);
}, { connection: redis });

process.on("SIGTERM", async () => {
  console.info("SIGTERM signal received: closing queues");

  await queue.close();

  console.info("All closed");
});

async function addJobs() {
  console.log("Adding jobs...");
  for (let i = 0; i < 10; i++) {
    await queue.add("my-job", { foo: "bar" });
  }
  console.log("Done");
}

addJobs();
