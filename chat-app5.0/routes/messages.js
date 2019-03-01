var express = require('express');
var router = express.Router();
var Message = require('../models/Messages.js');

/* GET ALL MESSAGES */
router.get('/api/history', function(req, res, next) {
  Message.find(function (err, messages) {
    if (err) return next(err);
    res.json(messages);
  });
});

/* SAVE MESSAGES */
router.post('/api/history', function(req, res, next) {
  Message.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
