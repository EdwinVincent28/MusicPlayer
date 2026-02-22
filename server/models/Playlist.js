const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);