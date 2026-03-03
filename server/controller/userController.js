const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const createJWT = (_id) => {
    return jwt.sign({_id}, process.env.SECRET_KEY, {expiresIn: '1d'});
}

const signupUser = async (req, res ) => {
    const {username, email, password} = req.body;
    const profileImage = req.file ? req.file.path.replace(/\\/g, "/") : null;

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

const toggleLikeSong = async (req, res) => {
    const userId = req.user._id;
    const { trackId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.likedSongs) user.likedSongs = new Map();

        const key = trackId.toString();
        const isLiked = user.likedSongs.has(key);

        if (isLiked) {
            user.likedSongs.delete(key);
        } else {
            user.likedSongs.set(key, true);
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

module.exports = {loginUser, signupUser, toggleLikeSong, isLikedSong}