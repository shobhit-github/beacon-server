const jwt = require('jsonwebtoken');
const encKey = 'shhhhh';
const User = require('./users').User;
const Transcript = require('./../model/transcript.js');
const Mail = require('../config/mail');
const {PATH} = require('../config');
const multer = require('multer');
const path = require("path");


function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

exports.getToken = function (req, res, next) {
    var token = jwt.sign(req.user, encKey);
    var user = {};
    user.token = token;
    user.name = req.user.name;
    user.email = req.user.email;
    user.role = req.user.role;
    user.company = req.user.company;
    user.language = req.user.language;
    user.keywords = req.user.keywords;
    user.image = req.user.image;
    user._id = req.user._id;
    res.status(200).jsonp({success: true, data: user, message: "User has been authenticated successfully"});
};

exports.forgotPasswordToken = function (req, res, next) {

    User.findOne({_id: req.user._id}).exec(function (err, user) {
        if (err) {
            res.status(401).jsonp({success: false, message: "There is an internal server error", err: err});
        } else {
            user.verifyToken = randomString(30);
            user.save();
            /************ Send email ************/
            const username = user.name,
                link = `${PATH.STAGING}reset-password/${user.verifyToken}`;

            const sendStr = Mail.formatHTML({fileName: 'forgotPassword.html', username, link});

            const emailData = {
                to: user.email,
                subject: Mail.subjects.forgetPassword,
                html: sendStr
            };

            Mail.sendMail(emailData, function (err, res) {
                if (err)
                    console.log('-----@@----- Error at sending mail to user -----@@-----', err);
                else
                    console.log('-----@@----- Response at sending mail to user -----@@-----', res);
            });
            /************ Send email ************/
            res.status(200).jsonp({success: true, message: "Email Sent. Check your email for instructions."});
        }
    })

};

exports.checkToken = function (req, res, next) {
    if (req.params.token) {
        User.findOne({verifyToken: req.params.token}).exec(function (err, user) {
            if (err) {
                res.status(401).jsonp({success: false, message: "There is an internal server error", err: err});
            } else {

                if (user) {
                    res.status(200).jsonp({success: true, "message": "Token valid successfully."});
                } else {
                    res.status(401).jsonp({success: false, "message": "Token has been expired."});
                }
            }
        });
    } else {
        res.status(401).jsonp({success: false, "message": "Token is required"});
    }
};

exports.getUser = function (req, res, next) {
    if (req.headers.authorization) {
        var token = req.headers.authorization;
        jwt.verify(token, encKey, function (err, decoded) {
            if (err) {
                res.status(401).jsonp({success: false, "message": err.message});
            } else {
                res.status(200).jsonp({success: true, "data": decoded["_doc"]});
            }
        });
    } else {
        res.status(401).jsonp({success: false, "message": "Token is required"});
    }
};

exports.validateToken = function (req, res, next) {
    if (req.headers.authorization) {
        var token = req.headers.authorization;
        jwt.verify(token, encKey, function (err, decoded) {
            if (err) {
                res.status(401).jsonp({success: false, "message": err.message});
            } else {
                req.user = decoded["_doc"];
                next();
            }
        });
    } else {
        res.status(401).jsonp({success: false, "message": "Token is required"});
    }
};


exports.validateParamToken = function (req, res, next) {
    if (req.params.userId) {
        jwt.verify(req.params.userId, encKey, function (err, decoded) {
            if (err) {
                res.status(401).jsonp({"msg": err});
            } else {
                User.findOne({_id: decoded["_doc"]._id}).exec(function (err, user) {
                    if (!err) {
                        req.user = user;
                        if (req.params.transcriptionsId) {
                            Transcript.findOne({_id: req.params.transcriptionsId}, {patient_id: true}).exec(function (err, trs) {
                                if (!err) {
                                    req.patient = trs.patient_id;
                                }
                                next();
                            })
                        } else {
                            next();
                        }
                    }
                })
            }
        });
    } else {
        res.status(401).jsonp({success: false, "message": "Token is required"});
    }
};

exports.expireToken = function (req, res, next) {
    if (req.headers.authorization) {
        let token = jwt.sign({
            exp: Math.floor(Date.now() / 1000)
        }, encKey);
        res.status(200).jsonp({success: true, "data": token});
    } else {
        res.status(401).jsonp({success: false, "message": "Token is required"});
    }
};

exports.getMessage = function (params) {
    return ({success: false, message: 'Missing params:- ' + params.join(', ')});
};

exports.audioUpload = function () {

    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, './uploads')
            },
            filename: function (req, file, callback) {
                callback(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}.webm`);
            }
        })
    }).single('audioBlob');
};