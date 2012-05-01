var Maze = function (allWalls, totalNodes) {
    this.totalNodes = totalNodes;
    this.wallsArray = allWalls;
    this.walls = this.kruskals(); //object containing wall locations
};


Maze.prototype.wallArrToObj = function (wallsMazeArray) {
    var i, walls = {};
    var len = wallsMazeArray.length;
    for (i=0; i<len; i++) {
        walls[wallsMazeArray[i][0]+'_'+wallsMazeArray[i][1]] = true;
    }
    return walls;
};

Maze.prototype.nodeFromWall = function (wall) {
    console.log('nodeFromWall: '+wall);
        //if (wall[0].indexOf('.') === 0) {
        if (wall[0] - Math.floor(wall[0]) === 0) {
            return [[wall[0],wall[1]-.5], [wall[0], wall[1]+.5]];
        }
        else {
            return [[wall[0]-.5, wall[1]], [wall[0]+.5, wall[1]]];
        }
};

Maze.prototype.findNodeSet = function (node, sets) {
    var set = -1
      , i;
    for (i=0; i<sets.length; i++) {
        set = sets[i].indexOf(node);
        if (set !== -1) {
            return i;
        }
    }
    return set;
};

Maze.prototype.kruskals = function () {
    var sets = [];
    var wall, index, nodes, n1, n2, n1Set, n2Set, newArr, mazeWalls = this.wallsArray.slice(0);
    do {
       console.log('sl '+sets.length);
       index = Math.floor(Math.random()*mazeWalls.length);
       console.log('ind'+index);
       wall = mazeWalls[index];
       nodes = this.nodeFromWall(wall);
       n1 = nodes[0][0]+'_'+nodes[0][1];
       n2 = nodes[1][0]+'_'+nodes[1][1];
       n1Set = this.findNodeSet(n1, sets);
       n2Set = this.findNodeSet(n2, sets);
       console.log('nsets: '+n2Set+'_'+n1Set);
       if (n1Set === -1 && n2Set === -1) {
           console.log('c1');
           sets.push([n1, n2]);
           mazeWalls.splice(index, 1);
       }
       else if (n1Set === -1) {
           console.log('c2');
           sets[n2Set].push(n1);
           mazeWalls.splice(index, 1);
       }
       else if (n2Set === -1) {
           console.log('c3');
           sets[n1Set].push(n2);
           mazeWalls.splice(index, 1);
       }
       else if (n1Set !== n2Set) {
           console.log('c4');
           newArr = sets[n1Set].concat(sets[n2Set]);
           if (n1Set > n2Set) {
               sets.splice(n1Set, 1);
               sets.splice(n2Set, 1);
           }
           else {
               sets.splice(n2Set, 1);
               sets.splice(n1Set, 1);
           }
           sets.push(newArr);
           mazeWalls.splice(index, 1);
       }
    }
    while (sets[0].length < this.totalNodes);
    return this.wallArrToObj(mazeWalls);
};


exports.Maze = Maze;
