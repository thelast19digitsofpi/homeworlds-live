
const {app} = require("./https.js");
const errorHandler = require("express-error-handler");


// this has to happen AFTER all modules are loaded
const handler = errorHandler({
	handlers: {
		404: function notFound(error, req, res) {
			console.log(arguments);
			return res.status(404).render("404", res.locals.render);
		},
	},
});

app.use(errorHandler.httpError(404));
app.use(handler);