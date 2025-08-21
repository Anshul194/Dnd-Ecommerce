import mongoose from "mongoose";

const CallLogSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  callId: String,
  caller: String,
  duration: String,
  durationMs: Number,
  status: String,
  disposition: String,
  recordingUrl: String,
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  agentName: String,
  agentNumber: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.CallLog || mongoose.model("CallLog", CallLogSchema);
