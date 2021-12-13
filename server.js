const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');


require("dotenv").config();
const uri = process.env.URI;
const PORT = process.env.PORT || 3333;

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const Schema = mongoose.Schema;
app.use(express.static('static'));

/////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

//now we will connect to database
mongoose
  .connect(process.env.URI, { useNewUrlParser: true })
  .then(() => console.log('DB Connected'));

mongoose.connection.on('error', (err) => {
  console.log(`DB connection error: ${err.message}`);
});

    /////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    //schema

    const userSchema = new Schema({
        name: { type: String },
        text: { type: String }
    });

    ///////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////


    io.on('connection', (socket) => {


        ////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////
        //sending rooms details to that user












        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        //when the user wants to join certain room
        socket.on('joinRoom', (userinfo) => {
            socket.join(userinfo.room);
            socket.broadcast.to(userinfo.room).emit('serverbroadcast', userinfo);
        })

        /////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        //when a user sends message in a room
        socket.on('message', (userinfo) => {
            io.to(userinfo.room).emit('messageServer', userinfo);

            //////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////
            //send message to database as room as collection name
            const schema = mongoose.model( userinfo.room, userSchema);
            const data = { name: userinfo.username, text: userinfo.message };
            const todatabase = new schema(data);
            todatabase.save()
                .then(e => {
                    console.log(e);
                })
                .catch(err => console.log(err));
        })


        //////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////
        //when a user wants to send audio
        socket.on('clientaudio', (audioblob, room) => {
            socket.broadcast.to(room).emit('serveraudio', audioblob);
        })


    });


    ///////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////
    //finally start the server
    server.listen(PORT, () => {
        console.log(`server has started in port ${PORT}`);});