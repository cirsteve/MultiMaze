var updateRoomHTML = function (room) {
    console.log('updateRoomHTML with: '+room);
    $('div#current-room>span#room').text(room);
};
var drawMaze = function (data) {
    var width = data.x * data.bs + 20
      , height = data.y * data.bs + 24;
    $('#myCanvas').attr('width', width + "px")
              .attr('height', height + "px")
              .show('slow');
    var canvas = document.getElementById("myCanvas")
      , context = canvas.getContext("2d")
      , ctxGrid = canvas.getContext("2d")
      , ctxWalls = canvas.getContext("2d");
    ctxArc = canvas.getContext("2d");
    ctxArcCover = canvas.getContext("2d");
    data.offset = 10;
    console.log(data.offset);
    arcOffset = {x:data.offset + data.bs / 2, y:data.offset + data.y * data.bs - data.bs / 2}; //location of marker at start 
    console.log(arcOffset.x,arcOffset.y);
    drawBase(context, data);
    drawGrid(ctxGrid, data);
    drawWalls(ctxWalls, data, arcOffset);
    drawArc(ctxArc, arcOffset);
};

var socket = io.connect('http://localhost');
var player, arcOffset, moveData, ctxArcCover, ctxArc;
var room = {playing: false};
socket.emit('set-player-name', {});

socket.on('player-confirmation', function(data) {
    player = data;
    for(var key in player) {
        console.log('key is '+key);
    }
    console.log(player.id+' is the player');
});

$('#create').click(function(e) {
    e.preventDefault();
    var form = $('#maze_config_form'); 
    form = form.serialize();
    var data = {room:form, player:player};
    console.log(form, data);
    socket.emit('create-room', data);
});

socket.on('room-created', function(data) {
    drawMaze(data);
    updateRoomHTML(data.name);
    room = data;
    room.bs = parseInt(data.bs, 10);
    room.playing = false;
    console.log('room data reced '+room.x);
});
socket.on('room-joined', function(data) {
    drawMaze(data);
});

socket.on('new-maze', function(data) {
    drawMaze(data);
    room.playing = false;
});

socket.on('move-update', function(data) {
    moveArcs(data.maze, data.players); 
});

$('button#start').click(function(e) {
    console.log('button clicked');
    room.playing = true;
});

$(window).keydown(function(e) {
    if (room.playing) {
        var move;
        var data = room;
        console.log('key is down'+typeof(room.x));
        e.preventDefault();
        var moveMap = { 37: function() {
                        return {x:this.x - data.bs,y: this.y};
                    },
                    38: function() {
                        return {x:this.x,y: this.y - data.bs};
                    },
                    39: function() {
                        return {x:this.x + data.bs,y: this.y};
                    },
                    40: function() {
                        return {x:this.x,y: this.y + data.bs};
                    }};
        if (move = moveArc(e.which, arcOffset, moveMap[e.which], room, ctxArcCover, ctxArc)) {
            socket.emit('move', room);
        }
    }
});



