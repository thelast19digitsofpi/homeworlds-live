// admin.js
//
// simple admin panel
// I can give warnings when the server will be taken offline, and also view all users (but NOT their passwords or anything)

const a2 = require("argon2");

const {app} = require("./https.js");
const {gameManager} = require("./gameManager.js");
const db = require("./database.js");
const {databaseCall} = require("./my-util.js");

// for admin authentication, NOT user authentication
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
			let usersRated = await databaseCall(db, "all", "SELECT username, rating FROM users INNER JOIN elo on elo.userID = users.id");
			let usersUnrated = await databaseCall(db, "all", "SELECT username, id FROM users WHERE id not in (SELECT userID FROM elo)")
			//console.log(usersUnrated);
			res.locals.render.users = Array.prototype.concat.call(usersRated, usersUnrated);
			
			res.locals.render.complaints = await databaseCall(db, "all", "SELECT * FROM complaints", []);
			
			console.log("rendering admin");
			
			return res.render("admin", res.locals.render);
		} else {
			return res.status(401).set("WWW-Authenticate", "Basic realm=\"Admin\"").send("You need the admin password to do this.");
		}
	} catch (error) {
		console.error(error);
		return res.status(500).send("500 Internal Server Error:\n\n" + error);
	}
});

app.post("/admin/complaint", async function(req, res, next) {
	try {
		if (await isAuthenticated(req)) {
			// apparently they are sent as {3: "on"} etc
			console.log(req.body);
			let ids = [];
			for (let n in req.body) {
				// no weird crashes if action is just the word "on"
				if (!isNaN(n) && req.body[n] === "on") {
					ids.push(n);
				}
			}
			console.log(ids);
			const whereClause = " WHERE id IN (" + ids.join(", ") + ")"; 
			if (req.body.action === "mark-complete") {
				db.run("UPDATE complaints SET completed = 1" + whereClause, console.log);
			} else if (req.body.action === "mark-incomplete") {
				db.run("UPDATE complaints SET completed = 0" + whereClause, console.log);
			} else if (req.body.action === "delete") {
				db.run("DELETE FROM complaints" + whereClause, console.log);
			} else {
				console.warn("[admin/complaint] Invalid Action: ", req.body.action);
			}
			
			return res.redirect("/admin");
		} else {
			return res.status(403).send("403 Forbidden: Access Denied. Please try again.");
		}
	} catch (error) {
		console.error(error);
		return res.status(500).send("500 Internal Server Error:\n\n" + error);
	}
});
