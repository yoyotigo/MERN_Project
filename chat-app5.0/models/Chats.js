var mongoose = require('mongoose');
var chatSchema = mongoose.Schema({
    nick: String,
    msg: String,
    group:String,
    created: {type:Date, default:Date}
})
module.exports = mongoose.model('Message', chatSchema);