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
	this.players = players;
	this.clocks = [];
	// GameState player objects need to be strings
	this.currentState = new GameState(players.map(player => player.username));
	this.history = [[]]; // a lot like the client's...
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

// TODO: I am not sure what to do about race conditions
// e.g. Alice has a lagged connection and sends "sacrifice ..." then 2 moves
// but the move is received before the sacrifice
Game.prototype.doAction = function(action, player) {
	console.log("Game move", action, player);
	
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

Game.prototype.doEndTurn = function(player) {
	console.log("End turn", player);
	
	const name = player.username;
	const newState = current.doEndTurn(player);
	
	// hmmm... should I instead make the history a private variable?
	this.history.push([newState]);
	this.currentState = newState;
}

module.exports = Game;