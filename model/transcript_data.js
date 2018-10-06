'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var transcriptDataSchame = new Schema({
    transcript_id: {
        type: Schema.Types.ObjectId,
        ref: 'Transcript'
    },
    transcript: {
        speaker: {type: Number},
        transcript: {type: String},
        nlu: {
            document: {
                score: {type: Number},
                label: {type: String}
            }
        },
        tone: []
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transcript_data', transcriptDataSchame);