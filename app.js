/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , RoomManager = require('./routes/roomManager').RoomManager
  , Room = require('./routes/roomManager').Room
  , Player = require('./routes/player').Player
  , Maze = require('./routes/buildMaze').Maze
  , querystring = require('querystring');

var rooms = [];

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

    socket.on('set-player-name', function(data) {
        console.log('data is: '+data+' socket id is: '+socket.id);
        var player = new Player({'socket':socket});
        console.log('player id: '+player.socket.id+' name: '+player.name);
        socket.emit('player-confirmation', {id:player.socket.id,name:player.name});
     });

    socket.on('create-room', function(data) {
        var roomdata = querystring.parse(data.room);
        roomdata.x = parseInt(roomdata.x, 10);
        roomdata.y = parseInt(roomdata.y, 10);
        var room = new Room(roomdata, data.player);
        socket.join(room.name);
        rooms.push(room);
        room.maze.getFinalWallObject();
        response = {name: room.name,x: room.x,y: room.y,bs: room.bs,wallObj:room.maze.walls};
        socket.emit('room-created', response);
    });

    socket.on('join-room', function(data) {
        if (rooms.hasOwnProperty(data.name) && rooms[data.name].players.length < 5) {
            socket.join(data.name);
            var room = rooms[data.name];
            room.players.push(data.player);
            response = {x: room.x,y: room.y,bs: room.bs,offset: 10,wallObj:maze.walls};
            socket.emit('room-joined', response);
        }
        else {
            socket.emit('room-name', {name:'error'});
        }
    });

    socket.on('move', function (data) {
        io.sockets.in(data.name).emit('player-move', {});
    });
});

