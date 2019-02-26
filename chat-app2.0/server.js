var express = require("express")
var router = express.Router();
var mongoose = require("mongoose")
var bodyParser = require("body-parser")
var app = express()
var http = require("http").Server(app)
var io = require("socket.io")(http)
var fs = require('fs');
var options = {stream: fs.createWriteStream('events.log',{flags:'a'}) };
var logger = require('socket.io-logger')(options);
io.use(logger);

var conString = "mongodb://admin:password123@ds149365.mlab.com:49365/chat-app"
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.Promise = Promise



//MONGOOSE MODELS/SCHEMAS
var Chats = mongoose.model("Chats", {
    name: String,
    chat: String,
    date: Date
})
var mainSchema = new mongoose.Schema
({
    chat: String,
    roomName: { type: String, default: 'main chat' },
    timestamp: Date,
    username: String
})
var mainChat = mongoose.model("mainChat", mainSchema);
var Sockets = mongoose.model("Sockets",{
    socket_id:String,
    date:Date
})
var nameSchema = new mongoose.Schema
({
    username: String
})
var User = mongoose.model("User", nameSchema);
var userHistory = mongoose.model("userHistory",
{
    joinedDate: Date,
    messages: String,
    leftDate: Date
})

mongoose.connect(conString, { useMongoClient: true }, (err) => {
    console.log("Database connection", err)
})



//Post username to database
app.post("/addname", (req,res)=>
{
    var myData = new User(req.body);
    myData.save()
    .then(item => {
    res.redirect("/main.html");
})
    .catch(err => {
    res.status(400).send("unable to save to database");
});
});

//Get users
app.get("/addname", (req,res)=>
{
    User.find({}, function(err,users)
    {
        if(err)
        {
            res.send('something went wrong')
        }
        res.json(users);
        //res.render('main.html', {username: req.users.username});
    })
})

router.get('/addname', (req,res)=>
{
    User.find(function(err,users,res)
    {
        if(err) return res.sendStatus(500);
        res.render('main.html',{userList:users});
    })
})

//Post chats to /api/history
app.post("/api/history", async (req, res) => {
    try {
        var chat = new Chats(req.body)
        await chat.save()
        res.sendStatus(200)
        //Emit the event
        io.emit("chat", req.body)
    } catch (error) {
        res.sendStatus(500)
        console.error(error)
    }
})

//Post main chat to /api/history/main
app.post("/mainchat", (req,res)=>
{
    try{
    var chat = new mainChat(req.body);
    chat.save() 
    //save username
    //save timestamp
    //save roomname
    //res.redirect("main.html")
    io.emit("chat", req.body)
    } catch(error)
    {
        res.sendStatus(500)
        console.error(error)
    }
});

//Get all chat history 
app.get("/api/history", (req, res) => {
    Chats.find({}, (error, chats) => {
        res.json(chats)
    })
})

//Get chat history from main chat 
app.get("/api/history/mainchat", (req, res) => {
    Chats.find({}, (error, chats) => {
        res.json(chats)
    })
})

//Get chat history from gaming chat 
app.get("/api/history/games", (req, res) => {
    Chats.find({}, (error, chats) => {
        res.json(chats)
    })
})

//Get chat history from political chat
app.get("/api/history/politics", (req, res) => {
    Chats.find({}, (error, chats) => {
        res.json(chats)
    })
})


//Post sockets
app.post("/api/sockets", async (req, res) => {
    try {
        var sock = new Sockets(req.body)
        await sock.save()
        res.sendStatus(200)
        //Emit the event
        io.emit("sock",req.body)
    } catch (error) {
        res.sendStatus(500)
        console.error(error)
    }
})

//Get socket history in JSON format
app.get("/api/sockets", (req,res)=>
{
    Sockets.find({}, (error,sockets)=>
    {
        res.json(sockets)
    })
})




////socket connections
var clients = 0;
io.on('connection', (socket)=> {
console.log("Socket is connected...")
   io.sockets.emit('broadcast',{ description: 'Welcome new user!'});
   socket.on('disconnect', ()=> {
      io.sockets.emit('broadcast',{ description: 'Goodbye User!'});
   });
});




var server = http.listen(3020, () => {
    console.log("Well done, now I am listening on ", server.address().port)
})


//test
