const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  artist: { type: String, default: 'Unknown Artist' },
  url: { type: String, required: true },
  duration: { type: Number, default: 0 },
  source: { type: String, default: 'youtube' },
  playedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.History || mongoose.model('History', HistorySchema);
