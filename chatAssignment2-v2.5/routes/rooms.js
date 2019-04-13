var express = require('express');
var router = express.Router();
var Rooms = require('../models/Rooms');
var bodyParser = require('body-parser');

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}));



/* GET ALL ROOMS */
router.get('/api/room', function(req, res, next) {
  Rooms.find((err, results)=>{
    if(err) throw err;
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(results, null, 4));
  });
}); 

/* SAVE ROOMS */

router.post("/api/room", (req,res)=>{
  var data = new Rooms(req.body);
  console.log(data);
  data.save()
    .then(item=>{
      res.redirect('/admin');
    })
    .catch(err=>{
      res.status(400).send("unable to save to db")
    });
});


/*router.post('/api/room', function(req, res, next) {
  Rooms.create(req.body, function (err, chat) {
    if (err) return next(err);
    res.json(chat);
  });
});*/

module.exports = router;
