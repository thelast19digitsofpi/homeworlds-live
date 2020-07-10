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

Game.prototype.doMove = function(player, move) {
	console.log("Game move", player, move);
	/*
	roughly:
	let valid = false;
	if (move is a build) {
		check build
		do build
	} else if (...) {
		...
	} else {
		error(invalid move type)
	}
	
	if (valid) {
		update game state
		send info to all players
	}
	*/
	
}

