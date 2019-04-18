var express = require('express');
var router = express.Router();
var Rooms = require('../models/Rooms');

/* GET ALL ROOMS */
router.get('/api/room', function(req, res, next) {
  Rooms.find((err, results)=>{
    if(err) throw err;
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(results, null, 4));
  });
}); 

/* SAVE ROOMS */
router.post('/api/room', function(req, res, next) {

  Rooms.create(req.body, function (err, chat) {
    console.log("chat:====================", chat)
    if (err) return next(err);
    res.json(chat);
  });
});

module.exports = router;
