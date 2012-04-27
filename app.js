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

var rooms = {};

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
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

/*
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 20); 
});
*/

io.sockets.on('connection', function(socket) {

    socket.on('set-player', function(data) {
        console.log('data is: '+data+' socket id is: '+socket.id);
        var player = new Player({'socket':socket});
        console.log('plyr is: '+player.name);
        socket.set('player', player, function() {
            console.log('player id: '+player.id+' name: '+player.name);
            socket.emit('player-confirmation', {id:player.id,name:player.name});
        });
    });

    socket.on('set-player-name', function(data) {
        var name = data.name;
        socket.get('player', function(err, player) {
            console.log(player);
            player.name = name;
            socket.set('player',player);
            console.log('ply nm: '+player.name);
        });
     });

    socket.on('get-rooms', function(data) {
        var current_rooms = {current_rooms:rooms};
        socket.emit('current-rooms', current_rooms);
    });

    socket.on('create-room', function(data) {
        var roomdata = querystring.parse(data.room);
        if (rooms.hasOwnProperty(roomdata.name)) {
            socket.emit('room-exists');
            return;
        }
        roomdata.x = parseInt(roomdata.x, 10);
        roomdata.y = parseInt(roomdata.y, 10);
        var room = new Room(roomdata, data.player);
        socket.join(room.name);
        rooms[room.name] = room;
        room.maze.getKruskalsWallObject();
        response = {name: room.name,x: room.x,y: room.y,bs: room.bs,wallObj:room.maze.walls,players:room.players};
        socket.set('room', room, function() {
            });
        socket.emit('room-created', response);
        socket.broadcast.emit('current-rooms', {current_rooms:rooms});
    });

    socket.on('join-room', function(data) {
        var room = rooms[data.name];
        if ( room.playing ) {
            socket.emit('game-in-progress');
            return;
        }
        if (rooms.hasOwnProperty(room.name) && room.players.length < 5) {
            socket.get('player', function(err, player) {
                io.sockets.in(room.name).emit('player-joined', player);
                socket.join(room.name);
                room.players.push(player);
                console.log('room is: '+room);
                response = {name:room.name,x: room.x,y: room.y,bs: room.bs,offset: 20,wallObj:room.maze.walls,players:room.players, playing:room.playing};
                socket.set('room', room, function() {
                    console.log('roomeset '+response.players);
                    socket.emit('room-joined', response);
                });
            });
        }
        else {
            socket.emit('room-name', {name:'error'});
        }
    });

    socket.on('start-maze', function(data) {
            socket.get('room', function(err, room) {
                room.playing = true;
                io.sockets.in(data.name).emit('init-maze');
            });
    });

    socket.on('move', function (data) {
        console.log(data);
        io.sockets.in(data.name).emit('move-update',data);
        socket.get('room', function(err, room) {
        console.log('m: '+data.coords.x+'-'+data.coords.y+' cd: '+room.maze.cDimensions.x+'-'+room.maze.cDimensions.y);
            if (data.coords.x === room.maze.cDimensions.x && data.coords.y === room.maze.cDimensions.y) {
                room.playing = false;
                io.sockets.in(room.name).emit('game-won', {winner:data.id});
            }
        });
    });

    socket.on('new-maze', function(data) {
        socket.get('room', function(err, room) {
            room.maze.getKruskalsWallObject();
            room.playing = false;
            io.sockets.in(room.name).emit('another-maze', {wallObj:room.maze.walls});
        });
    });

    socket.on('to-lobby', function(data) {
        var playerID = data.player;
        socket.leave(data.room);
        var room = rooms[data.room];
        for (i=0;i<room.players.length; i++) {
            if (room.players[i].id === playerID) {
                room.players.splice(i, 1);
                break;
            }
        }
        if (room.players.length < 1) {
            delete rooms[room.name];
            socket.broadcast.emit('current-rooms', {current_rooms:rooms});
        }
        else {
            io.sockets.in(data.room).emit('player-left', {player:data.player});
        }
    });

/*
    socket.on('disconnect', function() {
        socket.get('room', function(err, room) {
            console.log('rmis: '+room);
            if (room.players.length < 1) {
                delete rooms[room.name];
                socket.broadcast.emit('current-rooms', {current_rooms:rooms});
            }
            else {
                socket.get('player', function(err, player) {
                    io.sockets.in(room.name).emit('player-left', {player:player.id});
                });
            }
        });
    });*/
});
