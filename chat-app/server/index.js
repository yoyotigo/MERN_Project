var app = require('http').createServer()
var io = module.exports.io = require('socket.io')(app)
const PORT = process.env.PORT || 3000
const SocketManager = require('./SocketManager')
const mongoose = require('mongoose');

io.on('connection', SocketManager)

app.listen(PORT, ()=>{
	console.log("Connected Port:" + PORT);
})


//Connect to database
mongoose.connect('mongodb://admin:password123@ds149365.mlab.com:49365/chat-app', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback()
{
	console.log('connected to db');
	saveData();
});
//End database connection 

//Database schema
var Userschema = new mongoose.Schema
({
	username: String
});
var User = mongoose.model('User', Userschema);
//End database schema

//Add test user to User model
var testUser = 
{
	username: "yoyotigo"
}
function saveData()
{
	var user = new User(testUser);
	user.save();
}
//End adding user