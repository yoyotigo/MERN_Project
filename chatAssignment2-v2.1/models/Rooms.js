var mongoose = require('mongoose');
var room = new mongoose.Schema({
    room: String,
    created: {type:Date, default:Date},
    edited: {type:Date, default:Date},
    status: String
})
module.exports = mongoose.model("Room", room);