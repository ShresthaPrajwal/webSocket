//let's test if the server works 
const express = require('express');
const http = require('http');

//we will use socket.io for two way server client communication
const { Server } = require('socket.io');
//io({transports: ['websocket'], upgrade: false});

//now create each instants
const app = express();
const server = http.createServer(app);
//since socket io works with http modules only

//connect socket with our existing server
const io = new Server(server);

//crete a simple route
app.get('/', (req, res)=>{
    //we will now server a html page at this route
    //html is in the same directory
    res.sendFile(__dirname + '/index.html');
});

//now check for connection event
//it means find when someone does new get request to the server
io.on('connection', (socket)=>{
    console.log(`user with id: ${socket.id} has joined.`);

    socket.on('disconnect', (id) =>{
        console.log(`user with id :${socket.id}  has disconnected...`);
    });

    //now lets listen for message event
    socket.on('message', (data) => {
        
        //send this message to all users
        io.emit('messageServer', data);
    })

    //now we will broadcast the message to all the users
    //there is broscast method
});


//now listen on port 5555
server.listen(5555, ()=>{
    console.log("server has been started at port 5555");
});