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

module.exports = {loginUser, signupUser}