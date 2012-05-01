var Player = function (options) {
    this.name = options.name || 'Player of the maze';
    this.id = options.socket.id;
    this.coords = {x: 0, y: 0};
};


exports.Player = Player;
