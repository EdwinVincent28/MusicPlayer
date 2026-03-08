const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String},
  
  playlistSongs: {
        type: Map,
        of: new mongoose.Schema({
            title: String,
            artist: String,
            cover: String,
            preview: String,
            duration: Number,
        }, { _id: false }),
        default: {}
  },

  playlistImage: {
      type: String,
      default: null
  },
  
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);