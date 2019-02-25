var express = require("express")
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

//MONGOOSE MODELS
var Chats = mongoose.model("Chats", {
    name: String,
    chat: String,
    date: Date
})
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


//Post username 
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

//Get chat history in JSON format
app.get("/api/history", (req, res) => {
    Chats.find({}, (error, chats) => {
        res.json(chats)
    })
})

//Get socket history in JSON format
app.get("/api/sockets", (req,res)=>
{
    Sockets.find({}, (error,sockets)=>
    {
        res.json(sockets)
    })
})

//Get chat history from room name 
app.get("/api/history/roomname", (req, res) => {
    Chats.find({}, (error, chats) => {
        res.json(chats)
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



//test code
