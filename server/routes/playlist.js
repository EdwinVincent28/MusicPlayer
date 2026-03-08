const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const upload = require('../middleware/upload');

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
router.post('/', upload.single('playlistImage'), createPlaylist);
router.delete('/:id', deletePlaylist);
router.post('/:id/tracks', addToPlaylist);
router.delete('/:id/tracks', removeFromPlaylist);

module.exports = router;