var rooms = ['Main room', 'Gaming room', 'Political room'],
    connectedUsers = { },
    fs = require('fs'),
    User = require('../models/Users.js'),
    Rooms = require('../models/Rooms'),
    Chat = require('../models/Chats.js'),
    Sockio = require('../models/Sockets.js'),
    Elog = require('../models/Events.js'),
    Private = require('../models/PrivateChats.js')
    io = require('../server').io,
module.exports = (socket)=>{
    socket.on('CONNECTED', ()=>{
        //store event
        var connectEvent=new Elog({type:'CONNECTION', socket:socket.id, room:'Main Room'})
        connectEvent.save((err)=>{
                if (err) throw err;
                     console.log('\n==========STORE EVENT IN DATABASE==========\nSocket: '+connectEvent.socket+'\nWith type: '+connectEvent.type+"\nHas been connected @: "+ connectEvent.connect +'\nIn the: '+connectEvent.room+'\nSaved to database at: '+ connectEvent.connect)
            })
        Rooms.find((err, results)=>{
            if(err) throw err;
            results.forEach((i)=>{
                console.log(i.room)
            })
        });
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
    socket.on('SWITCHED_ROOM', (data)=>{
        //console.log("socket switch begin:==============================" , socket)
        console.log('\nCurrent Room: '+socket.room)
        socket.leave(socket.room);
        console.log("left room: " + socket.room)
        socket.join()
        socket.join(data['new'])
        socket.room=data['new']
        console.log('new room: ' + socket.room)
        //console.log("socket switch end:==============================" , socket)
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