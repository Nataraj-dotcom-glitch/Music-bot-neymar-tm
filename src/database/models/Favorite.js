const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  trackIdentifier: { type: String, required: true },
  title: { type: String, required: true },
  artist: { type: String, default: 'Unknown Artist' },
  source: { type: String, default: 'youtube' },
  duration: { type: Number, default: 0 },
  artwork: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

FavoriteSchema.index({ userId: 1, trackIdentifier: 1 }, { unique: true });

module.exports = mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);
