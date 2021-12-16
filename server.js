const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');


require("dotenv").config();
const PORT = process.env.PORT || 3333;

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const Schema = mongoose.Schema;
app.use(express.static('static'));

/////////////////////////////////////////////////////////////////////
//connect to the database
const messagedatabase = mongoose.createConnection(process.env.URI1, { useNewUrlParser: true }, () => {
    console.log('connected to messagedatabase');
});
const userdatabase = mongoose.createConnection(process.env.URI2, { useNewUrlParser: true }, () => {
    console.log('connected to userdatabase');
});


/////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
//schema

const userSchema = new Schema({
    name: { type: String },
    text: { type: String }
});

//schema for userdetails
const userdetails = new Schema({
    name: { type: String },
    pass: { type: String },
    email: { type: String },
    rooms: { type: Array },
    created: { type: Array },
})
///////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////


io.on('connection', (socket) => {

    ////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    //sending rooms details to that user
    socket.on('validateusr', (data, response) => {
        let responsedata = {};
        responsedata.valid = false;

        const schema = userdatabase.model('Userdetails', userdetails);
        schema.findOne({ name: data.usr }).then(item => {

            if (item != null) {

                if (item.pass == data.pass) {
                    responsedata.valid = true;
                    responsedata.usr = data.usr;
                    responsedata.pass = data.pass;
                    responsedata.rooms = item.rooms;
                } else {
                    responsedata.message = "Invalid Credentials";
                }
            } else {
                responsedata.message = "No such username present!";
            }
            response(responsedata);

        })
    })


    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    //when signin form is clicked
    socket.on('newuseradd', (data, response) => {
        let responsedata = {};

        responsedata.valid = false;
        const schema = userdatabase.model('Userdetails', userdetails);

        schema.findOne({ name: data.usr }).then(
            item => {
                if (item == null) {
                    schema.findOne({ email: data.email }).then(
                        item2 => {
                            if (item2 == null) {
                                responsedata.valid = true;
                                let savethisdata = {
                                    name: data.usr,
                                    pass: data.pass,
                                    email: data.email,
                                    rooms: [],
                                    created: []
                                };

                                const save = new schema(savethisdata);
                                save.save().then(
                                    result => {
                                        response(responsedata);
                                    }
                                ).catch(
                                    err => {
                                        console.log(err);
                                    }
                                )

                            } else {
                                responsedata.message = "Email already in use...";
                                response(responsedata);
                            }
                        }
                    )
                } else {
                    responsedata.message = "Username already exists..";
                    response(responsedata);

                }
            }
        )
    })

    //when the user wants to join certain room
    socket.on('joinRoom', (rooms) => {
        socket.leave(rooms.oldroom);
        socket.join(rooms.newroom);

        ///get messages of that room
        const schema = messagedatabase.model(rooms.newroom, userSchema);
        schema.find().limit(5).sort({ $natural: -1 }).then(
            items => {
                items.forEach(e => {
                    io.to(rooms.newroom).emit('pastmsg', e.name, e.text);
                })
            }
        )

    })


    //when the user wants to create new room
    socket.on('createnewroom', (data, response) => {
        let responsedata = {};
        responsedata.valid = false;

        //check if that room already exists
       // const schema = messagedatabase.model(data.roomname, userSchema);
        messagedatabase.db.listCollections({'name': data.roomname}).toArray((err, collectionnames)=> {
            if( err ){
                console.log(err);
            }
            if( collectionnames.length == 0){
                responsedata.valid = true;
                messagedatabase.db.createCollection(data.roomname)
                .then( ()=>{
                    responsedata.roomname = data.roomname;
                    const schema = userdatabase.model('Userdetails', userdetails);

                    //update the list of joined room
                    schema.updateOne({name: data.user}, {
                        $addToSet: {rooms: [data.roomname]}},
                        (err, res) =>{
                            if( err ){
                                console.log(err);
                            }
                        }
                    )

                    //update the list of created room
                    schema.updateOne({name: data.user}, {
                        $addToSet: {created: [data.roomname]}},
                        (err, res) =>{
                            if( err ){
                                console.log(err);
                            }
                        }
                    )
                    
                    response(responsedata);
                }
                ).catch(
                    err => {console.log(err);}
                )
            }else{
                responsedata.message = "room already exists";
                response(responsedata);
            }
            
        })
    })

    ////////////////////////////////////////////////////////////////////
    //when a user sends message in a room
    socket.on('message', (data) => {
        io.to(data.room).emit('receivemessage', data);

        /////////////////////////////////////////////////////////////
        //send message to database as room as collection name
        const schema = messagedatabase.model(data.room, userSchema);
        const dataschema = { name: data.sender, text: data.message };
        const todatabase = new schema(dataschema);
        todatabase.save()
            .then(e => {
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
    console.log(`server has started in port ${PORT}`);
});