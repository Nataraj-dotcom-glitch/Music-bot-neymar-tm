import mongoose from 'mongoose';

const BlacklistSchema = new mongoose.Schema({
  targetId: { type: String, required: true, unique: true, index: true },
  targetType: { type: String, enum: ['user', 'guild'], default: 'user' },
  reason: { type: String, default: 'Violated Terms of Service' },
  addedBy: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Blacklist = mongoose.models.Blacklist || mongoose.model('Blacklist', BlacklistSchema);
export default Blacklist;
