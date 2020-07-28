// tutorials.js
//
// just some express handling
// most of the work here is done on the client side

const {app} = require("./https.js");

app.get("/tutorial", function(req, res) {
	res.render("tutorial", res.locals.render);
});

app.get("/howThisWorks", function(req, res) {
	res.render("howThisWorks", res.locals.render);
});
