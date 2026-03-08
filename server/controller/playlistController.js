const Playlist = require('../models/Playlist');
const User = require('../models/User');

const createPlaylist = async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user._id;
    const playlistImage = req.file ? `/images/${req.file.filename}` : null;

    if (!name) {
        return res.status(400).json({ error: 'Playlist name is required' });
    }

    try {
        const playlist = await Playlist.create({ name, description, playlistImage });

        await User.findByIdAndUpdate(userId, {
            $push: { playlists: playlist._id }
        });

        res.status(201).json(playlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePlaylist = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    try {
        const deletedPlaylist = await Playlist.findByIdAndDelete(id);

        if (!deletedPlaylist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { playlists: id }
        });

        res.status(200).json({ message: 'Playlist deleted successfully', id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addToPlaylist = async (req, res) => {
    const { id } = req.params;
    const { trackId, title, artist, cover, preview } = req.body;

    if (!trackId) {
        return res.status(400).json({ error: 'Track ID is required' });
    }

    try {
        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        const key = trackId.toString();

        if (playlist.playlistSongs.has(key)) {
            return res.status(400).json({ error: 'Track already in playlist' });
        }

        playlist.playlistSongs.set(key, { title, artist, cover, preview });
        await playlist.save();

        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeFromPlaylist = async (req, res) => {
    const { id } = req.params;
    const { trackId } = req.body;

    if (!trackId) {
        return res.status(400).json({ error: 'Track ID is required' });
    }

    try {
        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        const key = trackId.toString();

        if (!playlist.playlistSongs.has(key)) {
            return res.status(404).json({ error: 'Track not found in playlist' });
        }

        playlist.playlistSongs.delete(key);
        await playlist.save();

        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllPlaylists = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId).populate('playlists');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user.playlists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    getAllPlaylists
};