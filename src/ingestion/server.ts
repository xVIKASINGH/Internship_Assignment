import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { eventQueue } from "../queue/redis.queue.js";


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/event", async (req, res) => {
  const { site_id, event_type, path, user_id, timestamp } = req.body;

  if (!site_id || !event_type) {
    return res.status(400).json({ message: "site_id and event_type are required" });
  }

  await eventQueue.add("new-event", {
    site_id,
    event_type,
    path,
    user_id,
    timestamp: timestamp || new Date().toISOString(),
  });

  return res.status(200).json({ message: "Event received" });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Ingestion API running on http://localhost:${PORT}`));
