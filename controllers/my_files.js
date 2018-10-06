var mongoose = require('mongoose');
var path = require('path');
var My_files = require('./../model/my_files.js');


exports.save = function (req, res) {

    var filesObject = {
        user_id: req..body.user._id,
        drive_id: req.body.drive_id
    };

    My_files(filesObject).save(function (err, resp) {
        if (err) {
            res.status(401).jsonp({success: false, message: err});
        } else {
            if (resp) {
                res.status(200).jsonp({success: true, data: resp});
            }
        }
    })

};