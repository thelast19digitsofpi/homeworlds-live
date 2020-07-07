// database.js
//
// Creates the database. Exports the database object, I guess...?
// Not really sure how to structure this.

const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(".data/database.db", function(error) {
	if (error === null) {
		console.log("Database success!");
		console.log(arguments);
		db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", [], function(error, stuff) {
			if (!stuff) {
				// table exists
				db.run(`CREATE TABLE users(
					id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
					username TEXT NOT NULL,
					hashedPassword TEXT NOT NULL,
					cookie TEXT,
					cookieExpires INTEGER
				)`);
			}
		});
	} else {
		console.error("/!\\ SOMETHING WENT WRONG /!\\");
		console.error(error);
	}
});

// Closes the server when a Control+C is used to shut it down
function shutdownDatabase(event) {
	console.log("SIGINT");
	db.close();
	process.exit(0);
};
process.on('SIGINT', shutdownDatabase)


module.exports = db;
