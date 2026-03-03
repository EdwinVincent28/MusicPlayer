const express = require('express');
const requireAuth = require('../middleware/requireAuth')
const {toggleLikeSong, isLikedSong, getLikedSongs} = require('../controller/userController');

const router = express.Router();

router.use(requireAuth)

router.put('/like', toggleLikeSong);

router.get("/like/:trackId", isLikedSong);

router.get("/liked-songs", getLikedSongs);

module.exports = router;