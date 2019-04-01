const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
var socket = require('socket.io');

//////////PORT CONNECTION//////////
server = app.listen(5000, function(){
    console.log(`server is running on port 5000`)
})

//////////DATABASE CONNECTION//////////
mongoose.connect('mongodb://admin:password123@ds349455.mlab.com:49455/testt',{ useMongoClient: true }, (err)=> {
    if (err){
        console.log(err);
    }else {
        console.log('Connected to Database')
    }
})


io = socket(server);

io.on('connection', (socket)=>{
    console.log(socket.id);
});

io.on('connection', (socket)=>{
    console.log(socket.id);

    socket.on('SEND_MESSAGE', function(data){
        io.emit('RECEIVE_MESSAGE', data);
    })
});

