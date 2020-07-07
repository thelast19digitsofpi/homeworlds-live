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
}
GameRoom.prototype.onPlayerLeave = function(player) {
	const index = this.players.indexOf(player);
	if (index >= 0) {
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
// throws
GameRoom.prototype.onPlayerJoin = function(player) {
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
// Note: This... wait, how will I do this?
// throws
GameRoom.prototype.actuallyStartGame = function() {
	if (this.players.length !== this.numPlayers) {
		throw new UserError("There are not enough players to start!");
	}
	
	for (let i = 0; i < this.players.length; i++) {
		// ...
	}
	
	console.error("Actually *starting* a game is not supported yet.");
}


module.exports = GameRoom;