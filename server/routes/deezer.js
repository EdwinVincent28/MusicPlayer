const express = require("express");
const router = express.Router();
const { searchTracks, getChartTracks, getChartPlaylists, getChartAlbums,  
getArtistById, searchArtists, getArtistTopTracks, getArtistAlbums, getAlbumTracks  } = require("../controller/deezerController");

router.get("/search", searchTracks);
router.get("/chart/tracks",  getChartTracks);
router.get("/chart/playlists", getChartPlaylists);
router.get("/chart/albums",  getChartAlbums);

router.get("/search/artist", searchArtists);
router.get("/artist/:id/top", getArtistTopTracks);
router.get("/artist/:id/albums", getArtistAlbums);
router.get("/artist/:id", getArtistById);

router.get("/album/:id/tracks", getAlbumTracks);

module.exports = router;