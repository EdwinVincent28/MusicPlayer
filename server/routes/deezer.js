const express = require("express");
const router = express.Router();
const { searchTracks } = require("../controller/deezerController");

router.get("/search", searchTracks);

module.exports = router;