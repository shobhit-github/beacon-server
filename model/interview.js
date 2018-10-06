const mongoose = require('mongoose')
    , Schema = mongoose.Schema;

/**      Interview Schema
 ---------------------------------*/
var InterviewSchema = new Schema({

    title: {type: String, required: true, default: "Untitled Document"},

    markers: {type: Array},

    blob_str: {type: String, default: ""},

    user: {type: Schema.Types.ObjectId, ref: 'User'},

    media_length: {type: Number, default: null}, //Length of the media in secs

    drive_path: {type: String, default: ""},

    status: {type: Number, default: 0},

    notes: {type: String, default: null},

    type: {type: Number, default: 1}, // 1 => interview, 2 => doc, 3 => excel

}, {timestamps: {createdAt: "created_at", updatedAt: "updated_at"}});

/**      User Models
 ---------------------------------*/
InterviewSchema.statics = {

    /**
     * User By ID - fetching the data through the user's id
     */
    findById: function (id, callback) {
        return this.findOne({_id: id}, callback);
    },


};

InterviewSchema.pre('save', function (next) {
    next();
});


module.exports = mongoose.model('Interview', InterviewSchema);