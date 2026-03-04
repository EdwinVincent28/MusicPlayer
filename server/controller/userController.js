const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const createJWT = (_id) => {
    return jwt.sign({_id}, process.env.SECRET_KEY, {expiresIn: '1d'});
}

const signupUser = async (req, res ) => {
    const {username, email, password} = req.body;
    const profileImage = req.file ? `/images/${req.file.filename}` : null;

    try{
        const user = await User.signup(username, email, password, profileImage);

        const token = createJWT(user._id);
        // console.log(token);
        res.status(200).json({user, token}); 

    } 
    catch (error) {
        res.status(400).json({error: error.message});
    }
}

const loginUser = async (req, res ) => {
    const {email, password} = req.body;

        try{
        const user = await User.login(email, password);

        const token = createJWT(user._id);
        // console.log(token);
        res.status(200).json({email, token}); 

    } 
    catch (error) {
        res.status(400).json({error: error.message});
    }
}

const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user details" });
    }
};

const toggleLikeSong = async (req, res) => {
    const userId = req.user._id;
    const { trackId, title, artist, cover, preview, duration } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.likedSongs) user.likedSongs = new Map();

        const key = trackId.toString();
        const isLiked = user.likedSongs.has(key);

        if (isLiked) {
            user.likedSongs.delete(key);
        } else {
            user.likedSongs.set(key, { title, artist, cover, preview, duration });
        }

        await user.save();
        res.status(200).json({ message: isLiked ? 'Song removed from Liked Songs' : 'Song added to Liked Songs' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const isLikedSong = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.likedSongs) return res.status(200).json({ isLiked: false });

        const isLiked = user.likedSongs.has(req.params.trackId.toString());
        res.status(200).json({ isLiked });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getLikedSongs = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.likedSongs || user.likedSongs.size === 0) {
            return res.status(200).json({ likedSongs: [] });
        }

        const songs = [];
        user.likedSongs.forEach((trackData, trackId) => {
            const data = trackData?.toObject ? trackData.toObject() : trackData;
            songs.push({ id: trackId, ...data });
        });

        res.status(200).json({ likedSongs: songs });
    } catch (error) {
        console.error("getLikedSongs error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {loginUser, signupUser, getUserDetails,toggleLikeSong, isLikedSong, getLikedSongs}