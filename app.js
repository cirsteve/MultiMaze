/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , rooms = require('./routes/roomManager').rooms;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/config', routes.maze_config);
app.get('/testconf', routes.testconf);
app.post('/create-maze', routes.create_maze);

var io = require("socket.io").listen(app);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

io.sockets.on('connection', function(socket) {
    socket.on('join-room', function(data) {
        if (rooms.hasOwnProperty(data.name)) {
            rooms[data.name].players += 1;
            socket.emit(data.name+'_init', rooms[data.name]);
        }
        else {
            socket.emit('room-name', {name:'error'});
        }
    });
    socket.on('move', function(data) {
    });
});
