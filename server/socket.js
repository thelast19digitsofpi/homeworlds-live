// socket.js
//
// Handles Socket.IO connections.


const {app, httpsServer} = require("./https.js");
const io = require("socket.io")(httpsServer);
const cookieModule = require("cookie");
const myUtil = require("./my-util.js");
const db = require("./database.js");
const {authenticateCookie} = require("./accounts.js");

//console.warn(io);

async function checkSocketCookie(socket, next) {
	//console.log("Begin Middleware");
	
	const cookies = cookieModule.parse(socket.request.headers.cookie);
	// authenticate user
	const session = cookies["hwl-session"];
	
	let auth = null;
	if (session) {
		auth = await authenticateCookie(session);
	}
	
	// Auth is a username or null
	if (auth === null) {
		// You are not supposed to be here! Disconnect.
		socket.disconnect(true);
		console.error("Unauthenticated Socket!");
		return;
	} else {
		socket._username = auth;
	}
	console.log("Connection:", socket._username);
	
	next();
};

module.exports = {
	io: io,
	checkSocketCookie: checkSocketCookie,
};
