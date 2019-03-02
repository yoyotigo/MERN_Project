var rooms = ['Main room', 'Gaming room', 'Political room'],
    users = {},
    fs = require('fs'),
    User = require('../models/Users.js'),
    Chat = require('../models/Chats.js'),
    Sockio = require('../models/Sockets.js'),
    Elog = require('../models/Events.js')

module.exports = (io)=>{
    io.sockets.on('connection',function (socket) {
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
                    if (err) throw err;
                })
                socket.room = 'Main room';
            // add the users's username to the global list
            // send user to Main room
                socket.join('Main room');
            // echo to user they've connected
            // echo to Main room that another user has connected to their room
                socket.emit('updatechat', 'CHAT BOT NINJA SAYS', 'you have connected to Main room');
                socket.broadcast.to('Main room').emit('updatechat', 'CHAT BOT NINJA SAYS', socket.nickname + ' has connected to this room');
                socket.emit('updaterooms', rooms, 'Main room');
        }
    })

        function updateNicknames() {
            io.sockets.emit('usernames', Object.keys(users));
        }
        //save messages to the database
        socket.on('send message', function (data) {
            var msg = data.trim();
            var newMsg = new Chat({msg: msg, nick: socket.nickname, room: socket.room})
            newMsg.save(function (err) {
                if (err) throw err;
                console.log('\n==========STORE MESSAGE IN DATABASE==========\nMessage: '+msg+'\nSent by: ' + socket.nickname + '\nIn Room: '+socket.room)
                io.sockets.in(socket.room).emit('new message', {msg: msg, nick: socket.nickname, room: socket.room})
            })
        })
        //handle the switching of rooms
        socket.on('switchRoom', function(newroom){
            socket.leave(socket.room);
            socket.join(newroom);
            socket.emit('updatechat', 'CHAT BOT NINJA SAYS', 'you have connected to '+ newroom);
            // sent message to old room
            socket.broadcast.to(socket.room).emit('updatechat', 'CHAT BOT NINJA SAYS', socket.nickname+' has left this room');
            // update socket session room title
            socket.room = newroom;
            //let users know new user has joined the room
            socket.broadcast.to(newroom).emit('updatechat', 'CHAT BOT NINJA SAYS', socket.nickname+' has joined this room');
            socket.emit('updaterooms', rooms, newroom);
        });

        //when a user disconnects
        socket.on('disconnect', function (data) {
        if (!socket.nickname) return;
        //remove username from dictionary to allow its reuse
        delete  users[socket.nickname];
            Sockio.find({socket_id:socket.id},(err,socks)=>{
                if (err) throw err;
                //update disconnect time for socket in database 
                socks.forEach((sock)=> { 
                    sock.disconnectTime=new Date();
                    //save the update
                    sock.save((err)=>{
                        if (err) throw err;
                        console.log( "\n==========UPDATE SOCKET DISCONNECT IN DATABASE==========\nSocket_id: " + sock.socket_id + "\nNew disconnectTime: " + sock.disconnectTime + "\nSAVED" );
                    })
                    //save update to txt file
                    fs.appendFile('./eventLog.txt', sock.socket_id+" has been disconnected @ "+ sock.disconnectTime+" and disconnected by "+sock.createdBy+"\n", {'flags': 'a'}, (err)=>{
                        if (err) throw err;
                     })
                })
            })
            //update the eventlog for specific socket in database
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
            //;et other users in the room know user has disconnected
            socket.broadcast.emit('updatechat', 'CHAT BOT NINJA SAYS', socket.nickname + ' has disconnected');
            socket.leave(socket.room);
            updateNicknames();
        });
    })
}