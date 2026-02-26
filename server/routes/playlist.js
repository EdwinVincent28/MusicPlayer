const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { 
    createPlaylist, 
    deletePlaylist, 
    addToPlaylist, 
    removeFromPlaylist,
    getAllPlaylists
} = require('../controller/playlistController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllPlaylists);
router.post('/', createPlaylist);
router.delete('/:id', deletePlaylist);
router.post('/:id/tracks', addToPlaylist);
router.delete('/:id/tracks', removeFromPlaylist);

module.exports = router;