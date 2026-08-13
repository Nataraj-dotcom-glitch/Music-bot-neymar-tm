import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  musicChannelId: { type: String, default: null },
  requestChannelId: { type: String, default: null },
  djRoleId: { type: String, default: null },
  logChannelId: { type: String, default: null },
  announceChannelId: { type: String, default: null },
  volumeLimit: { type: Number, default: 100 },
  maxQueue: { type: Number, default: 500 },
  autoLeave: { type: Boolean, default: true },
  twentyFourSeven: { type: Boolean, default: false },
  announce: { type: Boolean, default: true },
  language: { type: String, default: 'en' },
  isPremiumGuild: { type: Boolean, default: false }
}, { timestamps: true });

export const Guild = mongoose.models.Guild || mongoose.model('Guild', GuildSchema);
export default Guild;
