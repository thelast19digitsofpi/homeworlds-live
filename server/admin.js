// admin.js
//
// simple admin panel
// I can give warnings when the server will be taken offline, and also view all users (but not their passwords or anything)

const a2 = require("argon2");

const {app} = require("./https.js");
const {gameManager} = require("./gameManager.js");
const db = require("./database.js");
const {databaseCall} = require("./my-util.js");


async function isAuthenticated(req) {
	try {
		// thanks stackoverflow.com/questions/23616371 (modified a bit)
		const authHeader = req.headers.authorization;
		if (!req.headers.authorization) return false;
		
		const creds = authHeader.split(' ')[1];
		if (!creds) return false;
		
		const [login, password] = Buffer.from(creds, 'base64').toString().split(':');
		if (!login || !password) {
			return false;
		}
		console.log("attempted password is ", password);
		
		// a password that I know and no one else does
		const adminHash = "$argon2i$v=19$m=12800,t=8,p=4$bHE/CEDOpbga9sta8Y+mhlN9hCCt1QDl$eiZ7FR5tB5Q1CDJuVFCDk0QbKPUrEtrK4eXwU6AAmYttJFwHkFGfXALGoq5evL7p";
		// make it do the hash even if you did not enter "admin"
		if (!(await a2.verify(adminHash, password)) || login !== "admin") {
			console.log("password is incorrect");
			return false;
		}
		
		return true;
	} catch (error) {
		console.warn(error);
		return false;
	}
}

app.get("/admin", async function(req, res, next) {
	try {
		console.log("admin");
		if (await isAuthenticated(req)) {
			// you can see the admin panel stuff
			res.locals.render.games = gameManager.games.map(function(game) {
				// don't send the whole thing to EJS...
				return {
					id: game.id,
					players: game.players.map(player => player.username),
				};
			});
			let users = await databaseCall(db, "all", "SELECT username FROM users");
			res.locals.render.users = Array.prototype.map.call(users, user => user.username);
			
			console.log("rendering admin");
			
			return res.render("admin", res.locals.render);
		} else {
			return res.status(401).set("WWW-Authenticate", "Basic realm=\"Admin\"").send("You need the admin password to do this.");
		}
	} catch (error) { console.error(error); }
});
