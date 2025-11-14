import mongoose,{Schema,Document } from "mongoose";

export interface IEvents extends Document{
    site_id:string,
    event_type:string,
    path?:string,
    user_id:string,
    timestamp:Date
}

const EventSchema: Schema = new Schema({
  site_id: { type: String, required: true },
  event_type: { type: String, required: true },
  path: String,
  user_id: String,
  timestamp: { type: Date, required: true },
});

export const Event =mongoose.model<IEvents>("Events",EventSchema);