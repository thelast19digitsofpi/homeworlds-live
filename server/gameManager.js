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
const {renewCookie} = require("./accounts.js");
const elo = require("./elo.js");

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
	const newGame = new Game(gameRoom.id, gameRoom.options, gameRoom.players.slice(), this);
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

// IMPORTANT: This function is asynchronous!
GameManager.prototype.onGameEnd = async function(game) {
	console.log("Game End!");
	// Game is over!
	const winner = game.getWinner();
	
	// Was the game rated?
	let ratingData = null;
	if (game.options.isRated) {
		try {
			// Note: this assumes 2-player game
			// (should 3-4 player games even BE rated?)
			const player0 = game.players[0].username;
			const player1 = game.players[1].username;
			const result = (
				winner === player0 ? 1 :
				winner === player1 ? 0 :
				0.5
			);
			console.log("end game calculation", winner, player0, player1, result);
			ratingData = await elo.updateUserRatings(result, player0, player1);
		} catch (error) {
			console.log("ERROR IN RATINGS");
			console.error(error);
		}
	} else {
		console.log("Not rated");
		console.log(game.options);
	}
	
	// Get the synopsis of the game.
	let summary = "something went wrong, we are sorry";
	try {
		summary = game.getSummary(true);
	} catch (error) {
		console.log("ERROR IN SUMMARY");
		console.error(error);
	}
	
	game.endGameInfo = {
		// so that gameOver can be a replacement for gamePosition
		game: game.getClientData(),
		history: game.history,
		
		winner: winner,
		summary: summary,
		ratingData: ratingData,
		
		// again, gameOver is a replacement for gamePosition
		actionsThisTurn: [],
		turnResets: 0,
	};
	
	// Send the room a message.
	ioGame.to(game.socketRoom).emit("gameOver", game.endGameInfo);
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


// For debugging lag.
function pretendLag(ms) {
	// just for comparison
	const randomID = Math.random();
	console.log("begin fake lag", Math.round(ms), "id", randomID);
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			console.log("end fake lag", Math.round(ms), "id", randomID);
			resolve();
		}, ms);
	});
};


ioGame.on("connection", function(socket) {
	console.log("Connection to some game");
	
	// So you have just connected to the game world
	// Find your seat...
	const thisUsername = socket._username;
	renewCookie(thisUsername);
	
	// Listen for an ask of what game it is
	socket.on("getGame", function(id) {
		const game = gameManager.getGameById(id);
		if (game) {
			// You are allowed to watch games in progress. I think.
			let viewer = game.players[0].username;
			if (game.getPlayerByUsername(thisUsername) !== null) {
				// They see it from their own perspective.
				viewer = thisUsername;
			}
			// maybe this could be more refined? hmmm...
			socket.emit("gamePosition", {
				game: game.getClientData(),
				history: game.history,
				viewer: viewer,
				
				actionsThisTurn: game.actionsThisTurn,
				turnResets: game.turnResets,
			});
			socket.join(game.socketRoom);
		} else {
			// Game does not exist
			// ...but why? This should have been caught...
			console.log("Game does not exist!");
		}
	});
	
	// Event listeners
	socket.on("doAction", async function onDoAction(data) {
		console.log("doAction");
		// TODO: Obviously, delete this!!
		await pretendLag(Math.random() * 3000);
		// you are still connected
		renewCookie(thisUsername);
		// ok now actually find the requested game
		const game = gameManager.getGameById(data.gameID);
		if (game) {
			const you = game.getPlayerByUsername(thisUsername);
			if (you) {
				// attempt to do the action
				try {
					if (data.action.type === "eliminate") {
						socket.emit("actionError", {
							message: "Nice try.",
						});
						console.log("Well, it happened. Someone tried to send an \"eliminate\" action.")
						return false;
					}
					
					const success = game.onReceiveAction(data, false, you);
					// sends the action to everyone except the sender!
					if (success) {
						socket.to(game.socketRoom).emit("action", {
							player: you.username,
							action: data.action,
							turnResets: data.turnResets,
							actionsThisTurn: data.actionsThisTurn,
						});
					} else {
						console.log("Action failed. Perhaps tell client?");
					}
				} catch (error) {
					if (error.constructor === Error) {
						socket.emit("actionError", {
							message: "Your action was considered illegal. You may be out of sync (try refreshing). The message was:\n" + error,
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
	
	// Resets the board to the position at the start of your turn.
	// Like an "undo" option, in a sense.
	socket.on("doResetTurn", async function onDoReset(data) {
		console.log("doResetTurn");
		// TODO: Obviously, delete this!!
		await pretendLag(Math.random() * 3000);
		// standard
		const game = gameManager.getGameById(data.gameID);
		if (game) {
			const you = game.getPlayerByUsername(thisUsername);
			if (you) {
				try {
					// attempt to do the action
					const success = game.onReceiveReset(data, you);
					if (success) {
						// sends the action to everyone except the sender!
						socket.to(game.socketRoom).emit("resetTurn", {
							player: you.username,
							actionsThisTurn: data.actionsThisTurn,
							turnResets: data.turnResets,
						});
					} else {
						console.log("Reset turn failed. Perhaps tell client?")
					}
				} catch (error) {
					// no use sending the player an error message
					// they probably just double-clicked
					console.error("[socket/doResetTurn] Problem:", error);
				}
			} else {
				// could not find your player
				socket.emit("actionError", {
					message: "You are not playing this game (or maybe there is a bug?).",
				});
			}
		} else {
			socket.emit("actionError", {
				message: "Weird. I could not find that game. This is almost certainly a bug, but try refreshing.",
			});
			console.error(`BUG! Game ${data.gameID} was not found in doResetTurn ${action.type}`);
		}
	});
	
	socket.on("doEndTurn", async function onDoEndTurn(data) {
		// TODO: Obviously, delete this!!
		await pretendLag(Math.random() * 3000);
		const game = gameManager.getGameById(data.gameID);
		if (game) {
			const you = game.getPlayerByUsername(thisUsername);
			if (you) {
				try {
					// attempt to do the action
					const success = game.onReceiveAction(data, true, you, gameManager);
					if (success) {
						// sends the action to everyone except the sender!
						socket.to(game.socketRoom).emit("endTurn", {
							player: you.username,
							turnResets: data.turnResets,
							actionsThisTurn: data.actionsThisTurn,
						});
						// using ioGame sends the clocks to everyone
						ioGame.to(game.socketRoom).emit("clockUpdate", {
							clocks: game.getClientClockArray(),
						});
					}
				} catch (error) {
					// no use sending the player an error message
					// they probably just double-clicked
					console.error("[socket/doEndTurn] Problem:", error);
				}
			} else {
				// could not find your player
				socket.emit("actionError", {
					message: "You are not playing this game (or maybe there is a bug?).",
				});
			}
		} else {
			socket.emit("actionError", {
				message: "Weird. I could not find that game. This is almost certainly a bug, but try refreshing.",
			});
			console.error(`BUG! Game ${data.gameID} was not found in doEndTurn ${action.type}`);
		}
	});
});

module.exports = {
	gameManager: gameManager,
}
