// socket.js
//
// Handles Socket.IO connections.


const {app, httpsServer} = require("./https.js");
const io = require("socket.io")(httpsServer);
const cookie = require("cookie");
const myUtil = require("./my-util.js");
const db = require("./database.js");

//console.warn(io);

async function checkSocketCookie(socket, next) {
	console.log("Begin Middleware");
	
	const cookies = cookie.parse(socket.request.headers.cookie);
	// authenticate user
	const session = cookies["hwl-session"];
	
	let auth = null;
	if (session) {
		try {
			const row = await myUtil.databaseCall(db, 'get', "SELECT * FROM users WHERE cookie = ?", [session]);
			if (row) {
				auth = row.username;
			}
		} catch (error) {
			console.log("SQL ERROR!");
			console.error(error);
		}
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
	
	console.log("End Middleware");
	
	next();
};

module.exports = {
	io: io,
	checkSocketCookie: checkSocketCookie,
};
