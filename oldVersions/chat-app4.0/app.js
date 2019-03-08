var express = require('express'),
    app = express(),
    path = require('path'); //built in path module, used to resolve paths of relative files
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('mongoose'),
 bodyParser = require('body-parser'),
    users = {};
server.listen(5000);

mongoose.connect('mongodb://admin:password123@ds349455.mlab.com:49455/testt',{ useNewUrlParser: true }, (err)=> {
    if (err){
        console.log(err);
    }else {
        console.log('Connected to Database')
    }
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/messages', require('./routes/messages'));

var chatSchema = mongoose.Schema({

    nick: String,
    msg: String,
    created: {type: Date, default: Date.now},
    room: String
})
var Chat = mongoose.model('Message', chatSchema);

app.use(express.static(path.join(__dirname + '/assets')));
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/assets/index.html');
})
var user = new mongoose.Schema
      ({
          username: String,
          creationDate: {type:Date, default:Date}
      })
var User = mongoose.model("User", user);
var socket = new mongoose.Schema
      ({
          scoket_id: String,
          connectTime: {type:Date, default:Date},
          createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
          disConnectTime: {type:Date, default:Date},
      })
var User = mongoose.model("User", user);


var rooms = ['Main room', 'Gaming room', 'Political room'];


io.sockets.on('connection',function (socket) {



    Chat.find({}, function (err, docs) {
        if (err) throw err;
        socket.emit('load old msgs', docs);
    })
    socket.on('new user', function (data ,callback) {
        if (data in users){
            callback(false);
        }
        else {
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
            updateNicknames();
            var newUser = new User({username: data})
            newUser.save((err)=>{
                if (err) throw err;
              console.log('User: '+newUser.username+" saved to database")
            })
                


            socket.room = 'Main room';
            // add the client's username to the global list
            // send client to room 1
            socket.join('Main room');
            // echo to client they've connected
            // echo to room 1 that a person has connected to their room
            socket.emit('updatechat', 'SERVER', 'you have connected to Main room');

            socket.broadcast.to('Main room').emit('updatechat', 'SERVER', socket.nickname + ' has connected to this room');
            socket.emit('updaterooms', rooms, 'Main room');
        }
        // send client to room 1

    })

    function updateNicknames() {
        io.sockets.emit('usernames', Object.keys(users));
    }



    //creating a chat room
    socket.on('create', function(room) {
        rooms.push(room);
        socket.emit('updaterooms', rooms, socket.room);
    });

    socket.on('switchRoom', function(newroom){
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
        // sent message to OLD room
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.nickname+' has left this room');
        // update socket session room title
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.nickname+' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });
    


    socket.on('send message', function (data, callback) {
        var msg = data.trim();
        if(msg.substr(0,3) === '/w '){
            msg = msg.substr(3);
            var ind = msg.indexOf(' ');
            if(ind !== -1) {
                var name = msg.substring(0, ind);
                var msg  = msg.substring(ind+1);

                if(name in users){
                    users[name].emit('whisper', {msg: msg ,nick: socket.nickname});
                    console.log('Private Message!');
                }else {
                    callback('Error! Enter a valid user');
                }
                console.log('Whisper');
            }else {
                callback('Error! Please enter a message for your whisper');
            }
        }
        else {
            var newMsg = new Chat({msg: msg, nick: socket.nickname, room: socket.room})
            newMsg.save(function (err) {
                if (err) throw err;
                io.sockets.in(socket.room).emit('new message', {msg: msg, nick: socket.nickname, room: socket.room})
            })
        }
    })

    app.get("/api/history", (req, res) => {
        Chat.find({}, (error, chats) => {
            res.json(chats)
        })
    })

    app.get("/api/main", (req, res) => {
        Chat.find({room: "Main room"}, (error, chats) => {
            res.json(chats)
        })
    })

    app.get("/api/games", (req, res) => {
        Chat.find({room: "Gaming room"}, (error, chats) => {
            res.json(chats)
        })
    })

    app.get("/api/political", (req, res) => {
        Chat.find({room: "Political room"}, (error, chats) => {
            res.json(chats)
        })
    })


    


    socket.on('disconnect', function (data) {
       if (!socket.nickname) return;
       delete  users[socket.nickname];
        //io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.nickname + ' has disconnected');
        socket.leave(socket.room);

        updateNicknames();
    });
})
