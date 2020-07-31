// base.js
//
// Runs the actual server. Exports the HTTPS server and the Express app.

// Glitch hosting only allows at most 12 hours straight.
const launchTime = Date.now();

// Requirements.
const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const ip = require("ip");

const cookieParser = require('cookie-parser');

// Load up HTTPS stuff.
const options = {
	key: fs.readFileSync("key.pem"),
	cert: fs.readFileSync("cert.pem")
};
//console.warn("Options:", options);
// Create the server.
const app = express();
const httpsServer = https.createServer(options, app);

// Get listening port.
// if we are on Glitch, use process.env.PORT, otherwise use 3443
const port = process.env.PORT || 8443;



/*
Beginning of the app.use's
*/

app.set('trust proxy', true);

// Parse cookies
// may implement signed cookies at some point but not sure
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());

// Static directories.
app.use('/images', express.static("images"));
app.use('/styles', express.static("styles"));
app.use('/scripts', express.static("dist"));

// Use EJS
const ejs = require("ejs");
ejs.fileLoader = function(filePath) {
	return (fs.readFileSync(filePath)).toString()
		.replace(/<script/g, `<script nonce="<%- nonce %>"`);
}
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "../dist"));

app.use(function(req, res, next) {
	res.locals.render = {};
	
	crypto.randomBytes(24, function(err, buf) {
		if (err) {
			throw err;
		}
		// base64 but made url-safe
		res.locals.render.nonce = buf.toString("base64");
		res.set("Content-Security-Policy", `script-src 'nonce-${res.locals.render.nonce}'`);
		next();
	});
});

app.get(/favicon\.ico/, function(req, res, next) {
	console.warn("Favicon requested");
	res.sendFile(path.join(__dirname, "favicon.ico"));
})

// launch the app!
const listener = httpsServer.listen(port, function() {
	console.log("Launching!!", listener.address().port);
	// for testing purposes
	console.log(ip.address());
});


module.exports = {
	app: app,
	httpsServer: httpsServer,
	// because Glitch hosting is unstable and turns off after 12 hours of constant running
	launchTime: launchTime
};
