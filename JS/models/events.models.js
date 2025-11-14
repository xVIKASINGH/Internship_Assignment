import mongoose, { Schema } from "mongoose";
const EventSchema = new Schema({
    site_id: { type: String, required: true },
    event_type: { type: String, required: true },
    path: String,
    user_id: String,
    timestamp: { type: Date, required: true },
});
export const Event = mongoose.model("Events", EventSchema);
