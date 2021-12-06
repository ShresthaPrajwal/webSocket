//initalize the soket instance in client side
let socket = io();

let display = document.getElementById('messages');
let form = document.getElementById('form');
let htmlroom = document.getElementById("current-roomname-txt");
let input = document.getElementById('input');

let userinfo = {};


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
socket.on('connect', ()=>{
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
    console.log(userinfo);
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