const express = require('express');
const router = express.Router();
const parameters = require('parameters-middleware');
const files = require('../controllers/my_files');
const token = require('../controllers/accessTokens');


router.post('/save',
    parameters({body: ['drive_id', 'user_id']}, {message: token.getMessage}),
    token.validateToken, files.save
);

module.exports = router;

