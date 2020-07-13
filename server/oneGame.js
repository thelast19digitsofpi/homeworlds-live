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
	this.options = options;
	this.players = players;
	this.clocks = [];
	// GameState player objects need to be strings
	this.currentState = new GameState(players.map(player => player.username));
	this.history = [[]]; // a lot like the client's...
}

Game.prototype.doAction = function(player, action) {
	console.log("Game move", player, action);
	
	let newState;
	// Each doThing() function throws if the move is illegal.
	try {
		switch (action.type) {
			case "homeworld":
				newState = current.doHomeworld(player, action.star1, action.star2, action.ship);
				break;
			case "build":
				newState = current.doBuild(player, action.newPiece, action.system);
				break;
			case "trade":
				newState = current.doTrade(player, action.oldPiece, action.newPiece);
				break;
			case "move":
				newState = current.doMove(player, action.oldPiece, action.system);
				break;
			case "discover":
				// the "newPiece" is the new star you discover
				newState = current.doDiscovery(player, action.oldPiece, action.newPiece);
				break;
			case "steal":
				newState = current.doSteal(player, action.oldPiece);
				break;
			case "sacrifice":
				newState = current.doSacrifice(player, action.oldPiece);
				break;
			case "catastrophe":
				newState = current.doCatastrophe(action.color, action.system);
				break;
			default:
				throw new Error("Invalid action type " + action.type + ". Could be a bug!");
		}
	} catch (error) {
		if (error.constructor === Error) {
			newState = 
		}
	}
}

module.exports = Game;