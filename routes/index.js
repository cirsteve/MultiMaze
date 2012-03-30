var check = require('validator').check
  , sanitize = require('validator').sanitize
  , maze = require('./buildMaze').maze;    
var  nmaze = require('./newMaze');

var buildMaze = function(options) {
    var wNodes = options.widthNodes || 10
        , hNodes = options.heightNodes || 10
        , nodePxls = options.nodePxls || 50
        , start = [1,1]
        , end = [wNodes, hNodes]
        , offset = 10;
};

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.maze_config = function(req, res) {
    res.render('maze_config', {title:"Maze Configuration"});
};

exports.create_maze = function(req, res) {
        var options = {};
        console.log('create_maze called'); 
        var POST =  req.body;
        options.wNodes = POST.x;
        options.hNodes = POST.y;
        options.nodePxls = POST.bs;
        console.log('opt '+options.wNodes);
        var aMaze = maze(options);
        //var aMaze = new nmaze.Maze(options);
        debugger
        var p = aMaze.findRandomPath();
        console.log('am p '+aMaze.path);
        console.log('dim '+aMaze.dimensions);
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write('bo')
        console.log(aMaze.path);
        res.end();
    
};

exports.gameRoom = function(reg, res) {
        
};
