var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
	nick: String,
  msg: String,
  updated_at: { type: Date, default: Date.now },
  room: String
});

module.exports = mongoose.model('Messages', ProductSchema);
