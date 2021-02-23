// complaints.js
//
// for bug reports and feature requests

const {app} = require("./https.js");
const db = require("./database.js");
const {databaseCall} = require("./my-util.js");

function launchComplaintDatabase() {
	db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='complaints';", [], function(error, stuff) {
		if (error === null) {
			console.log("Complaints success!");
			if (!stuff) {
				// table does not exist
				db.run(`CREATE TABLE complaints(
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					date INTEGER,
					description TEXT,
					completed BOOLEAN
				)`);
			}
		} else {
			console.log("SOMETHING WENT WRONG!!");
			console.log(error);
		}
	});
}

launchComplaintDatabase();


app.get("/complain", function(req, res, next) {
	return res.render("complain", res.locals.render);
});

// post requests are neat
app.post("/complain", function(req, res, next) {
	res.locals.render.formData = {};
	let description = req.body.description;
	if (typeof description === "string") {
		// truncate
		description = description.substring(0, 1000);
		res.locals.render.formData.description = description;
	} else {
		res.locals.render.error = "Invalid description. Have you been, like, hacking or something?";
		return res.render("complain");
	}
	
	const date = Date.now();
	db.run("INSERT INTO complaints VALUES (NULL, ?, ?, 0)", [date, description]);
	return res.render("complainSuccess", res.locals.render);
});
