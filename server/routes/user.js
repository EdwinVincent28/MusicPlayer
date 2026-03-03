const express = require('express');
const requireAuth = require('../middleware/requireAuth')
const {toggleLikeSong, isLikedSong} = require('../controller/userController');

const router = express.Router();

router.use(requireAuth)

router.put('/like', toggleLikeSong);

router.get("/like/:trackId", isLikedSong);

module.exports = router;