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
let loginusername = document.getElementById('loginUsername');
let loginpassword = document.getElementById('loginpassword');
let loginclick = document.getElementById('loginButton');
let signinclick = document.getElementById('signupButton');
let warning = document.getElementById('loginmsg');
let container = document.getElementById('containers');


////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
//create members for browserdata
browserdata.username;
browserdata.password;






////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
const validateuser = async (usr, pass) => {

    await socket.emit('validateusr', { usr, pass }, (response) => {
        if (response.valid == true) {
            browserdata.username = response.username;
            browserdata.password = response.password;
            localStorage.setItem("browserdata", JSON.stringify(browserdata));

            /////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////
            ///now remove the login sign up page
            loginform.style.display = 'none';
            container.style.filter = 'none';

        } else {
            warning.textContent = "We cannot authorize you at the moment.. <br> Enter your username and password.";
        }
    });
}

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///check localstorage for username and password
if (!localStorage.getItem("browserdata")) {
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ///ask for username and password
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

    })


} else {
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    //check in the database if valid
    browserdata = JSON.parse(localStorage.getItem("browserdata"));
    validateuser(browserdata.username, browserdata.password);
}

