
var aEnd = function(loc) {
    return (loc[0] === 11 && loc[1] === 11) ? 1 : 0;
    };

exports.maze = function(options) {
    return {dimensions:[options.wNodes, options.hNodes],
            start: [1,1],
            path: [], //random path solution to maze
            visited:{}, //path as object keys for efficient lookup
            isEnd: function(locArr) {
                    console.log('isend: '+locArr);
                    return (locArr[0] === this.dimensions[0] && locArr[1]=== this.dimensions[1]) ? 1 : 0;
                },
            randomMove: function(array) {
                    var move = Math.floor(Math.random()*4);
                    switch(move) {
                        case 0:
                            return[array[0] - 1, array[1]];
                            break;
                        case 1:
                            return[array[0] + 1, array[1]];
                            break;
                        case 2:
                            return[array[0], array[1] - 1];
                            break;
                        case 3:
                            return[array[0], array[1] + 1];
                            break;
                    }  
                },
            validMove: function(coordArr) {
                    console.log('val called');
                    var endX = coordArr[0];
                    var endY = coordArr[1];
                    return ( endX < 1 || endX > this.dimensions[0] || endY < 1 || endY > this.dimensions[1] || this.visited.hasOwnProperty(endX+'_'+endY)) ? 0 : 1;
                },
            getNeighbor: {0: function(array) {
                                return [array[0] + 1,array[1]];
                               },
                             1: function(array) {
                                 return [array[0],array[1] + 1];                          
                               },
                             2: function(array) {
                                 return [array[0] - 1,array[1]];
                               },
                             3: function(array) {
                                 return [array[0],array[1] - 1];
                               }},
            anyValidPath: function (nArray) {
                    var checked = {}, toCheck = [], valid = false;
                    toCheck.push(nArray);
                    //check if start value is the end
                    if (this.isEnd(nArray)) {
                        return true;
                    }
                    var that = this;
                    var checkNs = function(nA) {
                        console.log('na '+nA);
                        checked[nA[0]+'_'+nA[1]] = 1;
                        for ( var i = 0; i < 4; i++) {
                            var n = that.getNeighbor[i](nA); 
                            console.log('neb is '+n);
                            if (that.isEnd(n)) {
                                console.log('n is val '+n);
                                valid = true;
                                break;
                            } 
                            else if (that.validMove(n) && !checked.hasOwnProperty(n[0]+'_'+n[1])) {
                                toCheck.push(n);
                            }
                        }
                        return valid;
                    };
                    while(toCheck.length > 0) {
                        console.log('tc last '+toCheck[toCheck.length-1]);
                        if (checkNs(toCheck.pop())) {
                            break;
                        }       
                    }
                    return valid;
                },
            findRandomPath: function() {
                    console.log('frp called');
                    this.visited['1_1'] = 1; //add starting node to visited object
                    this.path.push(this.start);
                    while (!this.isEnd(this.path[this.path.length-1])) { 
                        var next = this.randomMove(this.path[this.path.length-1]);
                        console.log('nxt '+next);
                        var valid = this.validMove(next);
                        console.log('v is '+valid);
                        console.log('cpath is '+this.path.length);
                        if ( valid && this.anyValidPath(next)) {
                            this.path.push([next[0],next[1]]);
                            console.log('pth is: '+this.path);
                            this.visited[next[0]+'_'+next[1]] = 1;
                        }
                    }
                    console.log(this.path);
                    return this.path;
                }  
    };
};
