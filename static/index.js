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
let profilename = document.getElementById('Profilename');
let createroom = document.getElementById('createroom');

//we will take username and room name from browser
if (!localStorage.getItem("browserstorage")) {
  browserstorage.recentroom;
  browserstorage.userName;
  browserstorage.usernamewithoutcolon;
  browserstorage.rooms = ["Node-Discussion", "Java-Discussion", "Music-Streaming","Gaming-Room", "We-are-Valo",
   "Naughty-Group","Not-safe-for-work", "movie-discussion", "chillingparty","health-services", "Private-Room", "hostel-boys"];
  userinfo.username = prompt("Enter a username: ");
  browserstorage.usernamewithoutcolon = userinfo.username;
  userinfo.username = userinfo.username + " :";
  browserstorage.userName = userinfo.username;
  userinfo.room = browserstorage.rooms[0];
  browserstorage.recentroom = browserstorage.rooms[0];
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
  let index = browserstorage.rooms.indexOf(id);
  let item = browserstorage.rooms.splice( index, 1);
  browserstorage.rooms.unshift(item[0]);
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
//edit the username in page
htmlroom.textContent = userinfo.room;
profilename.innerHTML = browserstorage.usernamewithoutcolon;

//create a new room
createroom.addEventListener('click', ()=>{
  let buttonid = document.createElement('button');
  let newroom = prompt("Enter a new room name: ");
  if(newroom!=null){
  browserstorage.rooms.unshift(newroom);
  buttonid.setAttribute('id', browserstorage.rooms[0]);
  buttonid.setAttribute('type', 'button');
  buttonid.textContent = browserstorage.rooms[0];
  roomsbutton.insertBefore(buttonid, roomsbutton.firstChild);
  }
})

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

  display.scrollTo(0, display.scrollHeight);
})


socket.on('serverbroadcast', (userinfolocal) => {
  let item = document.createElement('div');
  item.textContent = userinfolocal.username + " has joined the room.";
  display.appendChild(item);

  display.scrollTo(0, display.scrollHeight);
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

//for responsive design
let screenWidth = screen.width;
let item1 = document.getElementById('item1');
let item2 = document.getElementById('item2');
let item3 = document.getElementById('item3');
let footer =document.getElementById('footer');
const hamburger = document.getElementById("ham");
hamburger.addEventListener('click',()=>{
  if(screenWidth<755){
  item1.style.display="none";
  item3.style.display="none";
  item2.style.display="block";
  item2.style.width="100%";
  // footer.style.overflowY="none";
  }
})
