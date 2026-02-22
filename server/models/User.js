const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {type: String, required: true},
  
  likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],

  followedArtists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
  
  stats: {
    totalPlayCount: { type: Number, default: 0 },
    totalListeningTime: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);