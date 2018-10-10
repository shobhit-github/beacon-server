const mongoose = require('mongoose');
const md5 = require('md5');
const Schema = mongoose.Schema;
const multer = require('multer');
const async = require('async');
const chargeBee = require('chargebee');
const path = require('path');
const upload = multer({dest: 'public/uploads/therapist'});
const http = require('http');
const fs = require('fs');

const UserSubscription = require('./../model/user_subscriptions.js');

/* GET users listing. */
exports.User = User = mongoose.model('User', new Schema({
    name: String,
    email: String,
    image: {type: String, default: ""},
    company: {type: String, default: ""},
    role: {type: String, default: ""},
    password: String,
    language: {type: String, default: ""},
    keywords: [],
    verifyToken: String,
    socketId: []
}));


chargeBee.configure({
    site: "beaconbee-test",
    api_key: "test_CKjrMAncdnY1SJBnZQljBV3sEQQh1PYvH"
});

/************ encryptpassword password ******/
function encryptpassword(password) {
    return md5(password);
}

exports.login = function (req, res, next) {

    if (req.body.email && req.body.password) {
        User.findOne({email: req.body.email, password: encryptpassword(req.body.password)}).exec(function (err, user) {
            if (err) {
                res.status(401).jsonp({success: false, message: "There is an internal server error", err: err});
            } else if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).jsonp({success: false, message: "Please enter valid email and password"});
            }
        })
    } else {
        res.status(400).jsonp({success: false, message: "Please enter email and password both"});
    }
};

exports.forgotPassword = function (req, res, next) {

    if (req.body.email) {
        User.findOne({email: req.body.email}).exec(function (err, user) {
            if (err) {
                res.status(401).jsonp({success: false, message: "There is an internal server error", err: err});
            } else if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).jsonp({
                    success: false,
                    message: "An account doesn't exist with that email.Try again or Sign up below."
                });
            }
        })
    } else {
        res.status(400).jsonp({success: false, message: "Please enter email."});
    }
}

exports.register = function (req, res, next) {

    if (req.body.email && req.body.password && req.body.name) {
        User.findOne({email: req.body.email}).exec(function (err, user) {
            if (err) {
                res.status(401).jsonp({"msg": err});
            } else {
                if (user) {
                    return res.status(401).jsonp({success: false, message: "This user is already exist"});
                } else {

                    async.waterfall([

                        // saving user data
                        function (callback) {

                            User({
                                name: req.body.name,
                                email: req.body.email,
                                password: encryptpassword(req.body.password)
                            }).save(function (err, user) {
                                if (err)
                                    return callback(err, false);

                                return callback(null, user);
                            })

                        },
                        // these functions is temporary disabled
                        /*function (user, callback) {

                            //    ChargeBee Integration
                            //-------------------------------------

                            async.waterfall([

                                // creating new customer in chargebee
                                function (chargeBeeCallback) {

                                    chargeBee.customer.create({
                                        first_name: req.body.name, email: req.body.email
                                    })
                                        .request(function (error, chargeBeeCustomer) {

                                            if (err)
                                                return callback(err, false);

                                            return chargeBeeCallback(false, chargeBeeCustomer)
                                        });
                                },
                                function (response, chargeBeeCallback) {

                                    // updating card for the customer
                                    chargeBee.card.update_card_for_customer(response.customer.id, {
                                        gateway: "chargebee",
                                        first_name: response.customer.first_name,
                                        number: req.body.card_number,
                                        expiry_month: req.body.card_exp[0],
                                        expiry_year: req.body.card_exp[1],
                                        cvv: req.body.card_cvv
                                    }).request(function (error, result) {

                                        if (err)
                                            return callback(err, false);

                                        return chargeBeeCallback(false, response.customer)
                                    })
                                },
                                function (customer, chargeBeeCallback) {

                                    // creating subscription for the customer
                                    chargeBee.subscription.create_for_customer(customer.id, {
                                        plan_id: req.body.plan_type,
                                    }).request(function (error, result) {

                                        if (err)
                                            return callback(err, false);

                                        return chargeBeeCallback(false, result)
                                    })
                                }
                            ], function (err, subscriptionResult) {

                                if (err)
                                    return callback(err, false);

                                return callback(false, user, subscriptionResult)
                            })

                        },*/
                        // these functions is temporary disabled
                        /*function (user, subscription, callback) {

                            // saving the subscription data into the subscription folder
                            if (subscription && subscription.customer) {
                                userSubscription = new UserSubscription({
                                    user_id: user._id,
                                    chargebee_customer_id: subscription.customer.id,
                                    chargebee_subscription_id: subscription.subscription.id,
                                    chargebee_invoice_id: subscription.invoice.id,
                                    plan_type: req.body.plan_type === 'startup-plan-yr' ? 'yearly' : 'monthly'
                                });

                                userSubscription.save(function (err, subscribed) {
                                    if (err)
                                        return callback(err, false);

                                    return callback(null, user);
                                });
                            } else {
                                return callback("Error!", false);
                            }

                        }*/
                    ], function (err, result) {

                        if (err) {
                            User.remove({email: req.body.email}).exec(function (err2, res) {
                                if (err2) {
                                    return res.status(500).jsonp({
                                        success: false,
                                        message: "There is an internal server error! Please try again with valid values.",
                                        err: err2
                                    });
                                }
                                return res.status(500).jsonp({
                                    success: false,
                                    message: "There is an internal server error! Please try again with valid values.",
                                    err: err
                                });
                            });
                        }
                        return res.status(200).jsonp({
                            success: true,
                            message: "User has been registered successfully",
                            data: result
                        });
                    });

                }
            }
        })
    } else {

        return res.status(401).jsonp({success: false, message: "Inputs name and email are required"});
    }
}

exports.fetch = function (req, res, next) {
    User.findOne({_id: req.params.userId}).exec(function (err, user) {
        if (err) {
            res.status(401).jsonp({"msg": err});
        } else if (user) {
            res.status(200).jsonp({"data": user, "msg": ""});
        } else {
            res.status(401).jsonp({"msg": "User doesnt exists"});
        }
    })
}

exports.fetchAll = function (req, res, next) {
    User.find({}).exec(function (err, user) {
        if (err) {
            res.status(401).jsonp({"msg": err});
        } else if (user) {
            res.status(200).jsonp({"data": user, "msg": ""});
        } else {
            res.status(401).jsonp({"msg": "User doesnt exists"});
        }
    })
}

exports.update = function (user, socketId) {
    User.findOne({_id: user._id}).exec(function (err, user) {
        if (!err) {
            if (user.socketId) {
                if (typeof user.socketId === 'object') {
                    user.socketId.push(socketId);
                } else if (typeof user.socketId === 'string') {
                    delete user.socketId;
                    user.socketId = [];
                    user.socketId.push(socketId);
                } else {
                    user.socketId = [];
                    user.socketId.push(socketId);
                }
            } else {
                user.socketId = [];
                user.socketId.push(socketId);
            }
            user.save();
        }
    })
}

exports.updateUser = function (req, res) {
    if (req.body.password) {
        req.body.password = encryptpassword(req.body.password);
    }
    User.findOneAndUpdate({_id: req.params.userId}, req.body).exec(function (err, user) {
        if (err) {
            res.status(404).jsonp({success: false, message: "There is an internal server error", err: err});
        } else {
            if (user) {
                res.status(200).jsonp({success: true, message: "Profile updated successfully!"});
            }
        }
    });
}


exports.updatePassword = function (req, res) {
    if (req.params.type === 'reset') {
        User.findOne({verifyToken: req.body.token}).exec(function (err, user) {
            if (err) {
                res.status(401).jsonp({success: false, message: "There is an internal server error", err: err});
            } else {
                if (user) {
                    user.password = encryptpassword(req.body.password);
                    user.verifyToken = "";
                    user.save(function (err, data) {
                        if (err) {
                            res.status(401).jsonp({
                                success: false,
                                message: "There is an internal server error",
                                err: err
                            });
                        } else {
                            if (data) {
                                res.status(200).jsonp({success: true, message: "Reset password successfully!"});
                            }
                        }
                    });
                } else {
                    res.status(401).jsonp({success: false, message: "Token has been expired!"});
                }

            }
        });
    } else {
        User.findOne({_id: req.body._id}).exec(function (err, user) {
            if (!err) {
                user.password = encryptpassword(req.body.password);
                user.save(function (err, data) {
                    if (err) {
                        res.status(401).jsonp({success: false, message: "There is an internal server error", err: err});
                    } else {
                        if (data) {
                            res.status(200).jsonp({success: true, message: "Password successfully updated!"});
                        }
                    }
                });
            } else {
                res.status(401).jsonp({success: false, message: "There is an internal server error", err: err});
            }
        });
    }

}

exports.delete = function (req, res) {
    User.remove({_id: req.params.userId}).exec(function (err, user) {
        if (!err) {
            res.send({msg: user});
        }
    })
}


exports.uploadFile = function (req, res) {
    var file_path;
    var mime_type;
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './public/uploads/therapist')
        },
        filename: function (req, file, callback) {
            var file_name = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
            callback(null, file_name)
            res.status(200).jsonp({
                "msg": "success",
                "file_name": file_name
            });
        }
    })
    var upload = multer({
        storage: storage
    }).single('file')
    upload(req, res, function (err) {
    })
}

exports.fetchPaymentInfo = function (req, res) {
    UserSubscription.findOne({user_id: req.params.user_id}).exec(function (err, paymentInfo) {
        if (!err) {
            if (paymentInfo) {
                res.status(200).jsonp({"success": true, data: paymentInfo});
            } else {
                res.status(404).jsonp({"success": false, msg: "Transcript not found"})
            }
        } else {
            res.status(404).jsonp({"success": false, msg: err})
        }
    })
};



