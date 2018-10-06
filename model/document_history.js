'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var transcriptSchame = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    document_id: {
        type: Schema.Types.ObjectId,
        ref: "Interview"
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Document_history', transcriptSchame);