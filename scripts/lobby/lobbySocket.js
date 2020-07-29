// lobbySocket.js
//
// this is a bit simpler than the one for games

import io from 'socket.io-client';

const socket = io("/lobby");
socket.on("disconnect", function(args) {
	console.error("SOCKET DISCONNECTED", arguments);
});

export default socket;
