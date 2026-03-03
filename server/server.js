require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const publicRoutes = require('./routes/public')
const userRoutes = require('./routes/user')
const playlistRoutes = require('./routes/playlist')
const deezerRoutes = require('./routes/deezer');

mongoose.connect(process.env.MONGO_URI, {
        dbName: 'music-player-db'
    })
    .then(() => {
        app.listen(process.env.PORT, () => {
        console.log("Server is listening on port " + process.env.PORT);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
});

app.use('/api/public', publicRoutes);
app.use('/api/user', userRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/deezer', deezerRoutes);