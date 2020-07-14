// main-page.js
//
// Just adds an Express middleware for the main page (/)

const {app} = require("./https.js");

// Send the index.ejs file if the user goes to the root
app.get("/", function(req, res) {
 	res.render("index", res.locals.render);
});

// The sandbox is a simple way to play around with Homeworlds positions
app.get("/sandbox", function(req, res) {
	res.render("sandbox", res.locals.render);
})

