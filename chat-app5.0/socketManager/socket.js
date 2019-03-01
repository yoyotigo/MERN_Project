rooms = ['Main room', 'Gaming room', 'Political room'],
users = {},
fs = require('fs'),
User = require('../models/Users.js'),
Chat = require('../models/Chats.js'),
Sockio = require('../models/Sockets.js'),
Elog = require('../models/Events.js'),
module.exports = (io)=>{

    io.sockets.on('connection',function (socket) {
        //find exisiting chats in db, and emit to display
        Chat.find({}, function (err, docs) {
            if (err) throw err;
            socket.emit('load old msgs', docs);
        })
   
        socket.on('new user', function (data ,callback) { 
            //if a user exists in the dictionary, return an error message to client
            if (data in users){
                callback(false);
            }
            else {
                //if a new user exits, create one, store in dictionary
                callback(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                updateNicknames();
            //store in database
                var newUser = new User({username: data})
                newUser.save((err)=>{
                    if (err) throw err;
                console.log('\n==========STORE USER IN DATABASE==========\nUser: '+newUser.username+"\nSaved to database")
                })
            //stores new socket
                var newSock=new Sockio({socket_id:socket.id, createdBy:newUser.username})
                newSock.save((err)=>{
                    if (err) throw err;
                    console.log('\n==========STORE SOCKET IN DATABASE==========\nSocket: '+newSock.socket_id+"\nCreated by: "+ newSock.createdBy+"\nSaved to database at: "+ newSock.connectTime)
                })
            //store event
                var newEvent=new Elog({name:newUser.username, socket:socket.id})
                newEvent.save((err)=>{
                    if (err) throw err;
                    console.log('\n==========STORE EVENT IN DATABASE==========\nEvent created by: ' + newEvent.name + '\nFor Socket: '+newEvent.socket+'\nSaved to database at: '+ newEvent.connect)
                })
            //creates a txt file of the event
                fs.appendFile('./eventLog.txt', newSock.socket_id+" has been connected @ "+ newSock.connectTime +" and connected by "+ newSock.createdBy + "\n", {'flags': 'a'},(err)=>{
                    // console.log('EventLog:'+newSock.socket_id+"\nHas been connected @: "+ newSock.connectTime +"\nConnected by: "+ newSock.createdBy)
                    if (err) throw err;
                })

                socket.room = 'room1';
                // add the client's username to the global list
                // send client to room 1
                socket.join('room1');
                // echo to client they've connected
                // echo to room 1 that a person has connected to their room
                socket.emit('updatechat', 'CHAT BOT', 'you have connected to room1');

                socket.broadcast.to('room1').emit('updatechat', 'CHAT BOT', socket.nickname + ' has connected to this room');
                socket.emit('updaterooms', rooms, 'room1');
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
                var newMsg = new Chat({msg: msg, nick: socket.nickname})
                newMsg.save(function (err) {
                    if (err) throw err;
                    io.sockets.in(socket.room).emit('new message', {msg: msg, nick: socket.nickname})
                })
            }
        })

        socket.on('switchRoom', function(newroom){
            socket.leave(socket.room);
            socket.join(newroom);
            socket.emit('updatechat', 'CHAT BOT', 'you have connected to '+ newroom);
            // sent message to OLD room
            socket.broadcast.to(socket.room).emit('updatechat', 'CHAT BOT', socket.nickname+' has left this room');
            // update socket session room title
            socket.room = newroom;
            socket.broadcast.to(newroom).emit('updatechat', 'CHAT BOT', socket.nickname+' has joined this room');
            socket.emit('updaterooms', rooms, newroom);
        });

        socket.on('disconnect', function (data) {
        if (!socket.nickname) return;
        delete  users[socket.nickname];
            //io.sockets.emit('updateusers', usernames);
            // echo globally that this client has left
            Sockio.find({socket_id:socket.id},(err,socks)=>{
                if (err) throw err;
                socks.forEach((sock)=> { 
                    sock.disconnectTime=new Date();
                    sock.save((err)=>{
                        if (err) throw err;
                        console.log( "\n==========UPDATE SOCKET DISCONNECT IN DATABASE==========\nSocket_id: " + sock.socket_id + "\nNew disconnectTime: " + sock.disconnectTime + "\nSAVED" );
                    })
                    fs.appendFile('./eventLog.txt', sock.socket_id+" has been disconnected @ "+ sock.disconnectTime+" and disconnected by "+sock.createdBy+"\n", {'flags': 'a'}, (err)=>{
                        if (err) throw err;
                        //console.log('EventLog:'+sock.socket_id+"\nHas been disconnected @: "+ sock.disconnectTime+"\nDisconnected by: "+sock.createdBy)
                    })
                })
            })
            Elog.find({socket:socket.id},(err,events)=>{
                if (err) throw err;
                events.forEach((event)=>{
                    event.disconnect=new Date();
                    event.save((err)=>{
                        if (err) throw err;
                        console.log( "\n==========UPDATE EVENT DISCONNECT IN DATABASE==========\nSocket_id: " + event.socket + "\nNew disconnectTime: " + event.disconnect + "\nSAVED" );
                    })
                })
            })
         
            socket.broadcast.emit('updatechat', 'CHAT BOT', socket.nickname + ' has disconnected');
            socket.leave(socket.room);
            updateNicknames();
        });
    })
}