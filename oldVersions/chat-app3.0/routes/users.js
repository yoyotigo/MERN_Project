var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//SAVE USERS
router.post("/", (req,res)=>{
  User.create(req.body, (err, post)=> {
      if (err) return next("unable to save to database");
      console.log('User: '+myData.username+" saved to database")
      res.json(post);
  });
})

module.exports = router;
