const express = require('express');
const requireAuth = require('../middleware/requireAuth')
const {toggleLikeSong} = require('../controller/userController');

const router = express.Router();

router.use(requireAuth)

router.put('/like', toggleLikeSong);

module.exports = router;