const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String},
  
  tracks: [{ 
    type: Number 
  }],
  
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);