const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  imageUrl: { type: String },
  followerCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Artist', artistSchema);