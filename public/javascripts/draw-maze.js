
var getCanvas = function(options) {
    var canvas = document.getElementById("myCanvas")
            , context = canvas.getContext("2d")
            , ctxArc = canvas.getContext("2d")
            , ctxGrid = canvas.getContext("2d")
            , ctxtWalls = canvas.getContext("2d")
            , ctxArcCover = canvas.getContext("2d")
            , arcOffset = {x:options.offset + options.bs / 2, y:options.offset + options.y * options.bs - options.bs / 2}; //location of marker at start
            return canvas;
};

var drawGrid = function(context, options) {
    var   xStart = options.offset
        , yStart = options.offset
        , xEnd = options.x * options.bs + options.offset
        , yEnd = options.y * options.bs + options.offset
        , xCoord = xStart + options.bs
        , yCoord = yStart + options.bs;

    //draw horizontal lines
    context.moveTo(options.offset,options.offset);
    while (yCoord < yEnd) {
        context.moveTo(xStart, yCoord);
        context.lineTo(xEnd, yCoord);
        context.stroke();
        yCoord += options.bs;
    }
  
    //draw vertical lines
    context.moveTo(options.offset, options.offset);
    while (xCoord < xEnd) {
        context.moveTo(xCoord, yStart);
        context.lineTo(xCoord, yEnd);
        context.stroke();
        xCoord += options.bs;
    }
};

var drawBase = function(context, options) {
    context.moveTo(options.offset, options.offset);
    context.lineTo(options.offset, options.y * options.bs + options.offset);
    context.lineWidth = 1;
    context.stroke();

    context.moveTo(parseInt(options.bs, 10) + parseInt(options.offset, 10), options.y * options.bs + options.offset);
    context.lineTo((options.x * options.bs) + options.offset, options.y * options.bs + options.offset);
    context.stroke();

    context.lineTo((options.x * options.bs) + options.offset, options.offset);
    context.stroke();

    context.moveTo((options.x - 1) * options.bs + options.offset, options.offset)
    context.lineTo(options.offset, options.offset);
    context.stroke();

    //draw gridlines
    context.beginPath();
    context.strokeStyle = "#B0C4DE";
    drawGrid(context, options.x, options.y, options.bs, options.offset);
};

        //given a wallsObj draws the wall
var drawWalls = function(context, options, arcOffset) {  
    context.beginPath();
    context.strokeStyle = 'red';
    for (key in options.wallObj) {
        drawWall(key.split('_'), context, options.bs, arcOffset);
    }
};

//helper function for wallsObj that actually draws the line
var drawWall = function(wallArr, context,  wLength, offset) {
    console.log('drawwall called '+wallArr[0]+' offsetx '+offset.x);
    woffset = {x: offset.x - wLength/2, y:  offset.y + wLength/2};
    //determine if y-axis wall
    if (wallArr[0].indexOf('.') === -1) {
        context.moveTo(woffset.x + ((wallArr[0] - 1) * wLength),
                            woffset.y - (parseInt(wallArr[1], 10) * wLength));
        context.lineTo(woffset.x + (wallArr[0] * wLength),
                            woffset.y - (parseInt(wallArr[1], 10) * wLength));
    }
    else if (wallArr[1].indexOf('.') === -1) {
        context.moveTo(woffset.x + (parseInt(wallArr[0], 10) * wLength),
                            woffset.y - ((wallArr[1] -1) * wLength));
        context.lineTo(woffset.x + (parseInt(wallArr[0], 10) * wLength),
                            woffset.y - (wallArr[1] * wLength));
    }
    context.stroke();
};

var drawArc = function (ctxArc, options) {
    ctxArc.beginPath();
    ctxArc.arc(options.x,options.y,5,0,2*Math.PI,false);
    ctxArc.fillStyle = "#8ED6FF";
    ctxArc.fill();
    ctxArc.lineWidth = 2;
    ctxArc.strokeStyle = "black";
    ctxArc.stroke();
};

var coorToCan = function(coObj, options) {
  return [(coObj.x - 1) * (1.5 * options.bs + options.offset),(options.y * options.bs - options.bs/2 + options.offset) - ((coObj.y - 1) * options.offset)];
};

var returnWall = function(prev, next) {
        return (prev < next) ? (prev + .5) : (next + .5);
};

var canToCoor = function(canObj, options) {
return [(canObj.x + (options.bs/2 - options.offset)) / options.bs, (options.y * options.bs + (options.bs / 2 + options.offset) - canObj.y) / options.bs];
};

//check if arc movement is valid, i.e. not crossing a wall
var validArcMove = function (prevArr, nextArr, options) {
    var x = prevArr[0] === nextArr[0] ? prevArr[0] : returnWall(prevArr[0], nextArr[0]); 
    var y = prevArr[1] === nextArr[1] ? prevArr[1] : returnWall(prevArr[1], nextArr[1]);
    return x >= 1 && x <= options.x && y >= 1 && y > options.y && !options.wallObj.hasOwnProperty(x+'_'+y);
};

var coverArc = function(ctx, offsObj, options) {
ctx.fillStyle = "#ffffff";
ctx.fillRect(offsObj.x - (options.bs/2 - 3), offsObj.y - (options.bs/2 - 3), options.bs-5, options.bs-5);
};

var count = 0;
var moveArc = function(key, offsObj, func, options, ctx, ctx2) {
    var move = false;
    var current = {x:offsObj.x,y:offsObj.y};
    var next = func.call({x:offsObj.x, y:offsObj.y});
    if (validArcMove(canToCoor(current, options), canToCoor(next, options),options)) {     
        console.log('arc move is true');
        move = true;
        coverArc(ctx, offsObj, options);
        switch(key) {
            case 37:
                offsObj.x -= options.bs;
                break;
            case 38:
                offsObj.y -= options.bs;
                break;
            case 39:
                offsObj.x += options.bs;
                break;
            case 40:
                offsObj.y += options.bs;
                break;
        }
        drawArc(ctx2,offsObj);
        count += 1;
        $('#count').text(count);
        //if (isEnd(canToCoor(next, options), ending)) {
        //    alert('You Won, You Deserve A Cookie!!!');
        //} 
    }
    return move;
};
