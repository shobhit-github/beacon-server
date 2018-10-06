const mongoose = require('mongoose')
    , Schema = mongoose.Schema;

/**      Interview Schema
 ---------------------------------*/
const UserSubscriptionSchema = new Schema({

    chargebee_customer_id: {type: String, required: true},

    chargebee_subscription_id: {type: String, required: true},

    chargebee_invoice_id: {type: String, required: true},

    user_id: {type: Schema.Types.ObjectId, ref: 'User', required: true},

    plan_type: {type: String, required: true}

    //datetime: { created_at: { type: Date, default: Date.now }, updated_at: { type: Date, default: Date.now } }

}, {timestamps: {createdAt: "created_at", updatedAt: "updated_at"}}, {collection_name: 'user_subscriptions'});

/**      User Models
 ---------------------------------*/
UserSubscriptionSchema.statics = {

    /**
     * User By ID - fetching the data through the user's id
     */
    findById: function (id, callback) {
        return this.findOne({_id: id}, callback);
    },


};

UserSubscriptionSchema.pre('save', function (next) {
    next();
});


module.exports = mongoose.model('UserSubscription', UserSubscriptionSchema, 'user_subscriptions');