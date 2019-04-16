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

router.get('/api/room/:id', function(req,results,next){
  Rooms.findById((err,res)=>{
    if(err) throw err;
    res.send(JSON.stringify(results,null,4))
  });
});

/* SAVE ROOMS */

router.post("/api/room", (req,res)=>{
  var data = new Rooms(req.body);
  data.save()
  .then(
    res.redirect('/')
  )
});


router.put('api/room/:id', function(req,res){
  Rooms.findByIdAndUpdate(req.params.id,
    {
      room: req.body.room,
      status: req.body.status
    },
    function(err,response){
      if(err){
        res.send(err);
      }else{
        console.log(response, 'room updated!')
      }
    });
});



/*router.get("/api/room/edit/:id", (req,res)=>{
  Rooms.findByIdAndUpdate({_id:req.params.id})
  .where(room).equals(req.body.room)
  .exec(function(err,roomRecord){
    if(roomRecord){
      roomRecord.room = req.body.room;
      roomRecord.status = req.body.status;
      roomRecord.save();
      console.log('room/:id edit successful')
    }else{
      console.log('POST room/:id err'+err);
    }
  })
})*/
/* EDIT ROOMS *//*
router.post("/api/room/:id", function(req,res){
  Rooms.findOne({})
  .where('_id').equals(req.body.id)
  .exec(function(err, roomRecord){

    if(roomRecord){
      roomRecord.room = req.body.room;
      roomRecord.status = req.body.status;
      roomRecord.save();
      console.log('room/:id edit successful')
    }else{
      console.log('POST room/:id err');
    }
   res.redirect('/')
  });
});*/

module.exports = router;
