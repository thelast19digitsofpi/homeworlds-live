// games.js
//
// One could say this is where all the "real" work happens.
// But what is work, if not "real"?
// This is to oneGame.js as lobby.js is to lobbyGameRoom.js,
// but this does not know that lobby.js exists.

const {app} = require("./https.js");
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


const gameManager = new GameManager();

// Opening specific games like /game/5.
// Unfortunately socket.io has different req/res from Express...
app.get("/game/:gameID", function(req, res) {
	const requestedID = Number(req.params.gameID);
	console.log(requestedID);
	const game = gameManager.getGameById(requestedID);
	if (game) {
		res.locals.render.gameID = req.params.gameID;
		res.render("game", res.locals.render);
	} else {
		//res.render("error", res.locals.render);
		res.status(404).send("That game was not found.")
	}
});

ioGame.on("connection", function(socket) {
	console.log("Connection to some game");
	
	// So you have just connected to the game world
	// Find your seat...
	const thisUsername = socket._username;
	
	// Listen for an ask of what game it is
	socket.on("getGame", function(id) {
		const game = gameManager.getGameById(id);
		if (game) {
			// You are allowed to watch games in progress. I think.
			if (game.getPlayerByUsername(thisUsername) !== null) {
				// let them know they are playing?
			}
			// maybe this could be more refined? hmmm...
			socket.emit("gamePosition", game);
			socket.join(game.socketRoom);
		} else {
			// Game does not exist
			// ...but why? This should have been caught...
		}
	});
	
	
	// Event listeners
	socket.on("doAction", function onDoAction(data) {
		const game = gameManager.getGameById(data.gameID);
		if (game) {
			const you = game.getPlayerByUsername(thisUsername);
			if (you) {
				// attempt to do the action
				try {
					game.doAction(data.action, you);
					// sends the action to everyone except the sender!
					socket.to(game.socketRoom).emit("action", {
						player: you.username,
						action: data.action,
					});
				} catch (error) {
					if (error.constructor === Error) {
						socket.emit("actionError", {
							message: "Your move was considered illegal. You may be out of sync (try refreshing). The message was:\n" + error,
							// gameState and history are used to help re-sync the client
							gameState: game.gameState,
							history: game.history,
						});
					} else {
						console.error("[socket/doAction] Problem:", error);
					}
				}
			} else {
				socket.emit("actionError", {
					message: "You are not playing this game. (Or maybe there is a bug.)",
				});
			}
		} else {
			socket.emit("actionError", {
				message: "Weird. I could not find that game. This is almost certainly a bug.",
			});
			console.error(`BUG! Game ${data.gameID} was not found in doAction ${action.type}`);
		}
	});
	
	socket.on("doEndTurn", function onDoEndTurn(data) {
		const game = gameManager.getGameById(data.gameID);
		if (game) {
			const you = game.getPlayerByUsername(thisUsername);
			if (you) {
				try {
					// attempt to do the action
					game.doEndTurn(you);
					// sends the action to everyone except the sender!
					socket.to(game.socketRoom).emit("endTurn", {
						player: you.username,
					});
				} catch (error) {
					if (error.constructor === Error) {
						socket.emit("actionError", {
							message: "Your move was considered illegal. You may be out of sync (try refreshing). The message was:\n" + error,
							// gameState and history are used to help re-sync the client
							gameState: game.gameState,
							history: game.history,
						});
					} else {
						console.error("[socket/doEndTurn] Problem:", error);
					}
				}
			} else {
				// could not find your player
				socket.emit("actionError", {
					message: "You are not playing this game (or maybe there is a bug?).",
				});
			}
		} else {
			socket.emit("actionError", {
				message: "Weird. I could not find that game. This is almost certainly a bug.",
			});
			console.error(`BUG! Game ${data.gameID} was not found in doEndTurn ${action.type}`);
		}
	});
});

module.exports = {
	gameManager: gameManager,
}
