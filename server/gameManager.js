// games.js
//
// One could say this is where all the "real" work happens.
// But what is work, if not "real"?
// This is to oneGame.js as lobby.js is to lobbyGameRoom.js,
// but this does not know that lobby.js exists.


const Player = require("./player.js");
const Game = require("./oneGame.js");
const db = require("./database.js");
const {io, checkSocketCookie} = require("./socket.js");

const ioGame = io.of("/game");
ioGame.use(checkSocketCookie);



function GameManager() {
	this.games = [];
	this.players = [];
}
// getSomethingBySomethingelse
GameManager.prototype.getGameById = function(givenID) {
	for (let i = 0; i < this.games.length; i++) {
		const game = this.games[i];
		if (game.id === givenID) {
			return game;
		}
	}
	return null;
}

// When a player connects, we check if they have a game active.
GameManager.prototype.getGameByUsername = function(givenUsername) {
	for (let i = 0; i < this.games.length; i++) {
		const game = this.games[i];
		for (let j = 0; j < game.players.length; j++) {
			if (game.players[j].username === givenUsername) {
				return game;
			}
		}
	}
	return null;
}

// Note that this does not require lobbyGameRoom.js...
GameManager.prototype.startGameByRoom = function(gameRoom) {
	// This can NOT POSSIBLY be all there is...
	// .slice() to copy the array
	const newGame = new Game(gameRoom.id, gameRoom.options, gameRoom.players.slice());
	this.games.push(newGame);
	// Add the new players to the list of players in our game collection
	// But is this really needed?
	for (let i = 0; i < gameRoom.players.length; i++) {
		const player = gameRoom.players[i];
		if (this.players.indexOf(player) === -1) {
			this.players.push(player);
		}
	}
}

// I am not sure what I want the procedure to be for this
// After all, this could easily blast thru my file limits
GameManager.prototype.backupToDatabase = function() {
	console.warn("Nope");
}

GameManager.prototype.onSocketConnect = function() {
	const yourGame = gameManager.getGameByUsername(thisUsername);
	if (!yourGame) {
		console.error("ERROR: No game found for user!", thisUsername);
		socket.emit("userNotFound", null, function() {
			// When we confirm they received userNotFound, disconnect them.
			socket.disconnect(true);
		});
		return;
	}

	socket.emit("gameLoaded", {
		game: yourGame,
	});
}

const gameManager = new GameManager();

ioGame.on("connection", function(socket) {
	console.log("Connection to some game");
	
	// So you have just connected to the game world
	// Find your seat...
	const thisUsername = socket._username;
	gameManager.onSocketConnect(socket);
	
	// Event listeners
	socket.on("doAction", function(data) {
		
	});
});

module.exports = {
	gameManager: gameManager,
}
