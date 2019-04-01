var app = require('http').createServer();
var io = module.exports.io = require('socket.io')(app);

const PORT = process.env.PORT || 3000

const SocketManager = require('./SocketManager');

io.onconnection('connection', SocketManager)  //sends socket to function in SocketManager

app.listen(PORT, ()=>
{
    console.log("Connected to port: "+ PORT);
});