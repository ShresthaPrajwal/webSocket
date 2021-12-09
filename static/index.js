//initalize the soket instance in client side
let socket = io();
let userinfo = {};
let constraints = { audio: true, video: false };
let display = document.getElementById('messages');
let form = document.getElementById('form');
let htmlroom = document.getElementById("current-roomname-txt");
let input = document.getElementById('input');
let mic = document.getElementById('micbutton');
let audiodiv = document.getElementById('speaker');

userinfo.username = localStorage.getItem("username");
//trying to setup username in local storage
if (!userinfo.username) {
  userinfo.username = prompt("Enter a username: ");
  userinfo.username = userinfo.username + " :";
  localStorage.setItem("username", userinfo.username);
}

//prompt for room name
userinfo.room = prompt("Enter the room name: ");

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
   const record = ()=> { navigator.mediaDevices
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
