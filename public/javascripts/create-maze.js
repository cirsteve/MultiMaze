var updateRoomHTML = function (room) {
    console.log('updateRoomHTML with: '+room);
    $('div#current-room span#room').text(room);
};

var updateUserNameHTML = function (name) {
    console.log('updateUserNameHTML with: '+name);
    $('div#current-user span#name').text(name);
};

var updatePlayersHTML = function (players) {
    console.log(typeof(players)+'plyrs');
    var ul = $('#player-list ul');
    ul.empty();
    players.forEach( function(player) {
        if (player) {
            ul.append('<li>'+player.name+'</li>');   
        }
    });
};

var toMazeOn = function () {
    $('#side-bar').removeClass('lobby')
                   .addClass('maze-on');
    $('#to-lobby').removeClass('hidden');
    $('#room-list').addClass('hidden');
    $('#maze_form').addClass('hidden');
    $('#new-maze').addClass('hidden');
    $('#start').removeClass('hidden');
    $('#player-list').removeClass('hidden');
    $('#ajax-loader').addClass('hidden');
};

var toLobby = function () {
    $('#side-bar').addClass('lobby')
                   .removeClass('maze-on');
    $('#to-lobby').addClass('hidden');
    $('#room-list').removeClass('hidden');
    $('#maze_form').removeClass('hidden');
    $('new-maze').addClass('hidden');
    $('#start').addClass('hidden');
    $('#player-list').addClass('hidden');
    canvas.width = canvas.width;//addClass('hidden');
};
var drawMaze = function (data, func) {
    var width = data.x * data.bs + 40
      , height = data.y * data.bs + 44;
    $('#myCanvas').attr('width', width + "px")
              .attr('height', height + "px")
              .show('slow');
    data.offset = 20;
    var context = canvas.getContext("2d")
      , ctxGrid = canvas.getContext("2d")
      , ctxWalls = canvas.getContext("2d")
      , ctxText = canvas.getContext("2d")
      , wallOffset = {x:data.offset + data.bs / 2, y:data.offset + data.y * data.bs - data.bs / 2}; //location of marker at start 
    console.log(data.offset);
    drawBase(context, data);
    drawGrid(ctxGrid, data);
    drawWalls(ctxWalls, data, wallOffset);
    writeStartEnd(ctxText, data);
    func();
};

var createArc = function (data, ctx) {
    arcOffset = {x:data.offset + data.bs / 2, y:data.offset + data.y * data.bs - data.bs / 2}; //location of marker at start 
};

var updateArc = function (player) {
    
};

//var socket = io.connect('http://stark-sword-8314.herokuapp.com/');
var socket = io.connect('http://localhost/');
var player, arcOffset, moveData, ctxArcCover, ctxArc;
var canvas = document.getElementById("myCanvas")
  , ctxArc = canvas.getContext("2d")
  , ctxArcCover = canvas.getContext("2d");
var room = {playing: false};
socket.emit('set-player', {});
socket.emit('get-rooms', {});

socket.on('player-confirmation', function(data) {
    player = data;
    console.log(player.id+' is the player');
});

socket.on('name-confirmation', function(data) {
    
});

socket.on('current-rooms', function(data) {
    console.log('current-rooms fired: '+data.current_rooms);
    var ul = $('#room-list ul');
    ul.empty();
    for (var rm in data.current_rooms) {
        ul.append('<li><a href="#">'+data.current_rooms[rm].name+'</a></li>');
    }
});

$('#create').click(function(e) {
    e.preventDefault();
    var form = $('#maze_config_form'); 
    form = form.serialize();
    var data = {room:form, player:player};
    console.log(form, data);
    socket.emit('create-room', data);
    $('#ajax-loader').removeClass('hidden');
    $('#maze_form').addClass('hidden');
});

socket.on('room-created', function(data) {
    drawMaze(data, toMazeOn);
    updateRoomHTML(data.name);
    updatePlayersHTML(data.players);
    room = data;
    room.bs = parseInt(data.bs, 10);
    room.playing = false;
    console.log('room data reced '+room.players);
});

socket.on('player-joined', function(data) {
    console.log('player joined'+data);
    room.players.unshift(data);
    updatePlayersHTML(room.players);
});

socket.on('room-joined', function(data) {
    drawMaze(data, toMazeOn);
    room = data;
    room.playing = false;    
    updatePlayersHTML(data.players);
    updateRoomHTML(data.name);
}); 

socket.on('another-maze', function(data) {
    room.wallObj = data.wallObj;
    drawMaze(room, toMazeOn);
    room.playing = false;
    $('#start').removeClass('hidden');
});

socket.on('init-maze', function() {
    console.log('init maze for: '+room.players);
    initArcs(room.players);
    room.playing = true;
    $('#start').addClass('hidden');
});

socket.on('move-update', function(data) {
    console.log('move-update called: '+room.players.length);
    coverArcs(room);
    for (var i = 0; i <= room.players.length - 1; i++) {
        if (room.players[i].id == data.id) {
            console.log('move update match: '+data.id);
            room.players[i].coords = data.coords;
            drawArcs(room);
            //break;
        }
    console.log(room.players[i].id);
    }
});

socket.on('game-won', function(data) {
    console.log('game-won: ' + data.id);
    room.playing = false;
    alert(data,' has won!');
    $('#new-maze').removeClass('hidden');
});

socket.on('player-left', function(data) {
    console.log('player left called: '+data.player+typeof(room.players[0].id));
    var i, player = parseInt(data.player, 10);
    for (i=0; i<room.players.length; i++) {
        console.log('plid: '+room.players[i].id);
        if (data.player === room.players[i].id) {
            break;
        }
    }
    room.players.splice(i,1);
    updatePlayersHTML(room.players);
});

$('#set-name').click( function(e) {
    e.preventDefault();
    var name = $('form#add-name input:text').val();
    console.log('set-name to: '+name); 
    player.name = name;
    updateUserNameHTML(name);
    if (room.players) {
        room.players[0].name = name;
        updatePlayersHTML(room.players);
    }
    $('#add-name').addClass('hidden');
    socket.emit('set-player-name', player);
});

$('#room-list').on('click','a',function(e) {
    e.preventDefault();
    var room_name = $(this).text();
    console.log('clicked rn: '+room_name);
    socket.emit('join-room', {name:room_name});
});

$('button#start').click(function(e) {
    console.log('start clicked'+room.name);
    socket.emit('start-maze', {name:room.name});    
});

$('button#new-maze').click(function(e) {
    e.preventDefault();
    socket.emit('new-maze');
});

$('#to-lobby').click( function(e) {
    e.preventDefault();
    socket.emit('to-lobby', {room:room.name,player:player.id});
    room = {playing:false};
    toLobby();
});

$(window).keydown(function(e) {
    if (room.playing) {
        var move;
        var data = room;
        data.bs = parseInt(data.bs, 10);
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
        var player = room.players[room.players.length-1];
        if (moveArc(e.which, player.coords, moveMap[e.which], room, player.ctxc, player.ctx, player)) {
            socket.emit('move', {id:player.id,coords:player.coords,name:room.name});
        }
    }
});



