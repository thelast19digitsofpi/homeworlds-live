// main-page.js
//
// Just adds an Express middleware for the main page (/)

const {app} = require("./https.js");

// Send the index.ejs file if the user goes to the root
app.get("/", function(req, res) {
 	res.render("index", res.locals.render);
});


// Opening specific games like /game/5
app.get("/game/:gameid", function(req, res) {
	res.render("game", res.locals.render);
});
