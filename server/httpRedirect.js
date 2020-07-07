// httpRedirect.js
//
// Sets up a simple HTTP server that auto-redirects you to the HTTPS version.

const http = require("http");
const express = require("express");

// I only do this because http:// urls don't work normally
const httpApp = express();
httpApp.use((req, res, next) => {
	if(!req.secure) return res.redirect('https://' + req.get('host') + req.url);
	next();
});
const port = process.env.PORT || 8080;
httpApp.listen(port);
httpApp.set('trust proxy', true);
