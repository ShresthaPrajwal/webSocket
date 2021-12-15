/////////////////////////////////////////////////////
///////////////////////////////////////////////////
//get all global variables
let socket = io();
let constraints = { audio: true, video: false };
let miconstatus = false;
let browserdata = {};
let display = document.getElementById('messages');
let form = document.getElementById('form');
let htmlroom = document.getElementById("current-roomname-txt");
let input = document.getElementById('input');
let mic = document.getElementById('micbutton');
let audiodiv = document.getElementById('speaker');
let roomsbutton = document.getElementById('roomdiv');
let profilename = document.getElementById('Profilename');
let createroom = document.getElementById('createroom');
let loginform = document.getElementById('userloginform');
let signinform = document.getElementById('usersigninform');
let nextpagelogin = document.getElementById('nextpagelogin');
let nextpagesignin = document.getElementById('nextpagesignup');
let loginclick = document.getElementById('loginButton');
let signinclick = document.getElementById('signinButton');
let loginusername = document.getElementById('loginUsername');
let loginpassword = document.getElementById('loginpassword');
let warning = document.getElementById('warning1');
let warning2 = document.getElementById('warning2');
let container = document.getElementById('containers');
let usernamediv = document.getElementById('signinusername');
let emaildiv = document.getElementById('signinemail');
let passdiv1 = document.getElementById('signin1password');
let passdiv2 = document.getElementById('signin2password');
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
//create members for browserdata
browserdata.username;
browserdata.password;
browserdata.recentroom;
browserdata.rooms = [];


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
const validateuser = async (usr, pass) => {

    await socket.emit('validateusr', { usr, pass }, (response) => {
        if (response.valid == true) {
            browserdata.username = response.usr;
            browserdata.password = response.pass;

            //here the rooms order has to be maintained
            //do this portoin later
            browserdata.rooms = response.rooms;
            browserdata.recentroom = browserdata.rooms[0];
            localStorage.setItem("browserdata", JSON.stringify(browserdata));

            /////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////
            ///now remove the login sign up page
            loginform.style.display = 'none';
            container.style.filter = 'none';



            //write roomname
            htmlroom.textContent = browserdata.recentroom;
            //write profile name
            profilename.innerHTML = browserdata.username;
            //load the sidebar
            siderooms();


        } else {
            warning.textContent = response.message;
            loginform.style.display = 'flex';
            container.style.filter = 'blur(5px)';
        }
    });
}


////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
const newuseradd = async (usr, pass, email) => {

    await socket.emit('newuseradd', { usr, pass, email }, (response) => {
        console.log(response, usr, pass, email);
        if (response.valid == true) {
            ///////////////////////////////////
            //remove the sign in page
            signinform.style.display = 'none';
            loginform.style.display = 'flex';
        } else {
            warning2.textContent = response.message;
        }
    })
}


///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///check localstorage for username and password
if (!localStorage.getItem("browserdata")) {

    //////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    //if no credentials found show the loginpage
    loginform.style.display = 'flex';
    container.style.filter = 'blur(5px)';
    signinform.style.display = 'none';


    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ///ask for username and password for login
    loginclick.addEventListener('click', (e) => {

        const username = loginusername.value;
        const password = loginpassword.value;

        if (password == null || password == "" || username == null || username == " ") {
            location.reload();
        }

        /////////////////////////////////////////////////
        /////////////////////////////////////////////////
        //check in the database if valid
        validateuser(username, password);

    });

    ////////////////////////////////////////////////////
    ///////////////////////////////////////////////////
    //get signin details
    signinclick.addEventListener('click', (e) => {
        let signinusrname = usernamediv.value;
        let signinemail = emaildiv.value;
        let pass1 = passdiv1.value;
        let pass2 = passdiv2.value;


        if ((pass1 == pass2) && (signinusrname != " ")) {
            ////////////////////////////////////////////////
            ////////////////////////////////////////////////
            newuseradd(signinusrname, pass1, signinemail);

        } else {
            warning2.textContent = "Please try again!!";
        }
    });


    nextpagesignin.addEventListener('click', (e) => {
        signinform.style.display = 'flex';
        loginform.style.display = 'none';
    });


    nextpagelogin.addEventListener('click', (e) => {
        loginform.style.display = 'flex';
        signinform.style.display = 'none';
    })


} else {
    browserdata = JSON.parse(localStorage.getItem("browserdata"));
    validateuser(browserdata.username, browserdata.password);
}


///////////////////////////////////////////////////////////
//the validation part has been completed


//add rooms to the sidebar
const siderooms = () => {

    for (let i = 0; i < browserdata.rooms.length; i++) {
        let buttonid = document.createElement('button');
        buttonid.setAttribute('id', browserdata.rooms[i]);
        buttonid.setAttribute('type', 'button');
        buttonid.textContent = browserdata.rooms[i];
        roomsbutton.appendChild(buttonid);
    }

}

//connect to a room for messaging
roomsbutton.addEventListener('click', (e) => {
    console.log('join a room please');
    const id = e.target.id;
    browserdata.recentroom = id;
    let index = browserdata.rooms.indexOf(id);
    let item = browserdata.rooms.splice(index, 1);
    browserdata.rooms.unshift(item[0]);
    localStorage.setItem("browserdata", JSON.stringify(browserdata));
    socket.emit("joinroom", id);

    //now clear all the messages and change room name
    display.innerHTML = "";
    htmlroom.textContent = id;
});


//load messges for the room
socket.on('pastmsg', (sender, message) => {

    let item = document.createElement('div');
    if (sender == browserdata.username) {
        sender = " ";
        item.style.marginLeft = "auto";
        item.style.marginRight = "1.5rem";
    } else {
        sender = sender + " : ";
    }

    item.textContent = sender + message;
    display.insertBefore(item, display.firstChild);
    display.scrollTo(0, display.scrollHeight);
})

//create a new room
createroom.addEventListener('click', async () => {

    ///for temporary we will use prompt
    let roomname = prompt("Enter a new room name: ");
    let user = browserdata.username;

    if (roomname != null) {
        await socket.emit('createnewroom', { user, roomname }, (response) => {
            if (response.valid == true) {
                browserdata.rooms.unshift(response.roomname);
                localStorage.setItem("browserdata", JSON.stringify(browserdata));
                roomsbutton.innerHTML = "";
                siderooms();
            } else {
                console.log(response);
            }
        })

    }
});


//send messages to a room
form.addEventListener('submit', (data) => {
    data.preventDefault();

    if( input.value ){
        let message = input.value;
        let sender = browserdata.username;
        socket.emit('message', {sender, message});
        input.value = '';
      }
    });


//listen to messges in a room
socket.on('receivemessge', (data) => {
    let item = document.createElement('div');

    if ( data.sender == browserdata.username) {
      data.sender = "";
      item.style.marginLeft = "auto";
      item.style.marginRight = "1.5rem";
    }else{
        data.sender = data.sender + " : ";
    }
  
    item.textContent = data.sender + data.message;
    display.appendChild(item);
    display.scrollTo(0, display.scrollHeight);
})
































































//   // Change room
// socket.on("changeRoom", (room) => {
//     socket.in(defaultRoom).broadcast.emit("leaveRoom", {text: "--BROADCAST-- User left room"});
//     socket.leave(defaultRoom);
//     socket.room = room;
//     socket.join(room);
//     socket.emit("roomChangeNotification", {text: "--ROOM-- You changed room"});
//     socket.in(room).broadcast.emit("OnewUserNotification", {text: "--ROOM_ALL-- New user joined"});
//   });