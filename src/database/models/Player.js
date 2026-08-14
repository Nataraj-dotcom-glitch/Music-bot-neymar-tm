import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  textChannelId: { type: String, default: null },
  voiceChannelId: { type: String, default: null },
  volume: { type: Number, default: 100 },
  paused: { type: Boolean, default: false },
  loopMode: { type: String, enum: ['off', 'track', 'queue'], default: 'off' },
  autoplay: { type: Boolean, default: false },
  filters: { type: [String], default: [] },
  twentyFourSeven: { type: Boolean, default: false },
  currentTrack: { type: Object, default: null },
  queue: { type: Array, default: [] }
}, { timestamps: true });

export const PlayerModel = mongoose.models.Player || mongoose.model('Player', PlayerSchema);
export default PlayerModel;
