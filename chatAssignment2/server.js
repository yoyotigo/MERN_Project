const express = require('express'),
    app = express(),
    path = require('path');
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    port = process.env.PORT || 5000;
    require('./socketManager/socket')(io);

//////////PORT CONNECTION//////////
server.listen(port, ()=>{
    console.log('Listening on port ' + port);
});

//////////DATABASE CONNECTION//////////
mongoose.connect('mongodb://admin:password123@ds349455.mlab.com:49455/testt',{ useMongoClient: true }, (err)=> {
    if (err){
        console.log(err);
    }else {
        console.log('Connected to Database')
    }
})

mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.use('/chats', require('./routes/chats'));
app.use('/', require('./routes/index'));






io.on('connection', (socket)=>{
    console.log(socket.id);
});

io.on('connection', (socket)=>{
    console.log(socket.id);

    socket.on('SEND_MESSAGE', function(data){
        io.emit('RECEIVE_MESSAGE', data);
    })
});

