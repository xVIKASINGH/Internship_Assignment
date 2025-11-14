import express from "express";
import mongoose from "mongoose";
import { Event } from "../models/events.models.js"; // your model
import "dotenv/config";
const app = express();
app.use(express.json());
// MongoDB Connect
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error(err));
// ===============================
//        GET /stats
// ===============================
app.get("/stats", async (req, res) => {
    try {
        const { site_id, date } = req.query;
        if (!site_id) {
            return res.status(400).json({ error: "site_id is required" });
        }
        let match = { site_id };
        // Aggregation pipeline
        const result = await Event.aggregate([
            { $match: match },
            {
                $facet: {
                    total_views: [{ $count: "count" }],
                    unique_users: [
                        { $group: { _id: "$user_id" } },
                        { $count: "count" }
                    ],
                    top_paths: [
                        { $group: { _id: "$path", views: { $sum: 1 } } },
                        { $sort: { views: -1 } },
                        { $limit: 10 }
                    ]
                }
            }
        ]);
        const stats = result[0];
        res.json({
            site_id,
            date: date || "all_time",
            total_views: stats.total_views[0]?.count || 0,
            unique_users: stats.unique_users[0]?.count || 0,
            top_paths: stats.top_paths.map((p) => ({
                path: p._id,
                views: p.views,
            })),
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal error" });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
