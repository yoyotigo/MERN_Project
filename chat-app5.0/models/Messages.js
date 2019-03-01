var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
	nick: String,
    msg: String,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Messages', MessageSchema);
