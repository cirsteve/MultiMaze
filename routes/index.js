var check = require('validator').check
  , sanitize = require('validator').sanitize
  , Maze = require('./buildMaze').Maze
  , RoomManager = require('./roomManager').RoomManager;




        

var buildMaze = function(options, callback) {
    var aMaze = maze(options);
};

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.maze_config = function(req, res) {
    res.render('maze_config', {title:"Maze Configuration"});
};

exports.get_rooms = function(req, res) {
    var liveRooms = [], room;
    for (room in rooms) {
        liveRooms.push({room: room.players});
    }
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(liveRooms));
    res.end;
};

exports.create_maze = function(req, res) {
    var options = {};
    console.log('create_maze called'); 
    var POST =  req.body;
    options.name = POST.name;
    options.wNodes = parseInt(POST.x, 10);
    options.hNodes = parseInt(POST.y, 10);
    options.nodePxls = parseInt(POST.bs, 10);
    console.log('opt '+options.wNodes);
    var aMaze = new Maze(options);
    //var aMaze = new nmaze.Maze(options);
    var that = this;
    console.log(typeof(rooms));
    aMaze.getFinalWallObject(function(data, r){
        console.log('room type '+typeof(r));
        console.log('dim '+aMaze.dimensions);
        res.writeHead(200, {"Content-Type": "application/json"});
        if (!r.hasOwnProperty(options.name)) {            
            console.log('name is '+options.name);
            r[options.name] = {"wallObj":data, "x":options.wNodes, "y":options.hNodes, "bs":options.nodePxls, "players":0};
            res.write(JSON.stringify({"name":options.name}));
            res.end();
        }
    });


};

exports.gameRoom = function(reg, res) {
        
};
