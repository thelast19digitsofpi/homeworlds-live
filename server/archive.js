// archive.js
//
// archive viewers

const db = require("./database.js");
const {app} = require("./https.js");
const {databaseCall} = require("./my-util.js");

app.get(/\/archive\/?$/, async function(req, res) {
	try {
		const rows = await databaseCall(db, "all", "SELECT * FROM gameArchive", []);
		if (!rows) {
			return res.status(500).send("500 Internal Server Error: Something went wrong, the archive database does not seem to be working.");
		}
		// I don't trust "rows" to be a legit array
		res.locals.render.archiveList = Array.prototype.map.call(rows, function(row) {
			return {
				id: row.id,
				players: JSON.parse(row.players),
				winner: row.winner,
				// don't put the whole move list in!
				// the first two rows have the players and winner
				numTurns: row.summary.split("\n").length - 2,
				options: JSON.parse(row.options),
				date: row.date,
			};
			// reverse so the most recent game is on top
		}).reverse();
		console.log(res.locals.render.archiveList);
		return res.render("archiveTable.ejs", res.locals.render);
	} catch (error) {
		console.log("GET /archive");
		console.error(error);
		return res.status(500).send("500 Internal Server Error.\n\n" + error.toString());
	}
});

app.get("/archive/view/:gameID", async function(req, res, next) {
	const id = Number(req.params.gameID);
	if (isNaN(id)) {
		return res.status(400).send("Invalid archive game.");
	}
	
	try {
		const row = await databaseCall(db, "get", "SELECT * FROM gameArchive WHERE id = ?", [id]);
		console.log(row);
		if (!row) {
			return next({
				status: 404,
				isArchive: true,
			});
		}
		
		// Get the information.
		res.locals.render.archiveGame = {
			id: Number(row.id),
			players: JSON.parse(row.players),
			summary: row.summary,
			date: row.date,
		};
		console.log("ROW PLAYERS\n", JSON.parse(row.players), typeof row.players);
		
		return res.render("archiveViewer", res.locals.render);
	} catch (error) {
		console.log("GET /archive/:gameID");
		return res.status(500).send("500 Internal Server Error.\n\n" + error.toString());
	}
});

app.get("/archive/raw/:gameID", async function(req, res, next) {
	const id = Number(req.params.gameID);
	if (isNaN(id)) {
		return res.status(400).send("Invalid archive game.");
	}
	
	try {
		const row = await databaseCall(db, "get", "SELECT * FROM gameArchive WHERE id = ?", [id]);
		console.log(row);
		if (!row) {
			return res.status(404).send("That game does not exist.");
		}
		
		// for now, just send it as json
		return res.status(200).set("Content-Type", "application/json").send(JSON.stringify({
			id: Number(row.id),
			players: JSON.parse(row.players),
			summary: row.summary,
		}));
	} catch (error) {
		console.log("GET /archive/:gameID");
		return res.status(500).send("500 Internal Server Error.\n\n" + error.toString());
	}
});
