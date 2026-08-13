import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  guildId: { type: String, default: null },
  userId: { type: String, default: null },
  commandName: { type: String, default: null },
  message: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const Log = mongoose.models.Log || mongoose.model('Log', LogSchema);
export default Log;
