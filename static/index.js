//initalize the soket instance in client side
let socket = io();
let userinfo = {};
let constraints = { audio: true, video: false };
let miconstatus = false;
let browserstorage = {};
let display = document.getElementById('messages');
let form = document.getElementById('form');
let htmlroom = document.getElementById("current-roomname-txt");
let input = document.getElementById('input');
let mic = document.getElementById('micbutton');
let audiodiv = document.getElementById('speaker');
let roomsbutton = document.getElementById('roomdiv');

//we will take username and room name from browser
if (!localStorage.getItem("browserstorage")) {
  browserstorage.recentroom;
  browserstorage.userName;
  browserstorage.rooms = ["rooomone", "roomtwo", "roomthree"];
  userinfo.username = prompt("Enter a username: ");
  userinfo.username = userinfo.username + " :";
  browserstorage.userName = userinfo.username;
  browserstorage.rooms.push(prompt("Enter a room name: "));
  userinfo.room = browserstorage.rooms[0];
  recentroom = browserstorage.rooms[0];
  localStorage.setItem("browserstorage", JSON.stringify(browserstorage));
}
else {
  browserstorage = JSON.parse(localStorage.getItem("browserstorage"));
}

userinfo.username = browserstorage.userName;
userinfo.room = browserstorage.recentroom;

//create buttons in the sidebar  by reading from the database
//for now we will take rooms from localstorage
for( let i = 0; i < browserstorage.rooms.length; i++){
  let buttonid = document.createElement('button');
  buttonid.setAttribute('id', browserstorage.rooms[i]);
  buttonid.setAttribute('type', 'button');
  buttonid.textContent = browserstorage.rooms[i];
  roomsbutton.appendChild(buttonid);
}

//when the user clicks any one of the rooms
//we will connect to that room
roomsbutton.addEventListener('click', (e)=>{
  const id = e.target.id;
  browserstorage.recentroom = id;
  localStorage.setItem("browserstorage", JSON.stringify(browserstorage));
  location.reload();
})



//add id to the obj
socket.on('connect', () => {
  userinfo.socketId = socket.id;
})


//create a event saying a user wants to connect to a room
socket.emit('joinRoom', userinfo);

//edit the room name in html page
htmlroom.textContent = userinfo.room;

form.addEventListener('submit', (data) => {
  data.preventDefault();

  if (input.value) {
    userinfo.message = input.value;
    socket.emit('message', userinfo);
    input.value = '';
  }
})

socket.on('messageServer', (data) => {

  let item = document.createElement('div');

  if (data.socketId == socket.id) {
    data.username = "";
    item.style.marginLeft = "auto";
    item.style.marginRight = "1.5rem";
  }

  item.textContent = data.username + data.message;
  display.appendChild(item);

  window.scrollTo(0, document.body.scrollHeight);
})


socket.on('serverbroadcast', (userinfolocal) => {
  let item = document.createElement('div');
  item.textContent = userinfolocal.username + " has joined the room.";
  display.appendChild(item);

  window.scrollTo(0, document.body.scrollHeight);
})


//we will now record and send audio to other users
const record = () => {

  //found no way to stop the broadcast so this is a
  //cheap way to stop the mic broadcasting
  if (miconstatus == true) {
    location.reload();
  }

  miconstatus = true;

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(mediaStream => {

      let mediaRecorder = new MediaRecorder(mediaStream);

      mediaRecorder.onstart = (e) => {
        this.chunks = [];
      }
      mediaRecorder.ondataavailable = e => {
        this.chunks.push(e.data);
      }

      mediaRecorder.onstop = (e) => {

        let blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' });
        socket.emit('clientaudio', blob, userinfo.room);
      };

      mediaRecorder.start();
      //run the loop for mic
      interval = setInterval(() => {
        mediaRecorder.stop();
        mediaRecorder.start();
      },
        2500);

      // mediaRecorder.stop();
    }
    ).catch(err => {
      console.log(err);
    });
}
//we will catch the broadcasted audio here
socket.on('serveraudio', (buffer) => {
  console.log('audio is comming');
  let blob = new Blob([buffer], { 'type': 'audio/ogg; codecs=opus' });
  let audiodiv = document.createElement('audio');
  audiodiv.src = window.URL.createObjectURL(blob);
  audiodiv.play();
})


console.log(userinfo.room);