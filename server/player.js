// player.js
//
// Simple player object, mostly keeps track of username...
// ...and socket (dis)connection
// (but it does not store the socket itself)

"use strict";

function Player(username) {
	this.username = username;
	this.elo = -1; // i.e. unknown
	
	// Private variable so the Player object is not recursive
	let __connections = [];
	let __events = [];
	this.connect = function(socket, what) {
		__connections.push({
			socket: socket,
			// either a Lobby or a Game (not a GameManager)
			toWhat: what,
		});
		console.log("Player connected");
		// also cancel any disconnect timers
		for (let i = __events.length - 1; i >= 0; i--) {
			const event = __events[i];
			if (event.what === what) {
				console.log("Clearing 1 event");
				clearTimeout(event.timeout);
				__events.splice(i, 1);
			}
		}
	};
	// when you disconnect, remove all connections for that socket and set appropriate timers
	// method is what method to call on the lobby or game (e.g. onPlayerLeave or forfeit)
	// it is a little confusing because the first parameter is a socket
	this.disconnect = function(socket, methodOfPlace, eventDelayMs) {
		for (let i = __connections.length - 1; i >= 0; i--) {
			// "thing" could be socket or toWhat
			const conn = __connections[i];
			if (conn.socket === socket) {
				console.log(this.username, "Disconnecting from something");
				__connections.splice(i, 1);
				// check if you have lost your connection to that thing
				this.setTimer(conn.toWhat, methodOfPlace, eventDelayMs);
			}
		}
		console.log("Now has", __connections.length, "connections");
	};
	// causes thing to call onPlayerLeave
	// you have to not be connected to that thing
	this.setTimer = function(thing, method, eventDelayMs) {
		if (!this.isConnected(thing)) {
			console.log("Setting up 1 event");
			const timeout = setTimeout(() => {
				// if it is a game forfeiting, put a reason
				if (method === "forfeit") {
					thing.forfeit(this, "the clock");
				} else {
					thing[method](this);
				}
			}, eventDelayMs || 300e3); // default to 5 minutes
				
			// and record it in case we re-connect
			__events.push({
				timeout: timeout,
				what: thing,
			});
		}
	};
	// e.g. isConnected(lobby)
	this.isConnected = function(toWhat) {
		for (let i = 0; i < __connections.length; i++) {
			if (__connections[i].toWhat === toWhat) {
				return true;
			}
		}
		return false;
	};
}

module.exports = Player;