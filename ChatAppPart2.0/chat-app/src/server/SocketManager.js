const io = require('./index.js').io

module.exports = function(socket) //individualize connections for each computer
{
    console.log("Socket Id"+ socket.id);
}

