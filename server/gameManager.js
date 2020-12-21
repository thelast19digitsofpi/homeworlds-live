// games.js
//
// One could say this is where all the "real" work happens.
// But what is work, if not "real"?
// This is to oneGame.js as lobby.js is to lobbyGameRoom.js,
// but this does not know that lobby.js exists.

const {app} = require("./https.js");
const Game = require("./oneGame.js");
const db = require("./database.js");
const {io, checkSocketCookie} = require("./socket.js");
const {renewCookie} = require("./accounts.js");
const elo = require("./elo.js");

const ioGame = io.of("/game");
ioGame.use(checkSocketCookie);


function GameManager() {
	this.games = [];
	this.players = []; // TODO: Is this even being used?
	this.archiveGames = [];
}
// getSomethingBySomethingelse
GameManager.prototype.getGameById = function(givenID) {
	for (let i = 0; i < this.games.length; i++) {
		const game = this.games[i];
		if (game.id === givenID) {
			return game;
		}
	}
	
	// search thru the archives
	for (let i = 0; i < this.archiveGames.length; i++) {
		const deadGame = this.archiveGames[i];
		if (deadGame.id === givenID) {
			return deadGame;
		}
	}
	
	// ok, no such game exists
	return null;
};

GameManager.prototype.getPlayerByUsername = function(username) {
	for (let i = 0; i < this.games.length; i++) {
		const game = this.games[i];
		for (let j = 0; j < game.players.length; j++) {
			if (game.players[j].username === username) {
				return game.players[j];
			}
		}
	}
	return null;
};

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
		// if they are not already in 
		if (this.players.indexOf(player) === -1) {
			this.players.push(player);
		}
		// Set a timer, in case the player never shows up!
		player.setTimer(newGame, "forfeit", 450 * 1e3);
	}
};

// IMPORTANT: This function is asynchronous!
GameManager.prototype.onGameEnd = async function(game, cause) {
	if (this.games.indexOf(game) === -1) {
		console.warn("onGameEnd called but game does not exist");
		return false;
	}
	
	console.log("Game End!");
	// Game is over!
	const winner = game.getWinner();
	
	// Was the game rated?
	let ratingData = null;
	// note: if the game ends without all players taking a turn, it is not rated
	if (game.options.isRated && game.history.length > 3) {
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
			console.log("rating calculation", winner, player0, player1, result);
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
		const playersString = JSON.stringify(game.players.map(player => player.username));
		const optionsString = JSON.stringify(game.options);
		// This is an async function
		// but we don't need to hold up the execution of onGameEnd
		db.run("INSERT INTO gameArchive VALUES (?, ?, ?, ?, ?)", [game.id, summary, playersString, winner, optionsString], function(error) {
			if (error) {
				console.warn("Game NOT ADDED to the archive!");
				return console.error(error);
			}
		});
	} catch (error) {
		console.log("ERROR IN SUMMARY");
		console.error(error);
	}
	
	// stop the clocks
	game.stopAllClocks();
	
	game.endGameInfo = {
		// so that gameOver can be a replacement for gamePosition
		game: game.getClientData(),
		history: game.history,
		
		cause: cause || (winner ? "defeating the enemy" : "mutual destruction"),
		winner: winner,
		summary: summary,
		ratingData: ratingData,
		
		// again, gameOver is a replacement for gamePosition
		actionsThisTurn: [],
		turnResets: 0,
	};
	
	// Send the room a message.
	ioGame.to(game.socketRoom).emit("gameOver", game.endGameInfo);
	
	// finally, move it to the archive
	this.games.splice(this.games.indexOf(game), 1);
	this.archiveGames.push(game);
};

// I am not sure what I want the procedure to be for this
// After all, this could easily blast thru my file limits
GameManager.prototype.backupToDatabase = function() {
	console.warn("Nope");
};

// Gets the list of players who are currently playing a game.
GameManager.prototype.whosPlaying = function() {
	let playerList = [];
	for (let i = 0; i < this.games.length; i++) {
		const game = this.games[i];
		for (let j = 0; j < game.players.length; j++) {
			// right now 2P games mean a game ends when one is eliminated
			const player = game.players[j];
			playerList.push({
				username: player.username,
				connected: player.connected,
				elo: player.elo,
				gameID: game.id,
			});
		}
	}
	return playerList;
};

// When a socket disconnects
GameManager.prototype.onSocketDisconnect = function(socket) {
	const game = this.getGameById(socket._gameID);
	if (game) {
		const player = game.getPlayerByUsername(socket._username);
		if (player) {
			// 300 seconds = 5 minutes
			player.disconnect(socket, "forfeit", 300e3);
		}
	}
};

// Our particular game manager
const gameManager = new GameManager();

// Opening specific games like /game/5.
// Unfortunately socket.io has different req/res from Express...
app.get("/game/:gameID", function(req, res) {
	const requestedID = Number(req.params.gameID);
	console.log(requestedID);
	const game = gameManager.getGameById(requestedID);
	if (game) {
		res.locals.render.gameID = req.params.gameID;
		res.render("liveGame", res.locals.render);
	} else {
		//res.render("error", res.locals.render);
		res.status(404).send("That game was not found.")
	}
});

// Connection handler!
ioGame.on("connection", function(socket) {
	console.log("Connection to some game");
	
	// So you have just connected to the game world
	// Find your seat...
	const thisUsername = socket._username;
	renewCookie(thisUsername);
	
	// Listen for an ask of what game it is
	socket.on("getGame", function(id) {
		socket._gameID = id;
		const game = gameManager.getGameById(id);
		if (game) {
			// You are allowed to watch games in progress.
			let viewer = game.players[0].username;
			const yourPlayer = game.getPlayerByUsername(thisUsername);
			if (yourPlayer !== null) {
				// They see it from their own perspective.
				viewer = thisUsername;
				// And also you are connected.
				yourPlayer.connect(socket, game);
			}
			// maybe this could be more refined? hmmm...
			socket.emit("gamePosition", {
				game: game.getClientData(),
				history: game.history,
				viewer: viewer,
				
				drawVotes: game.drawVotes.map(player => player.username),
				
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
	socket.on("doAction", function onDoAction(data) {
		console.log("doAction");
		// TODO: Obviously, delete this!!
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
			console.error(`BUG! Game ${data.gameID} was not found in doAction ${data.action.type}`);
		}
	});
	
	// Resets the board to the position at the start of your turn.
	// Like an "undo" option, in a sense.
	socket.on("doResetTurn", function onDoReset(data) {
		console.log("doResetTurn");
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
			console.error(`BUG! Game ${data.gameID} was not found in doResetTurn ${data.action.type}`);
		}
	});
	
	socket.on("doEndTurn", function onDoEndTurn(data) {
		// TODO: Obviously, delete this!!
		const game = gameManager.getGameById(data.gameID);
		if (game) {
			const you = game.getPlayerByUsername(thisUsername);
			if (you) {
				try {
					// attempt to do the action
					const success = game.onReceiveAction(data, true, you);
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
			console.error(`BUG! Game ${data.gameID} was not found in doEndTurn ${data.action.type}`);
		}
	});
	
	socket.on("resign", function onResign(gameID) {
		// standard
		const game = gameManager.getGameById(gameID);
		if (game) {
			const you = gameManager.getPlayerByUsername(thisUsername);
			if (you) {
				// we assume the client has already confirmed
				game.forfeit(you, "resignation");
			}
		}
	});
	
	socket.on("offerDraw", function offerDraw(gameID) {
		const game = gameManager.getGameById(gameID);
		if (game) {
			const you = gameManager.getPlayerByUsername(thisUsername);
			if (you) {
				const success = game.onOfferDraw(you);
				if (success) {
					ioGame.to(game.socketRoom).emit("drawOfferChange", {
						drawVotes: game.drawVotes.map(player => player.username),
					});
				}
			}
		}
	});
	
	socket.on("cancelDraw", function cancelDraw(gameID) {
		const game = gameManager.getGameById(gameID);
		if (game) {
			const you = gameManager.getPlayerByUsername(thisUsername);
			if (you) {
				const success = game.onCancelDraw(you);
				if (success) {
					ioGame.to(game.socketRoom).emit("drawOfferChange", {
						drawVotes: game.drawVotes.map(player => player.username),
					});
				}
			}
		}
	});
	
	socket.on("disconnect", function() {
		console.warn("DISCONNECT from GameManager");
		gameManager.onSocketDisconnect(socket);
	});
	
	socket.on("reconnect", function() {
		// you are back!
		const game = gameManager.getGameById(socket._gameID);
		if (game) {
			const you = gameManager.getPlayerByUsername(thisUsername);
			if (you) {
				you.connect(socket, game);
			}
		}
	});
});

module.exports = {
	gameManager: gameManager,
}
