// lobbyGameRoom.js
//
// Note: the class is called GameRoom.
// But this is not a Game that is actually being played.

const {UserError} = require("./my-util.js");

function GameRoom(id, numPlayers, invitedPlayers, options) {
	this.id = id;
	this.numPlayers = numPlayers;
	this.players = [];
	this.invitedPlayers = invitedPlayers.slice(); // copy the array
	this.bannedPlayers = [];
	this.options = options;
	// When the game is ready to begin
	this.isStarting = false;
	this.confirmedStart = [];
	
	// Node's way of making setTimeout() return a recursive object was really annoying!
	// Socket.IO's handling of recursive objects is almost the worst possible...
	let __startTimeout = null;
	this.setStartTimeout = function(fn, delay) {
		__startTimeout = setTimeout(fn, delay);
	};
	this.clearStartTimeout = function() {
		clearTimeout(__startTimeout);
		__startTimeout = null;
	};
}
GameRoom.prototype.onPlayerLeave = function(player) {
	const index = this.players.indexOf(player);
	if (index >= 0) {
		// If we were about to start...
		if (this.isStarting) {
			// Abort launch sequence immediately!
			this.onPlayerCancelStart(player);
		}
		
		// Remove the player from the player list.
		this.players.splice(index, 1);
		
		return true;
	} else {
		// I mean, you could double-click the leave btn by mistake or something
		console.warn("Player leaves game they are not in");
	}
}
GameRoom.prototype.forcePlayerOut = function(player) {
	this.onPlayerLeave(player);
	this.bannedPlayers.push(player);
}
GameRoom.prototype.onPlayerJoin = function(player) /* throws */ {
	if (!player) {
		// NOT a UserError because this is a bug!
		throw new TypeError("Player does not exist!");
	}
	// Are you invited?
	const invitation = this.invitedPlayers.indexOf(player);
	if (invitation !== -1) {
		// You can over-invite (invite 3 people to a 2-player room).
		if (this.players.length < this.numPlayers) {
			// You can always join
			this.invitedPlayers.splice(invitation, 1);
			this.players.push(player);
			return true;
		} else {
			throw new UserError("This room has filled up because other invited players joined before you. You need to join another room.");
		}
	} else {
		// You are just randomly joining.
		// check that there is room
		if (this.players.length + this.invitedPlayers.length >= this.numPlayers) {
			throw new UserError("This room has filled up. You need to join another room.");
		}
		// no duplicates allowed
		const index = this.players.indexOf(player);
		if (index === -1) {
			this.players.push(player);
			return true;
		} else {
			// TODO: Send socket error message? Or not?
			throw new UserError("You joined a game that you are already in!");
		}
	}
}
GameRoom.prototype.isPlayerIn = function(player) {
	return this.players.indexOf(player) !== -1;
}
GameRoom.prototype.isPlayerInvited = function(player) {
	return this.invitedPlayers.indexOf(player) !== -1;
}
// The owner is [0] in the player list...
GameRoom.prototype.isOwnedBy = function(player) {
	return this.players[0] === player;
}
// Like onPlayerLeave but revokes an invitation
GameRoom.prototype.removeInvitation = function(player) {
	const index = this.invitedPlayers.indexOf(player);
	if (index >= 0) {
		this.invitedPlayers.splice(player, 1);
		return true;
	} else {
		// I mean, you could double-click the leave btn by mistake or something
		console.warn("Improper canceling of an invitation removal!");
	}
}

/*
Starting games.

The launch sequence goes as follows:
0. The owner of the room clicks the start game button.
1. We check to see if the game is ready to start (i.e. has the right number of players).
2. If so, everyone gets sent a message that they need to accept or decline.
	- Yes, everyone. The owner may have clicked accidentally, so we should force them to confirm.
3. Any player who clicks Decline aborts the process and leaves the room.
4. When everyone has clicked Accept, the Game starts!


Note: We should keep track of players who are in games and send that in WhosOnline data.
*/

// Literally every previous function besides the constructor takes a player parameter.
GameRoom.prototype.prepareToStart = function(playerRequesting) /* throws */ {
	if (!this.isOwnedBy(playerRequesting)) {
		throw new UserError("You do not own the room, so you cannot start the game.");
	}
	if (this.players.length !== this.numPlayers) {
		throw new UserError("There are not " + this.numPlayers + " players in the room, so the game cannot start.");
	}
	
	// lobby.js can send info to the clients
	this.isStarting = true;
}

GameRoom.prototype.onPlayerConfirmStart = function(player) /* throws */ {
	// Are you not actually in the room?
	if (this.players.indexOf(player) === -1) {
		throw new UserError("You are not in the room!");
	}
	// check that you have not already confirmed yourself as ready
	if (this.confirmedStart.indexOf(player) === -1) {
		this.confirmedStart.push(player);
	}
}

GameRoom.prototype.onPlayerCancelStart = function(player) {
	// They have to be joined in order to abort the launch sequence
	if (this.players.indexOf(player) !== -1) {
		// Unanimous consent? I object! Cancel it all!
		this.isStarting = false;
		this.clearStartTimeout();
		this.confirmedStart = [];
	} else {
		// else just ignore it (but make a note of it)
		console.log("Player not in the room cancels start", player.username);
	}
}

// Note: This... wait, how will I do this?
GameRoom.prototype.canStartForReal = function() {
	if (this.players.length !== this.numPlayers) {
		console.error(`Players: ${this.players.length}/${this.numPlayers} -- not enough`);
		return false;
	}
	
	for (let i = 0; i < this.players.length; i++) {
		// Are they listed as confirmed?
		// (yes, this is O(n^2) but n is small enough so yeah)
		if (this.confirmedStart.indexOf(this.players[i]) === -1) {
			console.log(`${this.players[i].username} has not confirmed yet`);
			return false;
		}
	}
	
	// It is actually legitimately time to begin!
	console.error("Actually *starting* a game is not supported yet.");
	return true;
}


module.exports = GameRoom;