// database.js
//
// Creates the database. Exports the database object, I guess...?
// Not really sure how to structure this.

const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(".data/database.db", function(error) {
	if (error === null) {
		console.log("Database success!");
		db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", [], function(error, stuff) {
			if (!stuff) {
				// table does not exist
				db.run(`CREATE TABLE users(
					id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
					username TEXT UNIQUE NOT NULL,
					hashedPassword TEXT NOT NULL,
					cookie TEXT,
					cookieExpires INTEGER
				)`);
			}
		});
		db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='gameArchive';", [], function(error, stuff2) {
			if (!stuff2) {
				// Game archive. The id is always unique
				db.run(`CREATE TABLE gameArchive(
					id INTEGER PRIMARY KEY,
					summary TEXT,
					players TEXT NOT NULL,
					winner TEXT,
					options TEXT
				)`);
			}
		});
	} else {
		console.error("/!\\ SOMETHING WENT WRONG /!\\");
		console.error(error);
	}
});

// Closes the server when a Control+C is used to shut it down
function shutdownDatabase() {
	console.log("SIGINT (or SIGTERM?)");
	db.close();
	process.exit(0);
};
process.on('SIGINT', shutdownDatabase);
process.on('SIGTERM', shutdownDatabase);

module.exports = db;
