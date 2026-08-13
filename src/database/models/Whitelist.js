import mongoose from 'mongoose';

const WhitelistSchema = new mongoose.Schema({
  targetId: { type: String, required: true, unique: true, index: true },
  targetType: { type: String, enum: ['user', 'guild'], default: 'user' },
  reason: { type: String, default: 'Bypasses limits and checks' },
  addedBy: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Whitelist = mongoose.models.Whitelist || mongoose.model('Whitelist', WhitelistSchema);
export default Whitelist;
