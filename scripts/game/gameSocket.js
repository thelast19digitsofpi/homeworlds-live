// gameSocket.js
//
// Creates the socket.io connection object for the games.

import io from 'socket.io-client';

const socket = io("/game", {
	// If it fails to reconnect after 10 attempts then something is wrong
	// we should probably just reload the page
	reconnectionAttempts: 10,
	reconnectionDelayMax: 20000,
});
console.log(location.pathname);
socket.emit("getGame", GAME_ID);
socket.on("disconnect", function(args) {
	console.error("SOCKET DISCONNECTED", arguments);
});

export default socket;