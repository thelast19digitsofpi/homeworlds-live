// server-game.js
//
// Maybe its presence in the "server/" directory is sufficient...
// But in Sublime it just shows as "game.js", so...
// I wonder if I should just use some kind of symbolic link?

const {app} = require("./https.js");
const {io, checkSocketCookie} = require("./socket.js");
const Player = require("./player.js");
const GameState = require("../scripts/game/gameState.js");

const g = new GameState(["north", "south"]);
console.log(JSON.stringify(g));


// This might work...
function Game(players) {
	this.history = [];
	this.players = players;
	this.clocks = [];
}










const ioGame = io.of("/game");
ioGame.use(checkSocketCookie);

ioGame.on("connection", function() {
	console.log("Connection to some game");
});
