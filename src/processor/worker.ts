import mongoose from "mongoose";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { Event } from "../models/events.models.js";
import 'dotenv/config';
const redisConnection = new IORedis({
  maxRetriesPerRequest: null,
});

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Processor connected to MongoDB"))
.catch(err => console.error(err));

const worker = new Worker(
  "event-queue",
  async job => {
    const data = job.data;
    await Event.create({
      site_id: data.site_id,
      event_type: data.event_type,
      path: data.path,
      user_id: data.user_id,
      timestamp: new Date(data.timestamp),
    });
    console.log("Event processed:", data);
  },
  { connection: redisConnection }
);

worker.on("completed", job => console.log(`Job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`Job ${job?.id} failed:`, err));
