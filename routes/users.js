const express = require('express');
const router = express.Router();
const parameters = require('parameters-middleware');
const user = require('../controllers/users');
const token = require('../controllers/accessTokens');


router.post('/login',
    parameters({body: ['email', 'password']}, {message: token.getMessage}),
    user.login, token.getToken
);

router.post('/register',
    parameters({body: ['email', 'password', 'name']}, {message: token.getMessage}),
    user.register
);

router.put('/forgotPassword',
    parameters({body: ['email']}, {message: token.getMessage}),
    user.forgotPassword, token.forgotPasswordToken
);

router.get('/checkToken/:token', token.checkToken);

router.put('/password/:type',
    parameters({body: ['password'], params: ['type']}, {message: token.getMessage}),
    user.updatePassword
);

router.delete('/logout/', token.expireToken);

router.get('/getMe', token.validateToken, token.getUser);

router.get('/fetchAll', token.validateToken, user.fetchAll);

router.get('/:userId', token.validateToken, user.fetch);

router.put('/:userId', token.validateToken, user.updateUser);

router.post('/upload', token.validateToken, user.uploadFile);

router.get('/fetchPaymentInfo/:user_id', user.fetchPaymentInfo)


module.exports = router;

