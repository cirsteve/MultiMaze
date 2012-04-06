var Maze = function (options) {
    this.dimensions = {x:options.x,y:options.y};
    this.cDimensions = {x: (options.x - 1) * options.bs + 10 + (options.bs/2), y: 10 + (options.bs/2)};
    this.start = {x:1,y:1};
    this.path = []; //random path solution to maze
    this.visited = {}; //path as object keys for efficient lookup
    this.falsePaths = [];
    this.falsePathsLkUp = {};
    this.walls = {}; //object containing wall locations
};

Maze.prototype.isEnd = function(node) {
    return node.x === this.dimensions.x && node.y === this.dimensions.y;
};

Maze.prototype.randomMove = function (node) {
    var move = Math.floor(Math.random()*4);
    switch(move) {
        case 0:
            return {x: node.x - 1,y: node.y};
            break;
        case 1:
            return {x: node.x + 1,y: node.y};
            break;
        case 2:
            return {x: node.x,y: node.y - 1};
            break;
        case 3:
            return {x: node.x,y: node.y + 1};
            break;
    }  
};

Maze.prototype.validMove = function (node) {
    var x = node.x;
    var y = node.y;
    return x >= 1 && x <= this.dimensions.x && y >= 1 && y <= this.dimensions.y && !this.visited.hasOwnProperty(x+'_'+y);
};

Maze.prototype.getNeighbor = function (node, direction) {
    var neighbor;
    switch (direction) {
        case 0://neighbor to the left
            neighbor = {x: node.x - 1,y: node.y};
            break;
        case 1://neighbor below
            neighbor = {x: node.x,y: node.y - 1};
            break;                       
        case 2://neighbor above
            neighbor = {x: node.x + 1,y: node.y};
            break;
        case 3://neighbor to right
            neighbor = {x: node.x,y: node.y + 1};
            break;
    }
    return neighbor;
};

Maze.prototype.anyValidPath = function (node) {
    var checked = {}, toCheck = [], valid = false, that = this;
    toCheck.push(node);
    //check if start value is the end
    if (this.isEnd(node)) {
        return true;
    }
    var checkNeighbors = function(current) {
        var i,n;
        checked[current.x+'_'+current.y] = 1;
        for (i = 0; i < 4; i++) {
            n = that.getNeighbor(current, i);
            if (that.isEnd(n)) {
                valid = true;
                break;
            } 
            else if (that.validMove(n) && !checked.hasOwnProperty(n.x+'_'+n.y)) {
                toCheck.push(n);
            }
        }
        return valid;
    };
    while (toCheck.length > 0) {
        if (checkNeighbors(toCheck.pop())) {
            break;
        }       
    }
    return valid;
};

Maze.prototype.findRandomPath = function () {
    var next, valid;
    console.log('frp called');
    this.visited['1_1'] = 1; //add starting node to visited object
    this.path.push(this.start);
    while (!this.isEnd(this.path[this.path.length-1])) { 
        next = this.randomMove(this.path[this.path.length-1]);
        valid = this.validMove(next);
        if ( valid && this.anyValidPath(next)) {
            this.path.push({x: next.x,y: next.y});
            this.visited[next.x+'_'+next.y] = 1;
        }
    }
    console.log(this.path);
    //return this.path;
};

Maze.prototype.validFalsePath = function (node) {
    var key = node.x+'_'+node.y;
    return (node.x >= 1 && node.x <= this.dimensions.x && node.y >= 1 && node.y <= this.dimensions.y && !this.falsePathsLkUp.hasOwnProperty(key) && !this.visited.hasOwnProperty(key)) ? node : false;    
};

Maze.prototype.getFalseNeighbor = function (currentFalsePath) {
    var m;
    while (m = this.validFalsePath(this.randomMove(currentFalsePath[currentFalsePath.length-1]))) {
        currentFalsePath.push({x:m.x,y:m.y});
        this.falsePathsLkUp[m.x+'_'+m.y] = 1;
    }
    return currentFalsePath;
};

Maze.prototype.createFalsePaths = function () {
    console.log('createFalsePaths called');
    var i, d, n, fp;
    for(i = 0; i < this.path.length; i++) {
        for (d = 0; d < 4; d++) {
            n = this.getNeighbor(this.path[i], d);
            if (!this.visited.hasOwnProperty(n.x+'_'+n.y) && !this.falsePathsLkUp.hasOwnProperty(n.x+'_'+n.y)) {
                fp = [this.path[i],{x:n.x,y:n.y}];
                this.falsePathsLkUp[n.x+'_'+n.y] = 1;
                fp = this.getFalseNeighbor(fp);
                this.falsePaths.push(fp);
            }
        }
    }
    console.log(this.falsePaths);
};

Maze.prototype.createWallObject = function () {
    console.log('createWallObject called');
    //add vertical walls
    for (var y = this.start.y; y <= this.dimensions.y; y++) {
        var x = this.start.x + .5;
        while(x < this.dimensions.x) {
            this.walls[x+'_'+y] = 1;
            x += 1;
        }
    }
    for (var x = this.start.x; x <= this.dimensions.x; x++) {
        var y = this.start.y + .5;
        while(y < this.dimensions.y) {
            this.walls[x+'_'+y] = 1;
            y += 1;
        }
    }
};

Maze.prototype.returnWall = function(prev, next) {
    return (prev < next) ? (prev + .5) : (next + .5);
};
        
//takes a wallsObject and removes the keys for walls in path
Maze.prototype.removePathWalls = function (pathA) { 
    console.log('called removePathWalls');
    for (var i = 0; i< pathA.length-1; i++) {
        var prev = pathA[i];
        var next = pathA[i+1];
        //determine what axis the wall is
        var x = prev.x === next.x ? prev.x : this.returnWall(prev.x, next.x); 
        var y = prev.y === next.y ? prev.y : this.returnWall(prev.y, next.y);
        var key = x + '_' + y;
        delete this.walls[key];
    }
};  

Maze.prototype.removeFalsePathWalls = function () {
    console.log('rm fpath walls');
    var that = this;
    this.falsePaths.forEach(function(FPath) {
        that.removePathWalls(FPath);
    });
};

Maze.prototype.getFinalWallObject = function() {
    console.log('gfwo called');
    this.findRandomPath();
    this.createWallObject();
    this.createFalsePaths();
    this.removePathWalls(this.path);
    this.removeFalsePathWalls();
};

exports.Maze = Maze;
