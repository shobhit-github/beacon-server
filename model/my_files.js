const mongoose = require('mongoose')
    , Schema = mongoose.Schema;

/**      Interview Schema
 ---------------------------------*/
var My_filesSchema = new Schema({
    interview_id: {type: Schema.Types.ObjectId, ref: 'Interview'},
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
    drive_id: {type: String, default: ""},
    status: {type: Number, default: 1},
    type: {type: Number, default: 1},
}, {timestamps: {createdAt: "created_at", updatedAt: "updated_at"}});

/**      User Models
 ---------------------------------*/
My_filesSchema.statics = {
    /**
     * User By ID - fetching the data through the user's id
     */
    findById: function (id, callback) {
        return this.findOne({_id: id}, callback);
    },


};

My_filesSchema.pre('save', function (next) {
    next();
});


module.exports = mongoose.model('My_files', My_filesSchema);