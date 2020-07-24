// oneGame.js
//
// This file does not know that the games.js file exists.

const {app} = require("./https.js");
const {io, checkSocketCookie} = require("./socket.js");
const Player = require("./player.js");
const GameState = require("../scripts/game/gameState.js");
const GameClock = require("./game-clock.js");

// This might work...
function Game(id, options, players) {
	this.id = id;
	this.socketRoom = "game-" + this.id.toString();
	this.options = options;
	this.players = players.slice();
	// GameState player objects need to be strings
	this.currentState = new GameState(players.map(player => player.username));
	this.history = [[]]; // a lot like the client's...
	
	// Race Condition Defenses, Inc.
	this.turnResets = 0;
	this.actionsThisTurn = [];
	
	// slightly different from history which records gameState objects
	this.allActions = [];
	
	// Clocks!
	const tc = options.timeControl;
	if (tc) {
		this.clocks = {};
		for (let i = 0; i < players.length; i++) {
			const player = players[i];
			const clock = new GameClock(player.username, tc.start, tc.bonus, tc.type);
			clock.addListener(function() {
				console.log(`\n\n\n---\n${player.username} RAN OUT OF TIME\n---\n\n\n`);
			}.bind(this));
			this.clocks[player.username] = clock;
		}
	} else {
		this.clocks = null;
	}
	console.log("Game Starting. Clocks:", this.clocks);
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

// TODO: better support for race conditions
// basically we at endTurn send the server an array of all actions we take on the turn
Game.prototype.doAction = function(action, player) {
	console.log("Game move", action, player.username);
	
	let newState;
	// Each doThing() function throws if the move is illegal.
	const name = player.username;
	const current = this.currentState;
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
}

Game.prototype.doEndTurn = function(player, actionList) {
	console.log("End turn", player.username);
	console.log("Current turn is", this.currentState.turn);
	
	if (this.currentState.turn === player.username) {
		const name = player.username;
		const newState = this.currentState.doEndTurn();
		
		// hmmm... should I instead make the history a private variable?
		this.history.push([newState]);
		this.currentState = newState;
		
		// push the array, so we get an array of arrays
		this.allActions.push(actionList);
		
		if (this.clocks) {
			// press their clock
			this.clocks[player.username].endTurn();
			if (newState.phase !== "end") {
				// start the next player's clock running
				this.clocks[newState.turn].beginTurn();
			}
		}
	} else {
		console.warn("[Game#doEndTurn] Wrong player's turn!");
	}
	
	this.debugLogMap();
}

Game.prototype.doResetTurn = function(player) {
	console.log("Reset turn", player.username);
	console.log("Current turn is ", this.currentState.turn);
	
	if (this.currentState.turn === player.username) {
		const name = player.username;
		// beginning of turn = the first part of the most recent turn
		const newState = this.history[this.history.length - 1][0];
		
		// the most recent turn loses all but the first state recorded
		this.history[this.history.length - 1].splice(1);
		// and we return to that state
		this.currentState = newState;
	} else {
		console.warn("[Game#doResetTurn] Wrong player's turn!");
	} 
}

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
			this.doResetTurn(data.player);
			// then do all their actions
			this.turnResets = theirResets;
			for (var i = 0; i < theirActions.length; i++) {
				this.doAction(theirActions[i], data.player);
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
}

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
}

// for clocks, mostly
Game.prototype.manuallyEliminate = function(player) {
	
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