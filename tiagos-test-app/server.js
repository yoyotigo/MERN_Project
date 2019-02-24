var express = require('express');
var app = express();
var mongoose = require('mongoose');
var dbUrl = 'mongodb://admin:password123@ds349455.mlab.com:49455/testt'
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);


var server = app.listen(3000, () =>
{
    console.log('Server running on port 3000');
});

//tell express we're using static file
app.use(express.static(__dirname));


mongoose.connect(dbUrl,{useNewUrlParser:true})
{
    console.log('DB connected');
};

var Message = mongoose.model('Message', 
{
    name: String,
    message: String
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//Get all messages from database
app.get('/messages', (req,res)=>
{
    Message.find({},(err,messages)=>
    {
        res.send(messages);
    })
})

//Post new messages into database
app.post('/messages', (req,res)=>
{
    var message = new Message(req.body);
    message.save((err)=>
    {
        if(err){
        sendStatus(500);
        }
        res.sendStatus(200);
    })
})


//create socket.io connection
io.on('connection',()=>
{
    console.log('user connected');
})

//Emit action when message is created
app.post('/messages', (req,res)=>
{
    var message = new Message(req.body);
    message.save((err)=>
    {
        if(err)
        {
            sendStatus(500);
        }
        io.emit('message', req.body);
        res.sendStatus(200);
    })
})