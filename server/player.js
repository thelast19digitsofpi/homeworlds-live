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
		
		// also cancel any disconnect timers
		for (let i = __events.length - 1; i >= 0; i--) {
			const event = __events[i];
			if (event.what === what) {
				clearTimeout(event.timeout);
				__events.splice(i, 1);
			}
		}
	};
	// when you disconnect, remove all connections for that socket and set appropriate timers
	this.disconnect = function(socket, eventDelayMs) {
		for (let i = __connections.length - 1; i >= 0; i--) {
			// "thing" could be socket or toWhat
			const conn = __connections[i];
			if (conn.socket === socket) {
				console.log(this.username, "Disconnecting from something");
				__connections.splice(i, 1);
				// check if you have lost your connection to that thing
				this.setTimer(conn.toWhat, eventDelayMs);
			}
		}
	};
	// causes thing to call onPlayerLeave
	// you have to not be connected to that thing
	this.setTimer = function(thing, eventDelayMs) {
		if (!this.isConnected(thing)) {
			const timeout = setTimeout(() => thing.onPlayerLeave(this), eventDelayMs || 300e3); // default to 5 minutes
			// and record it in case we re-connect
			__events.push({
				timeout: timeout,
				what: conn.toWhat,
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