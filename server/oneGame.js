// oneGame.js
//
// This file does not know that the games.js file exists.

const {app} = require("./https.js");
const Player = require("./player.js");
const GameState = require("../scripts/game/gameState.js");
const GameClock = require("./game-clock.js");

// This might work...
// note: manager is a reference to the GameManager
// used when clocks expire
function Game(id, options, players, manager) {
	this.id = id;
	this.socketRoom = "game-" + this.id.toString();
	this.options = options;
	this.players = players.slice();
	// GameState player objects need to be strings
	this.currentState = new GameState(players.map(player => player.username));
	this.history = [[this.currentState]]; // a lot like the client's...
	
	// Race Condition Defenses, Inc.
	this.turnResets = 0;
	this.actionsThisTurn = [];
	
	// slightly different from history which records gameState objects
	this.allActions = [];
	
	// For offering a draw.
	// Right now draw votes expire only when someone clicks cancel draw.
	// Anyone can (draws must be unanimous).
	this.drawVotes = [];
	
	// Clocks!
	const tc = options.timeControl;
	if (tc) {
		this.clocks = {};
		for (let i = 0; i < players.length; i++) {
			const player = players[i];
			const clock = new GameClock(player.username, tc.start, tc.bonus, tc.type);
			clock.addListener(function() {
				console.log(`\n\n\n---\n${player.username} RAN OUT OF TIME\n---\n\n\n`);
				this.forfeit(player, "enemy disconnection");
			}.bind(this));
			this.clocks[player.username] = clock;
			if (i === 0) {
				// first turn
				clock.beginTurn();
			}
		}
	} else {
		this.clocks = null;
	}
	console.log("Game Starting. Clocks:", this.clocks);
	
	// more data hiding
	this.getManager = function() {
		return manager;
	};
}

// for debug
Game.prototype.debugLogMap = function() {
	const map = this.currentState.map;
	console.log("---begin map");
	for (let serial in map) {
		const data = map[serial];
		if (data !== null) {
			console.log("\t", serial + "/" + data.at + " " + (data.owner || "star"))
		}
	}
	console.log("---end map");
}

// standard
Game.prototype.getPlayerByUsername = function(username) {
	for (let i = 0; i < this.players.length; i++) {
		if (this.players[i].username === username) {
			return this.players[i];
		}
	}
	return null;
};

Game.prototype.getWinner = function() {
	// simple
	return this.currentState.winner;
};

// For use after a game, for analysis
// pass true to make it more compact but both are strings
Game.prototype.getSummary = function(useCompact) {
	if (useCompact) {
		console.log("Generating Summary!");
		const lines = [];
		// first line is players
		lines.push("Players: " + this.players.map(player => player.username).join(","));
		lines.push("Winner: " + (this.currentState.winner || "none"));
		for (let i = 0; i < this.allActions.length; i++) {
			// allActions is an array of arrays
			const turnActions = this.allActions[i];
			// closest thing JS has to a string builder
			const columns = [];
			for (let j = 0; j < turnActions.length; j++) {
				const action = turnActions[j];
				// format: action type (b=build t=trade m=move d=discover x=steal s=sacrifice c=catastrophe h=homeworld e=eliminate)
				let column = [];
				switch (action.type) {
					case "homeworld":
						column = ["h", action.star1, action.star2, action.ship];
						break;
					case "build":
						column = ["b", action.newPiece, action.system];
						break;
					case "trade":
						column = ["t", action.oldPiece, action.newPiece];
						break;
					case "move":
						// oldPiece is what you move
						column = ["m", action.oldPiece, action.system];
						break;
					case "discover":
						// oldPiece is what you move, newPiece is the new system
						// the system counter auto-increments
						column = ["d", action.oldPiece, action.newPiece];
						break;
					case "steal":
						// "x" because "s" is used for sacrifice (and "x" is capture in chess)
						column = ["x", action.oldPiece];
						break;
					case "sacrifice":
						column = ["s", action.oldPiece];
						break;
					case "catastrophe":
						column = ["c", action.color, action.system];
						break;
					case "eliminate":
						column = ["e", action.player];
						break;
					default:
						console.log("Invalid action!", action);
						break;
				}
				// parts of an action are separated by commas
				// e.g. "h,b1A,r2C,g3C"
				columns.push(column.join(","));
			}
			// actions are separated by semicolons
			// e.g. "s,g1A;b,y3C,5"
			lines.push(columns.join(";"));
		}
		// turns are separated by newlines
		return lines.join("\n");
	} else {
		return JSON.stringify({
			// list of players
			players: this.players.map(player => player.username),
			winner: this.currentState.winner,
			actions: this.allActions,
		});
	}
};

// TODO: better support for race conditions
// basically we at endTurn send the server an array of all actions we take on the turn
Game.prototype.doAction = function(action, player) {
	console.log("Game move", action, player.username);
	
	let newState;
	// Each doThing() function throws if the move is illegal.
	const name = player.username;
	const current = this.currentState;
	
	if (current.phase === "end") {
		console.log("[Game#doAction] The game is over!");
		return false;
	}
	
	switch (action.type) {
		case "homeworld":
			newState = current.doHomeworld(name, action.star1, action.star2, action.ship);
			break;
		case "build":
			newState = current.doBuild(name, action.newPiece, action.system);
			break;
		case "trade":
			newState = current.doTrade(name, action.oldPiece, action.newPiece);
			break;
		case "move":
			newState = current.doMove(name, action.oldPiece, action.system);
			break;
		case "discover":
			// the "newPiece" is the new star you discover
			newState = current.doDiscovery(name, action.oldPiece, action.newPiece);
			break;
		case "steal":
			newState = current.doSteal(name, action.oldPiece);
			break;
		case "sacrifice":
			newState = current.doSacrifice(name, action.oldPiece);
			break;
		case "catastrophe":
			newState = current.doCatastrophe(action.color, action.system);
			break;
		default:
			throw new Error("Invalid action type " + action.type + ". Could be a bug!");
	}
	
	// If we did NOT throw...
	this.history[this.history.length - 1].push(newState);
	this.currentState = newState;
	
	// Do not update the clocks or anything because we have not called endTurn()
};

// endCause is optional if a player is going to lose the game
Game.prototype.doEndTurn = function(player, actionList, endCause) {
	console.log("End turn", player.username);
	console.log("Current turn (before end) is", this.currentState.turn);
	
	if (this.currentState.phase === "end") {
		console.log("[Game#doEndTurn] The game is over!");
		return false;
	}
	
	if (this.currentState.turn === player.username) {
		const newState = this.currentState.doEndTurn();
		
		console.log("Now the new turn is", newState.turn);
		console.log("Phase", newState.phase);
		
		// hmmm... should I instead make the history a private variable?
		this.history.push([newState]);
		this.currentState = newState;
		
		// push the array, so we get an array of arrays
		this.allActions.push(actionList);
		
		if (this.clocks) {
			// press their clock
			console.log("Pausing clock", player.username);
			this.clocks[player.username].endTurn();
			// If we just ended the game...
			if (newState.phase !== "end") {
				// start the next player's clock running
				console.log("Starting clock", newState.turn);
				this.clocks[newState.turn].beginTurn();
			}
		}
	} else {
		console.warn("[Game#doEndTurn] Wrong player's turn!");
	}
	
	// let the manager end it
	if (this.currentState.phase === "end") {
		// note: this is async but I don't care
		this.getManager().onGameEnd(this, endCause);
	}
	
	this.debugLogMap();
};

Game.prototype.doResetTurn = function(player) {
	console.log("Reset turn", player.username);
	console.log("Current turn is ", this.currentState.turn);
	
	if (this.currentState.phase === "end") {
		console.log("[Game#doResetTurn] The game is over!");
		return false;
	}
	
	if (this.currentState.turn === player.username) {
		// beginning of turn = the first part of the most recent turn
		const newState = this.history[this.history.length - 1][0];
		
		// the most recent turn loses all but the first state recorded
		this.history[this.history.length - 1].splice(1);
		// and we return to that state
		this.currentState = newState;
	} else {
		console.warn("[Game#doResetTurn] Wrong player's turn!");
	} 
};

// Methods called when the client sends information.
// Returns true if it worked.
Game.prototype.onReceiveAction = function(data, isEndingTurn, player) {
	// I'm finding the server is sharing a LOT of the same logic as the client...
	console.log("onReceiveAction", player.username, this.currentState.turn);
	if (player.username === this.currentState.turn) {
		// Which turn attempt is this?
		const theirResets = data.turnResets;
		const ourResets = this.turnResets;
		const theirActions = data.actionsThisTurn;
		// First resolve any missed or new actions.
		if (theirResets > ourResets) {
			// this is on a new iteration of the turn
			// reset and try again
			this.doResetTurn(player);
			// then do all their actions
			this.turnResets = theirResets;
			for (var i = 0; i < theirActions.length; i++) {
				this.doAction(theirActions[i], player);
			}
			this.actionsThisTurn = theirActions.slice();
		} else if (theirResets === ourResets) {
			// this is on the same turn
			// do any actions above and beyond what we recorded
			const ourActions = this.actionsThisTurn;
			// NOTE: Possible bug here if theirActions and ourActions do not line up
			// but that shouldn't happen!
			
			// e.g. we have 2 actions and they send 5: loop from [2] to [4]
			for (let i = ourActions.length; i < theirActions.length; i++) {
				this.doAction(theirActions[i], player);
				// also add it to our action list
				ourActions.push(theirActions[i]);
			}
		} else {
			// else, this message came from an outdated turn
			// do nothing
			return false;
		}
		
		// End the turn if appropriate.
		if (isEndingTurn) {
			this.doEndTurn(player, theirActions);
			this.actionsThisTurn = [];
			this.turnResets = 0;
		}
		return true;
	} else {
		// wrong turn
		console.warn("[Game#onReceiveAction] Wrong Player's Turn");
		return false;
	}
};

Game.prototype.onReceiveReset = function(data, player) {
	// They just asked to reset their turn.
	// Only comply if this is not an old request!
	if (player.username === this.currentState.turn) {
		if (data.turnResets > this.turnResets) {
			this.doResetTurn(player);
			this.turnResets = data.turnResets;
			this.actionsThisTurn = [];
			return true;
		} else {
			return false;
		}
	} else {
		// wrong turn
		console.warn("[Game@onReceiveReset] Wrong Player's Turn");
		return false;
	}
};

// when you disconnect or run out of time
Game.prototype.forfeit = function(player, cause) {
	if (this.currentState.phase === "end") {
		console.log("forfeit called, but game is already over");
		return false;
	}
	// record an elimination "action"
	this.actionsThisTurn.push({
		type: "eliminate",
		player: player.username,
	});
	
	// in a 2-player game when one player is out the game is over
	// (games with more than 2 players are Somebody Else's Problem)
	// (of course that Somebody Else is probably me in the future)
	const index = this.players.indexOf(player);
	const winner = this.players[(index + 1) % this.players.length];
	this.currentState = this.currentState.updateState({
		winner: winner.username,
		phase: "end",
	});
	this.history[this.history.length - 1].push(this.currentState);
	this.getManager().onGameEnd(this, cause);
	
	console.log("Player", player.username, "forfeits. Phase =", this.currentState.phase);
};

// stops all the clocks
Game.prototype.stopAllClocks = function() {
	if (this.clocks) {
		for (let username in this.clocks) {
			this.clocks[username].endTurn();
		}
	}
};

// draw offers
Game.prototype.onOfferDraw = function(player) {
	if (this.currentState.phase === "end") {
		console.log("onOfferDraw called, but game is already over");
		return false;
	}
	console.log("Draw offer", player.username);
	if (this.players.indexOf(player) === -1) {
		return false;
	}
	if (this.drawVotes.indexOf(player) === -1) {
		this.drawVotes.push(player);
		console.log("Added to draw list");
		// might be possible to cheat this...? or not...
		// again, games with more than 2 players are Somebody Else's Problem
		if (this.drawVotes.length === this.players.length) {
			// it is over
			this.getManager().onGameEnd(this, "agreement");
		}
		return true;
	}
	return false;
};

Game.prototype.onCancelDraw = function(player) {
	// security check
	if (this.players.indexOf(player) === -1) {
		console.warn("Non-player cancels draw!");
		return false;
	}
	
	// anyone can cancel the draw
	// after all, draw offers must be unanimous
	if (this.drawVotes.length > 0) {
		this.drawVotes = [];
		return true;
	} else {
		console.log("No draw to cancel");
		return false;
	}
}

// Prepares a list of clocks in a format for sending to the client.
Game.prototype.getClientClockArray = function() {
	if (this.clocks) {
		var clockArray = [];
		// this is more consistent than doing for-in
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			const clock = this.clocks[player.username];
			if (clock) {
				clockArray.push(clock.getClientData());
			}
		}
		return clockArray;
	} else {
		return null;
	}
}
// Don't send the entire game object...
Game.prototype.getClientData = function() {
	return {
		id: this.id,
		options: this.options,
		players: this.players.map(player => player.username),
		clocks: this.getClientClockArray(),
		currentState: this.currentState,
		// we don't need the full history list
	};
};


module.exports = Game;