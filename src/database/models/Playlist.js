import mongoose from 'mongoose';

const TrackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  duration: { type: Number, default: 0 },
  artist: { type: String, default: 'Unknown Artist' },
  source: { type: String, default: 'youtube' },
  artwork: { type: String, default: null }
});

const PlaylistSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  tracks: [TrackSchema]
}, { timestamps: true });

PlaylistSchema.index({ ownerId: 1, name: 1 }, { unique: true });

export const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
export default Playlist;
