var Maze = require('./buildMaze').Maze;

var Room = function (options, player) {
    this.name = options.name;
    this.x = options.x || 20;
    this.y = options.y || 20;
    this.totalNodes = this.x * this.y;
    this.cDimensions = {x: (options.x - 1) * options.bs + 20 + (options.bs/2), y: 20 + (options.bs/2)};
    this.bs = options.bs || 30;
    this.allWalls = this.createWallArray();
    this.maze = new Maze(this.allWalls, this.totalNodes);
    this.players = [player];
    this.playing = false;
};

Room.prototype.getMaze = function () {
    this.maze = new Maze(options);
    this.maze.getFinalWallObject();
};

Room.prototype.addPlayer = function (player) {
    var count = this.players.length;
    if (count < 5) {
        this,players.push(player);
        return count++;
    }
    else {
        return false;
    }
};

Room.prototype.createWallArray = function() {
  //add vertical walls
    var wallsArray = [];
    for (var y = 1; y <= this.y; y++) {
        var x = 1.5;
        while(x < this.x) {
            wallsArray.push([x,y]);
            x += 1;
        }
    }
    for (var x = 1; x <= this.x; x++) {
        var y = 1.5;
        while(y < this.y) {
            wallsArray.push([x,y]);
            y += 1;
        }
    }
    return wallsArray;
};


Room.prototype.removePlayer = function (player) {
     var index = this.players.indexOf(player);
     this.players.splice(index, 1);
    return this.players.length;
};
 
var RoomManager = function () {
     this.rooms= {};
};
 
RoomManager.prototype.createRoom = function (options, player) {
     var count = 1, name = options.name;
     while(this.rooms.hasOwnProperty(name)) {
         name = name + count++;
     }
};


//exports.RoomManager = RoomManager;
exports.Room = Room;
