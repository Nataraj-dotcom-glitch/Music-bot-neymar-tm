import mongoose from 'mongoose';

const PremiumSchema = new mongoose.Schema({
  targetId: { type: String, required: true, index: true },
  targetType: { type: String, enum: ['user', 'guild'], default: 'user' },
  duration: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  expirationDate: { type: Date, default: null },
  isPermanent: { type: Boolean, default: false },
  grantedBy: { type: String, required: true },
  reason: { type: String, default: 'Granted by owner' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Premium = mongoose.models.Premium || mongoose.model('Premium', PremiumSchema);
export default Premium;
