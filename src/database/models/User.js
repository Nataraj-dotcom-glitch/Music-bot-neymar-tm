import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  requestsUsed: { type: Number, default: 0 },
  totalPlayed: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  premiumExpireDate: { type: Date, default: null },
  lastRequestReset: { type: Date, default: Date.now }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
