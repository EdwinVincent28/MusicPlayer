const express = require('express');
const upload = require('../middleware/upload')

const router = express.Router();

const {loginUser, signupUser} = require('../controller/userController');

router.post('/login', loginUser);

router.post('/signup', upload.single('profileImage'), signupUser);

module.exports = router;