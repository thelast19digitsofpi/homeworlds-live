// otherPages.js
//
// When nothing else fits.

const {app} = require("./https.js");

// a little rant
app.get("/orDidI", function(req, res) {
	res.render("orDidI", res.locals.render);
});