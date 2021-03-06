var express = require('express'),
    router = express.Router(),
    Elog = require('../models/Events.js');
    Chat = require('../models/Chats.js');

router.get('/api/eventlog', function(req, res, next) {
  Elog.find((err, results)=>{
      if(err) throw err;
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(results, null, 4));
  });
});

router.get('/', function (req, res) {
  res.render('index', { title: 'Express' });
  res.sendfile(__dirname + '/assets/index.html');
})

router.get("/api/history", (req, res) => {
  Chat.find({}, (err, results)=>{
    if(err) throw err;
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(results, null, 4));
  });
});

router.get("/api/main", (req, res) => {
  Chat.find({room: "Main room"}, (err, results)=>{
    if(err) throw err;
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(results, null, 4));
  });
});

router.get("/api/games", (req, res) => {
  Chat.find({room: "Gaming room"}, (err, results)=>{
    if(err) throw err;
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(results, null, 4));
  });
}); 

router.get("/api/political", (req, res) => {
  Chat.find({room: "Political room"}, (err, results)=>{
    if(err) throw err;
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(results, null, 4));
  });
});
module.exports = router;
