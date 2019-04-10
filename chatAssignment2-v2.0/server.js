const express = require('express'),
    app = express(),
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
mongoose.connect('mongodb://admin:password123@ds349455.mlab.com:49455/testt',{ useNewUrlParser: true }, (err)=> {
    if (err){
        console.log(err);
    }else {
        console.log('Connected to Database')
    }
})

mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/chats', require('./routes/chats'));
app.use('/', require('./routes/index'));



/*
io.on('connection', (socket)=>{
    console.log(socket.id);
});

io.on('connection', (socket)=>{
    console.log(socket.id);

    socket.on('SEND_MESSAGE', function(data){
        io.emit('RECEIVE_MESSAGE', data);
    })
});
*/

app.get('/api/admin', (req,res,next)=>{
    Admin.find()
    .exec(function(error,admin){
        if (error){
            return next(error);
        }else{
            if (admin === null){
                var err = new Error('no');
                err.status=400;
                return next(err);
            }else{
                return res.send(admin)
            }
        }
    })
})