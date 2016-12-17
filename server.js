var http = require('http');
var socket = require('socket.io')();
var fs = require('fs');

//handles serving a client page
var clientHandler = function(req, res){
    fs.readFile(__dirname + '/client.html', function(err, data){
        if(err){
            res.writeHead(500);
            return res.end("ERROR: Failed to load client.html");
        }else{
            res.writeHead(200);
            res.end(data);
        }
    });
};

var app = http.createServer(clientHandler);
var io = socket.listen(app);

var ticker;
var broadcasting = false;

var tick = function(){
    var now = Date.now();
    console.log(now);
    var packet = {msg:"It is now "+now};
    socket.emit('broadcast', packet);
}

var start = function(time){
    time=parseInt(time);
    if(!broadcasting && typeof(time)==='number')
    {
        console.log("Starting Interval");
        ticker = setInterval(function(){
            tick();
        }, time);
        broadcasting = true;
    }else{
        console.log("Already Started");
    }
}

var stop = function(){
    if(broadcasting){
        console.log("Stoping Interval");
        clearInterval(ticker);
        broadcasting = false;
    }else{
        console.log("Already Stopped");
    }
}

io.sockets.on('connection', function(socket){
    start(1000);

    socket.on('submit', function(data){
        switch(data.cmd){
            case "START":
                start(data.val);
                break;
            case "STOP":
                stop();
                break;
            default:
                console.log("Recieved "+data.cmd);
                break;
        }
    });


});

app.listen(8080);
console.log('Server Running')