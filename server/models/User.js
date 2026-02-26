const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: {type: String, required: true},
    profileImage: {
            type: String,
            default: null
    },
    
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],

    followedArtists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
    
    stats: {
        totalPlayCount: { type: Number, default: 0 },
        totalListeningTime: { type: Number, default: 0 }
    }
}, { timestamps: true });

userSchema.statics.signup = async function(username, email, password, profileImage){

    if(!email || !password || !username){
        throw Error('Fill all the fields');
    }
    if(!validator.isEmail(email)){
        throw Error('Email is not valid');
    }

    const exists = await this.findOne({ email });

    if(exists){
        throw Error('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({
        username, 
        email, 
        password: hash, 
        profileImage 
    });

    return user;
}

userSchema.statics.login = async function(email, password){
    if(!email || !password){
        throw Error('Fill all the fields');
    }

    const user = await this.findOne({ email });

    if(!user){
        throw Error("Incorrect Mail");
    }

    const comparePass = await bcrypt.compare(password, user.password);

    if(!comparePass){
        throw Error("Incorrect Password");
    }

    return user;
}

module.exports = mongoose.model('User', userSchema);