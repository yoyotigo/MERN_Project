var mongoose = require('mongoose');
var EventLog = new mongoose.Schema({
    name: String,
    socket: String,
    connect: {type:Date, default:Date},
    disconnect: {type:Date, default:null}
});
module.exports = mongoose.model('EventLog', EventLog);