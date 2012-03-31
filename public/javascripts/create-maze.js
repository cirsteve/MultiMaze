$('#create').click(function(e) {
    e.preventDefault();
    var form = $('#maze_config_form').serialize();
    console.log(form);
    var jqxhr =  $.post('create-maze', form, function(data) { 
        })

    .success( function(data) { 
            console.log('create response received');
            var socket = io.connect('http://localhost');
            socket.emit('join-room', data);
                socket.on(data.name+'_init', function(data) {
                    console.log('socket return data.x is'+data.x);
                    var width = data.x * data.bs + 20
                      , height = data.y * data.bs + 20;
                    $('#myCanvas').attr('width', width + "px")
                              .attr('height', height + "px")
                              .show('slow');
                    var canvas = document.getElementById("myCanvas")
                      , context = canvas.getContext("2d")
                      , ctxArc = canvas.getContext("2d")
                      , ctxGrid = canvas.getContext("2d")
                      , ctxWalls = canvas.getContext("2d")
                      , ctxArcCover = canvas.getContext("2d");
                    data.offset = 10;
                    console.log(data.offset);
                    var arcOffset = {x:data.offset + data.bs / 2, y:data.offset + data.y * data.bs - data.bs / 2}; //location of marker at start 
                    drawBase(context, data);
                    drawGrid(ctxGrid, data);
                    drawWalls(ctxWalls, data, arcOffset);
                    drawArc(ctxArc, arcOffset);
                    $(window).keydown(function(e) {
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
                        moveArc(e.which, arcOffset, moveMap[e.which], data, ctxArcCover, ctxArc);
                    }); 
                })
    })
    .error( function(data) { });
}); 
