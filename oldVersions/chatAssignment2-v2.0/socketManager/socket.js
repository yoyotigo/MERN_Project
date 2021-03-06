var rooms = ['Main room', 'Gaming room', 'Political room'],
    connectedUsers = { },
    fs = require('fs'),
    User = require('../models/Users.js'),
    Chat = require('../models/Chats.js'),
    Sockio = require('../models/Sockets.js'),
    Elog = require('../models/Events.js'),
    Private = require('../models/PrivateChats.js')

module.exports = (io)=>{
    io.sockets.on('connection', (socket)=> {
    //store event
        var connectEvent=new Elog({type:'CONNECTION', socket:socket.id, room:'Main Room'})
        connectEvent.save((err)=>{
                if (err) throw err;
                     console.log('\n==========STORE EVENT IN DATABASE==========\nSocket: '+connectEvent.socket+'\nWith type: '+connectEvent.type+"\nHas been connected @: "+ connectEvent.connect +'\nIn the: '+connectEvent.room+'\nSaved to database at: '+ connectEvent.connect)
            })
    
    //Verify Username
	socket.on('VERIFY_USER', (nickname, callback)=>{
		if(isUser(connectedUsers, nickname)){
			callback({ isUser:true, user:null })
		}else{
			callback({ isUser:false, user:createUser({name:nickname, socketId:socket.id})})
		}
	})
    //User Connects with username
	socket.on('USER_CONNECTED', (user)=>{
		user.socketId = socket.id
		connectedUsers = addUser(connectedUsers, user)
		socket.user = user

		//sendMessageToChatFromUser = sendMessageToChat(user.name)
		sendTypingFromUser = sendTypingToChat(user.name)
		var newUser = new User({username: user.name})
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
        var newUserEvent=new Elog({type:'NEW USER',name:newUser.username, socket:socket.id, room:'Main Room'})
        newUserEvent.save((err)=>{
            if (err) throw err;
            console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+newUserEvent.type+'\nCreated by: ' + newUserEvent.name + '\nFor Socket: '+newUserEvent.socket+'\nIn the: '+newUserEvent.room+'\nSaved to database at: '+ newUserEvent.connect)
        })
		io.emit('USER_CONNECTED', user.name)

    })
    //User logsout
	socket.on('LOGOUT', ()=>{
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
            })
        })
		connectedUsers = removeUser(connectedUsers, socket.user.name)
		io.emit('USER_DISCONNECTED', connectedUsers)
		console.log("Disconnect", connectedUsers);
		var disconnectEvent=new Elog({type:'LOGOUT', disconnect: new Date(), name:socket.user.name, socket:socket.id})
        disconnectEvent.save((err)=>{
            if (err) throw err;
            console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+disconnectEvent.type+'\nCreated by: ' + disconnectEvent.name + '\nFor Socket: '+disconnectEvent.socket+'\nSaved to database at: '+ disconnectEvent.disconnect)
        })
    })
    //User disconnects
	socket.on('disconnect', ()=>{
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
            })
        })
		if("user" in socket){
			
			connectedUsers = removeUser(connectedUsers, socket.user.name)
			var disconnectEvent=new Elog({type:'DISCONNECT', disconnect: new Date(), name:socket.user.name, socket:socket.id})
            disconnectEvent.save((err)=>{
                if (err) throw err;
                console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+disconnectEvent.type+'\nCreated by: ' + disconnectEvent.name + '\nFor Socket: '+disconnectEvent.socket+'\nSaved to database at: '+ disconnectEvent.disconnect)
            })
			io.emit('USER_DISCONNECTED', connectedUsers)
		}
    })
    
    socket.on('SEND_MESSAGE', (data)=>{
        console.log(data)
        //store new message event
            var newMessageEvent=new Elog({type:'MESSAGE SENT', name:data['author'], socket:socket.id, room:data['room']})
            newMessageEvent.save((err)=>{
                if (err) throw err;
                    console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+newMessageEvent.type+'\nCreated by: ' + newMessageEvent.name + '\nFor Socket: '+newMessageEvent.socket+'\nIn the: '+newMessageEvent.room+'\nSaved to database at: '+ newMessageEvent.connect)
            })
        //var msg = data.trim();
            var newMsg = new Chat({msg: data['message'], nick: data['author'], room: data['room']})
            newMsg.save( (err) =>{
                if (err) throw err;
                console.log('\n==========STORE MESSAGE IN DATABASE==========\nMessage: '+newMsg.msg+'\nSent by: ' + newMsg.nick + '\nIn Room: '+newMsg.room)
                io.sockets.in(socket.room).emit('NEW_MESSAGE', {msg: data['message'], nick: data['author'], room: newMessageEvent.room})
            })
            io.emit('RECEIVE_MESSAGE', data)
        })
})

const uuidv4 = require('uuid/v4')

/*
*	createUser
*	Creates a user.
*	@prop id {string}
*	@prop name {string}
*	@param {object} 
*		name {string}
*/
const createUser = ({name = "", socketId = null } = {})=>(
	{
		id:uuidv4(),
		name,
		socketId
		
	}
)
/*
* Returns a function that will take a chat id and a boolean isTyping
* and then emit a broadcast to the chat id that the sender is typing
* @param sender {string} username of sender
* @return function(chatId, message)
*/
function sendTypingToChat(user){
	return (chatId, isTyping)=>{
		io.emit(`${TYPING}-${chatId}`, {user, isTyping})
	}
}

/*
* Adds user to list passed in.
* @param userList {Object} Object with key value pairs of users
* @param user {User} the user to added to the list.
* @return userList {Object} Object with key value pairs of Users
*/
function addUser(userList, user){
	let newList = Object.assign({}, userList)
	newList[user.name] = user
	return newList
}

/*
* Removes user from the list passed in.
* @param userList {Object} Object with key value pairs of Users
* @param username {string} name of user to be removed
* @return userList {Object} Object with key value pairs of Users
*/
function removeUser(userList, username){
	let newList = Object.assign({}, userList)
	delete newList[username]
	return newList
}

/*
* Checks if the user is in list passed in.
* @param userList {Object} Object with key value pairs of Users
* @param username {String}
* @return userList {Object} Object with key value pairs of Users
*/
function isUser(userList, username){
  	return username in userList
}
}
        /*updateChatC={author:'CHAT BOT NINJA SAYS', message:'A new user has connected to Main Chat'}           
        io.emit('UPDATE_CHAT', updateChatC);
         socket.on('NEW_USER',  (data ,callback) =>{ 
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
                console.log()
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
                var newUserEvent=new Elog({type:'NEW USER',name:newUser.username, socket:socket.id, room:'Main Room'})
                newUserEvent.save((err)=>{
                    if (err) throw err;
                    console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+newUserEvent.type+'\nCreated by: ' + newUserEvent.name + '\nFor Socket: '+newUserEvent.socket+'\nIn the: '+newUserEvent.room+'\nSaved to database at: '+ newUserEvent.connect)
                })
            //creates a txt file of the event
                fs.appendFile('./eventLog.txt', newUserEvent.socket+" has been created @ "+ newUserEvent.connect +" and created by "+ newUserEvent.name +' in the '+newUserEvent.room+"\n", {'flags': 'a'},(err)=>{
                    if (err) throw err;
                })
//////////////////////////
            
            // add the users's username to the global list
            // send user to Main room
             /*      socket.join('Main room');
            // echo to user they've connected
            // echo to Main room that another user has connected to their room
            
            //io.broadcast.to('Main room').emit('UPDATE_CHAT', 'CHAT BOT NINJA SAYS', socket.nickname + ' has connected to this room');
            //socket.emit('updaterooms', rooms, 'Main room');
            }
    })

        const updateNicknames=()=> {
            io.sockets.emit('usernames', Object.keys(users));
        }
    
        socket.on('SEND_MESSAGE', (data)=>{
        //store new message event
            var newMessageEvent=new Elog({type:'MESSAGE SENT', name:socket.nickname, socket:socket.id, room:data['room']})
            newMessageEvent.save((err)=>{
                if (err) throw err;
                    console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+newMessageEvent.type+'\nCreated by: ' + newMessageEvent.name + '\nFor Socket: '+newMessageEvent.socket+'\nIn the: '+newMessageEvent.room+'\nSaved to database at: '+ newMessageEvent.connect)
            })
        //creates a txt file of the event
            fs.appendFile('./eventLog.txt', newMessageEvent.socket+" has sent a new message @ "+ newMessageEvent.connect +" and created by "+ newMessageEvent.name +' in the '+newMessageEvent.room+"\n", {'flags': 'a'},(err)=>{
                if (err) throw err;
            })
        //var msg = data.trim();
            var newMsg = new Chat({msg: data['message'], nick: socket.nickname, room: data['room']})
            newMsg.save( (err) =>{
                if (err) throw err;
                console.log('\n==========STORE MESSAGE IN DATABASE==========\nMessage: '+data['message']+'\nSent by: ' + socket.nickname + '\nIn Room: '+newMessageEvent.room)
                io.sockets.in(socket.room).emit('NEW_MESSAGE', {msg: data['message'], nick: socket.nickname, room: newMessageEvent.room})
            })
            io.emit('RECEIVE_MESSAGE', data)
        })
        socket.on('disconnect', (data)=>{
            if (!socket.nickname)return;
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
                })
            })
        //store disconnect event
            var disconnectEvent=new Elog({type:'DISCONNECT', disconnect: new Date(), name:socket.nickname, socket:socket.id})
            disconnectEvent.save((err)=>{
                if (err) throw err;
                console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+disconnectEvent.type+'\nCreated by: ' + disconnectEvent.name + '\nFor Socket: '+disconnectEvent.socket+'\nSaved to database at: '+ disconnectEvent.disconnect)
            })
        //update the eventlog for specific socket in database
            fs.appendFile('./eventLog.txt', disconnectEvent.socket+" has been disconnected @ "+ disconnectEvent.disconnect +" and created by "+ disconnectEvent.name +"\n", {'flags': 'a'},(err)=>{
                if (err) throw err;
            })
            updateChatD={author:'CHAT BOT NINJA SAYS', message: socket.nickname + ' has disconnected from the chat'}
            io.emit('UPDATE_CHAT', updateChatD);








        })
        
    })
}*/
      /*  //save PRIVATE messages to the database
        socket.on('SEND_MESSAGE',  (data)=> {
            //var msg = data.trim();
            /*if(msg.substr(0,3) === '/w '){
                msg = msg.substr(3);
                var ind = msg.indexOf(' ');
                if(ind !== -1) {
                    var name = msg.substring(0, ind);
                    var msg  = msg.substring(ind+1);
                    if(name in users){
                        users[name].emit('whisper', {msg: msg ,nick: socket.nickname});
                    //store private message in database
                        var newPrivateMessage = new Private({sender:socket.nickname, reciever:name, msg:msg})
                        newPrivateMessage.save((err)=>{
                            console.log('\n==========STORE PRIVATE MESSAGE IN DATABASE==========\nSent by: '+newPrivateMessage.sender+'\nRecieved by: ' + newPrivateMessage.reciever + '\nWith Message: '+newPrivateMessage.msg+'\nSaved to database at: '+ newPrivateMessage.time)
                    //store private message event in database
                        var newMessageEvent=new Elog({type:'PRIVATE MESSAGE', name:socket.nickname, socket:socket.id})
                        newMessageEvent.save((err)=>{
                            if (err) throw err;
                            console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+newMessageEvent.type+'\nCreated by: ' + newMessageEvent.name + '\nSent to: '+newPrivateMessage.reciever+'\nSaved to database at: '+ newMessageEvent.connect)
                    })
                        })
                    }else {
                        callback('Error! Enter a valid user');
                    }
                }else {
                    callback('Error! Please enter a message for your whisper');
                }
            }
        })*/
       /* //handle the switching of rooms
        socket.on('switchRoom', (newroom)=>{
            socket.leave(socket.room);
        //store leave room event
            var leaveRoomEvent=new Elog({type:'LEAVE ROOM', name:socket.nickname, socket:socket.id, room:socket.room})
            leaveRoomEvent.save((err)=>{
                if (err) throw err;
                console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+leaveRoomEvent.type+'\nCreated by: ' + leaveRoomEvent.name + '\nFor Socket: '+leaveRoomEvent.socket+'\nIn the: '+leaveRoomEvent.room+'\nSaved to database at: '+ leaveRoomEvent.connect)
            })
            fs.appendFile('./eventLog.txt', leaveRoomEvent.socket+" has left "+ leaveRoomEvent.room +" and created by "+ leaveRoomEvent.name +' @ '+leaveRoomEvent.connect+"\n", {'flags': 'a'},(err)=>{
                if (err) throw err;
            })
            socket.join(newroom);
        //store join room event
            var joinRoomEvent=new Elog({type:'JOIN ROOM', name:socket.nickname, socket:socket.id, room:newroom})
            joinRoomEvent.save((err)=>{
                if (err) throw err;
                console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+joinRoomEvent.type+'\nCreated by: ' + joinRoomEvent.name + '\nFor Socket: '+joinRoomEvent.socket+'\nIn the: '+joinRoomEvent.room+'\nSaved to database at: '+ joinRoomEvent.connect)
            })
            fs.appendFile('./eventLog.txt', joinRoomEvent.socket+" has joined "+ joinRoomEvent.room +" and created by "+ joinRoomEvent.name +' @ '+joinRoomEvent.connect+"\n", {'flags': 'a'},(err)=>{
                if (err) throw err;
            })
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
        socket.on('disconnect',  (data) =>{
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
                })
            })
        //store disconnect event
            var disconnectEvent=new Elog({type:'DISCONNECT', disconnect: new Date(), name:socket.nickname, socket:socket.id})
            disconnectEvent.save((err)=>{
                if (err) throw err;
                console.log('\n==========STORE EVENT IN DATABASE==========\nEvent Type: '+disconnectEvent.type+'\nCreated by: ' + disconnectEvent.name + '\nFor Socket: '+disconnectEvent.socket+'\nSaved to database at: '+ disconnectEvent.disconnect)
            })
        //update the eventlog for specific socket in database
            fs.appendFile('./eventLog.txt', disconnectEvent.socket+" has been disconnected @ "+ disconnectEvent.disconnect +" and created by "+ disconnectEvent.name +"\n", {'flags': 'a'},(err)=>{
                if (err) throw err;
            })
        //let other users in the room know user has disconnected
            socket.broadcast.emit('updatechat', 'CHAT BOT NINJA SAYS', socket.nickname + ' has disconnected');
            socket.leave(socket.room);
            updateNicknames();
        });
    })
}*/