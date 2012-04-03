var Maze = require('./buildMaze').Maze;

var Room = function (options, player) {
    this.name = options.name;
    this.x = options.x || 20;
    this.y = options.y || 20;
    this.bs = options.bs || 30;
    this.maze = new Maze(options);
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

exports.RoomManager = RoomManager;
exports.Room = Room;
