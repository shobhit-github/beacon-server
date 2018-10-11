'use strict';

const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const documentHistorySchema = new Schema({

    title: {type: String, required: true},

    markers: {type: Array},

    user: {type: Schema.Types.ObjectId, ref: 'User'},

    notes: {type: String},

    interview: {type: Schema.Types.ObjectId, ref: 'Interview'},

    type: {type: Number}, // 1 => interview, 2 => doc, 3 => excel

}, {timestamps: {createdAt: "created_at"}});


module.exports = mongoose.model('DocumentHistory', documentHistorySchema, 'document_histories');


