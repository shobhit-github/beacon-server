const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const watson = require('watson-developer-cloud');
const vcapServices = require('vcap_services');

const Recommendation = mongoose.model('Recommendation', new Schema({
    name: String,
    tags: [],
    factor: Number,
    type: Number /*0 Recommendations,1 Danger*/
}));

//var PatientRecomendation = require('./../model/patient_recommendation');
const Transcript = require('./../model/transcript');

exports.fetch = function (req, res, next) {
    Recommendation.find({type: req.params.type}).exec(function (err, recommendations) {
        if (err) {
            res.status(404).jsonp({"msg": err});
        } else if (recommendations) {
            res.status(200).jsonp({"data": recommendations, "msg": ""});
        } else {
            res.status(404).jsonp({"msg": (req.params.type === 1 ? "Recommendations" : "Danger Harms") + " not found"});
        }
    });
};

exports.save = function (req, res, next) {
    const recommendation = {};
    const query = {};
    if (req.body.tags) {
        recommendation.tags = [];
        recommendation.tags = req.body.tags;
    }
    if (req.body.name)
        recommendation.name = req.body.name;
    if (req.body.factor)
        recommendation.factor = req.body.factor;
    if (req.body.type)
        recommendation.type = req.body.type;
    if (req.body.id) {
        query['_id'] = req.body.id
    }
    if (recommendation) {
        if (query["_id"]) {
            Recommendation.update(query, {$set: recommendation}).exec(function (err, rec) {
                if (err) {
                    res.status(404).jsonp({"msg": err});
                } else {
                    res.status(200).jsonp({"data": rec});
                }
            })
        } else {
            Recommendation(recommendation).save(function (err, rec) {
                if (err) {
                    res.status(404).jsonp({"msg": err});
                } else {
                    res.status(200).jsonp({"data": rec});
                }
            })
        }
    } else {
        if (query["_id"]) {
            res.status(404).jsonp({"msg": "Either type or tags or name is/are required to update the record"});
        } else {
            res.status(404).jsonp({"msg": "type, name and Tags are required"});
        }
    }
};

const transcript = '';


const sttAuthService = new watson.AuthorizationV1(
    Object.assign(
        {
            username: "69b171a5-3727-435c-8284-53ad30e9c281",
            password: "oC05nCtWB23E"
        },
        vcapServices.getCredentials('speech_to_text') // pulls credentials from environment in bluemix, otherwise returns {}
    )
);

exports.getToken = function (req, res) {
    sttAuthService.getToken(
        {
            url: watson.SpeechToTextV1.URL
        },
        function (err, token) {
            if (err) {
                return res.status(500).send('Error retrieving token');
            }
            return res.jsonp({token: token});
        }
    );
}


