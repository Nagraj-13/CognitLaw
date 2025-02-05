import mongoose from "mongoose";
const AIQuerySchema = new mongoose.Schema({
    query: { type: String, required: true },
    response: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
  
export const AIQuery = mongoose.model('AIQuery', AIQuerySchema);
  