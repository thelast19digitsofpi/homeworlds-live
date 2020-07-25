// player.js
//
// Simple player object, mostly keeps track of username...
// ...and socket (dis)connection
// (but it does not store the socket itself)

"use strict";

function Player(username) {
	this.username = username;
	this.connected = true; // easier+more intuitive to read from a boolean
	this.elo = -1; // i.e. unknown
	
	// Because Node timer objects are objects (not integers),
	// I need to make this a private field
	var __disconnect = null;
	this.setDisconnect = function(fn, time) {
		__disconnect = setTimeout(fn, time);
	};
	this.clearDisconnect = function() {
		clearTimeout(__disconnect);
		__disconnect = null;
	};
	this.hasDisconnect = function() {
		return __disconnect !== null;
	};
}

// Note: Requires the game or lobby to be passed (and have an onPlayerLeave method)
Player.prototype.onDisconnect = function(fromWhat) {
	if (!this.hasDisconnect()) {
		this.setDisconnect(function() {
			// fromWhat is the Game or Lobby
			fromWhat.onPlayerLeave(this);
			console.log(this.username + " has left. Good bye.");
		}.bind(this), 5 * 60 * 1000);
	} else {
		console.log("might want to get this checked -- onDisconnect() was called twice for " + this.username);
	}
	this.connected = false;
}
Player.prototype.onReconnect = function() {
	if (this.hasDisconnect()) {
		console.log("Looks like " + this.username + " is back!");
		this.clearDisconnect();
	} else {
		console.log("might want to get this checked -- onReconnect() was called twice for " + this.username);
	}
	this.connected = true;
}

module.exports = Player;