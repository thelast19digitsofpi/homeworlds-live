// lobby.js
// 
// Server-side script. There probably is a client script of the same name...

const {app} = require("./https.js");
const {io, checkSocketCookie} = require("./socket.js");
const {promiseTimeout} = require("./my-util.js");
const Player = require("./player.js");
const GameRoom = require("./lobbyGameRoom.js");


// Lobby.
function Lobby() {
	// Players are an object {username: ..., socket: ...}
	// because sockets are stored, please be careful
	this.players = [];
	this.gameRooms = [];
	// note: should I perhaps save this to the database?
	this.gameRoomID = 1;
}
// For the client's request of active players and such
Lobby.prototype.whosOnline = function() {
	// Cannot just send the player array because it contains sockets
	let playerList = [];
	for (let i = 0; i < this.players.length; i++) {
		playerList.push({
			// the disconnect timer thing is not useful
			username: this.players[i].username,
			connected: this.players[i].connected,
		});
	}
	return playerList;
};
// Converts the room list into something useable
Lobby.prototype.getRoomList = function() {
	const rooms = [];
	for (let i = 0; i < this.gameRooms.length; i++) {
		// send id, numPlayers, players (as username array), invitedPlayers (as username array), and options
		const room = this.gameRooms[i];
		rooms.push({
			id: room.id,
			numPlayers: room.numPlayers,
			players: room.players,
			invitedPlayers: room.invitedPlayers,
			options: room.options,
		});
	}
	return rooms;
};
// Self-explanatory. Returns null if not found.
Lobby.prototype.getRoomById = function(givenID) {
	for (let i = 0; i < this.gameRooms.length; i++) {
		const room = this.gameRooms[i];
		if (room.id === givenID) {
			return room;
		}
	}
	return null;
}

// Gets the Player associated with a username.
// Returns null if not found.
Lobby.prototype.getPlayerByUsername = function(username) {
	for (let i = 0; i < this.players.length; i++) {
		if (this.players[i].username === username) {
			return this.players[i];
		}
	}
	return null;
};
// When player enters the lobby
Lobby.prototype.onPlayerJoin = function(newPlayer) {
	if (this.players.indexOf(newPlayer) !== -1) {
		console.log("Warning: Player is already in the lobby");
		return false;
	}
	this.players.push(newPlayer);
};
// Pass a specific game room to indicate the player left to join that game
// or null/undefined/nothing if they disconnect
Lobby.prototype.onPlayerLeave = function(player, gameRoom) {
	// Note: I think I want to clear them from game rooms even if they are not in players.
	// This might help re-stabilize if somehow they vanish from .players or something.
	
	// Remove them from this.players, if they are present.
	const pIndex = this.players.indexOf(player);
	let notFound = false;
	if (pIndex === -1) {
		console.log("[Lobby.onPlayerLeave] Player leaves without being in this.players");
		notFound = true;
	} else {
		this.players.splice(pIndex, 1);
	}
	
	// Now remove them from any rooms
	for (let i = 0; i < this.gameRooms.length; i++) {
		const thisRoom = this.gameRooms[i];
		// If we passed in a game room, exclude that one from search (just to be safe)
		if (thisRoom !== gameRoom) {
			// remove them
			if (thisRoom.isPlayerIn(player)) {
				thisRoom.onPlayerLeave(player);
				// I hope this never happens
				// but if it does I want to know about it!!
				if (notFound) {
					console.warn("[Lobby.onPlayerLeave] SERIOUS PROBLEM: Player leaves, not in this.players, but was in a game room!");
				}
			}
		}
	}
	
	// Finally, erase all abandoned rooms
	this.cleanup();
};
// Cleans up by removing all rooms that are abandoned.
Lobby.prototype.cleanup = function() {
	for (var i = this.gameRooms.length - 1; i >= 0; i--) {
		const room = this.gameRooms[i];
		if (room.players.length === 0) {
			this.gameRooms.splice(i, 1);
		}
	}
};
// When you connect, either make a new player or reconnect an existing one
Lobby.prototype.onSocketConnect = function(socket) {
	for (let i = 0; i < this.players.length; i++) {
		if (this.players[i].username === socket._username) {
			// match!
			this.players[i].onReconnect();
			return;
		}
	}
	// this really feels like a "for-else" block
	// but technically "for-else" and "while-else" would mean something totally different
	const newPlayer = new Player(socket._username);
	socket.join("player-" + newPlayer.username);
	this.onPlayerJoin(newPlayer);
};
Lobby.prototype.onSocketDisconnect = function(socket) {
	const username = socket._username;
	for (let i = 0; i < this.players.length; i++) {
		if (this.players[i].username === socket._username) {
			// match!
			this.players[i].onDisconnect(this);
			return;
		}
	}
	// There is nothing else to do. Altho this situation is quite weird.
	console.warn("[Lobby#onSocketDisconnect] Username not found...");
};

// 3... 2... 1... Launch!
Lobby.prototype.startGame = function(gameRoom) {
	if (gameRoom.canStartForReal()) {
		
	}
};

const gameLobby = new Lobby();

app.get("/lobby", function(req, res) {
	// Eject anyone not authenticated!
	if (!res.locals.render.userInfo || !res.locals.render.userInfo.loggedIn) {
		return res.redirect("/login");
	}
	
	return res.render("lobby", res.locals.render);
});




const ioLobby = io.of("/lobby");
ioLobby.use(checkSocketCookie);


function sendUpdate(socket) {
	socket.volatile.emit("updateResponse", {
		whosOnline: gameLobby.whosOnline(),
		gameRooms: gameLobby.gameRooms,
	});
}

ioLobby.on("connection", function onSocketConnect(socket) {
	console.log("Connection to lobby!");
	const thisUsername = socket._username;
	if (!thisUsername) {
		console.error("SeriousProblem: NoUsername");
	}
	
	// Check to see if a player by that username is in the lobby.
	gameLobby.onSocketConnect(socket);
	
	socket.on("updatePlease", function() {
		sendUpdate(socket);
	});
	
	socket.on("createGame", function onCreateGame(data) {
		console.log("Creating Game Room!");
		console.log(data);
		// simple validation
		if (data.isTimed) {
			// NOTE: Zero minutes is a legitimate time control (i.e. only increment/delay)
			if (data.tcMinutes < 0 || data.tcMinutes !== Math.round(data.tcMinutes)) {
				socket.emit("createGameError", {
					type: "tcMinutes",
					message: "Time control minutes must be a non-negative integer.",
				});
				console.log("wrong number of minutes");
				return;
			}
			
			if (data.tcSeconds < 0 || data.tcSeconds !== Math.round(data.tcSeconds)) {
				socket.emit("createGameError", {
					type: "tcSeconds",
					message: "Time control seconds must be a non-negative integer.",
				});
				console.log("wrong number of seconds");
				return;
			}
			console.error("NOTE: NEEDS MORE VALIDATION");
		}
		// TODO: better version!
		if (!(data.numPlayers >= 2 && data.numPlayers <= /* 4 */ 2)) {
			socket.emit("createGameError", {
				type: "numPlayers",
				message: "Invalid number of players. Currently only 2 players is supported."
			});
			return;
		}
		
		// Invited Players: we have an array of usernames and need an array of Players
		const invitedPlayers = [];
		if (data.invitedPlayers) {
			for (let i = 0; i < data.invitedPlayers.length; i++) {
				const username = data.invitedPlayers[i];
				const player = gameLobby.getPlayerByUsername(username);
				// Make sure the player exists, and is not the sender!
				if (player && player.username !== thisUsername) {
					invitedPlayers.push(player);
				}
			}
		}
		
		const newRoom = new GameRoom(
			gameLobby.gameRoomID,
			data.numPlayers,
			invitedPlayers,
			{
				// Options object.
				// Currently the only option is the time control
				timeControl: data.isTimed ? {
					start: data.tcMinutes * 60 + data.tcSeconds,
					bonus: data.tcBonus,
					type: data.tcType,
				} : null,
			}
		);
		console.error("NOTE: Adding current player to player list -- should be better.");
		newRoom.onPlayerJoin(gameLobby.getPlayerByUsername(thisUsername))
		gameLobby.gameRooms.push(newRoom);
		gameLobby.gameRoomID++; // ensures unique
		
		socket.emit("createGameSuccess");
	});
	
	socket.on("joinGame", function onJoinGame(roomID) {
		console.log("joinGame event");
		const you = gameLobby.getPlayerByUsername(thisUsername);
		const room = gameLobby.getRoomById(roomID);
		if (you && room) {
			try {
				room.onPlayerJoin(you);
				sendUpdate(socket);
			} catch (error) {
				if (error.isUserError) {
					// Send it
					socket.emit("gameRoomError", error);
				} else {
					// This is a bug, so we should re-throw it
					throw error;
				}
			}
		}
	});
	
	socket.on("leaveGame", function onLeaveGame(roomID) {
		const room = gameLobby.getRoomById(roomID);
		const you = gameLobby.getPlayerByUsername(thisUsername);
		if (you && room) {
			room.onPlayerLeave(you);
			gameLobby.cleanup();
			sendUpdate(socket);
		} else {
			socket.emit("gameRoomError", {
				message: "You have attempted to leave a room that does not exist!",
			});
		}
	});
	
	// room owners can kick players out
	socket.on("removePlayer", function onRemovePlayer(roomID, theirUsername) {
		// 1. Does the room exist?
		const room = gameLobby.getRoomById(roomID);
		if (room) {
			// 2. Do you have permission?
			const you = gameLobby.getPlayerByUsername(thisUsername);
			if (room.isOwnedBy(you)) {
				// 3. Remove them (assuming they exist).
				const them = gameLobby.getPlayerByUsername(theirUsername);
				if (room.isPlayerIn(them)) {
					room.onPlayerLeave(them);
				} else if (room.isPlayerInvited(them)) {
					// You can cancel an invitation if you invited someone to the room
					room.removeInvitation(them);
				} else {
					console.warn("Player " + theirUsername + " was kicked from a room they were not in or invited to!");
				}
				sendUpdate(socket);
			} else {
				socket.emit("gameRoomError", {
					message: "You do not have permission to remove players. You are not the room's owner.",
				});
			}
		} else {
			socket.emit("gameRoomError", {
				message: "That room does not exist. This is probably a bug.",
			});
			console.warn("Removing player from non-existent room");
		}
	});
	
	// begin the launch sequence, as I call it
	socket.on("startGame", function onStartGame(roomID) {
		
	});
	
	socket.on("confirmStart", function onConfirmStart(roomID) {
		
	});
	
	socket.on("disconnect", function onSocketDisconnect() {
		console.warn("DISCONNECT");
		//console.dir(socket);
		
		gameLobby.onSocketDisconnect(socket);
	});
});


module.exports = {
	
};
