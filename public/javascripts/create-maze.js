
var drawMaze = function (data) {
    var width = data.x * data.bs + 20
      , height = data.y * data.bs + 24;
    $('#myCanvas').attr('width', width + "px")
              .attr('height', height + "px")
              .show('slow');
    var canvas = document.getElementById("myCanvas")
      , context = canvas.getContext("2d")
      , ctxArc = canvas.getContext("2d")
      , ctxGrid = canvas.getContext("2d")
      , ctxWalls = canvas.getContext("2d")
      , ctxArcCover = canvas.getContext("2d");
    data.offset = 10;
    console.log(data.offset);
    var arcOffset = {x:data.offset + data.bs / 2, y:data.offset + data.y * data.bs - data.bs / 2}; //location of marker at start 
    drawBase(context, data);
    drawGrid(ctxGrid, data);
    drawWalls(ctxWalls, data, arcOffset);
    drawArc(ctxArc, arcOffset);
};

var socket = io.connect('http://localhost');
var player, room = {playing: false};
socket.emit('set-player-name', {});

socket.on('player-confirmation', function(data) {
    player = data;
    for(var key in player) {
        console.log('key is '+key);
    }
    console.log(player.id+' is the player');
});

socket.on('you-signed-up', function(data) {
    console.log('sign up: '+data);
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
    console.log('room data reced '+data);
});
socket.on('room-joined', function(data) {
    drawMaze(data);
});

socket.on('new-maze', function(data) {
    drawMaze(data);
});

$(window).keydown(function(e) {
    if (room.playing) {
        var move = move;
        console.log('key is down');
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
        if (move = moveArc(e.which, arcOffset, moveMap[e.which], data, ctxArcCover, ctxArc)) {
            socket.emit('move'+room.name, move);
        }
    }
});



