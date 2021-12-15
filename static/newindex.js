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
let warning = document.getElementById('loginmsg');
let warning2 = document.getElementById('warning2');
let container = document.getElementById('containers');
let emaildiv = document.getElementById('signinemail');
let usernamediv = document.getElementById('signinusername');
let passdiv1 = document.getElementById('signin1password');
let passdiv2 = document.getElementById('signin2password');
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
    /////////////////////////////////////////////////////
    //get user detalis for signup
    nextpagesignin.addEventListener('click', (e)=>{
        signinform.style.display = 'flex';
        loginform.style.display = 'none';

        /////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        //listen for submit of data
        signinclick.addEventListener('click', (e)=>{
            const signinusrname = usernamediv.value;
            const signinemail = emaildiv.value;
            const pass1 = passdiv1.value;
            const pass2 = passdiv2.value;

            console.log(signinusrname, signinemail, pass1);
            if( true ){
                ////////////////////////////////////////////////
                ////////////////////////////////////////////////
                //send details to the server for further processing
                socket.emit('newuseradd', {signinusrname, signinemail}, ( response ) => {
                    console.log(response);
                })

            }else{
                warning2.value = "Passwords doesn't match";
            }
        });
    })

    nextpagelogin.addEventListener('click', (e)=>{
        loginform.style.display = 'flex';
        signinform.style.display = 'none';
    })


} else {
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    //check in the database if valid
    browserdata = JSON.parse(localStorage.getItem("browserdata"));
    validateuser(browserdata.username, browserdata.password);
}

