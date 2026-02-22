const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },

  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  
  albumArtUrl: { type: String, required: true }, 
  
  audioUrl: { type: String, required: true },
  
  duration: { type: Number, required: true },
  
  globalPlayCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);