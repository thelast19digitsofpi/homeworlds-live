// base.js
//
// Runs the actual server. Exports the HTTPS server and the Express app.

// Glitch hosting only allows at most 12 hours straight.
const launchTime = Date.now();

// Requirements.
const https = require("https");
const http = require("http");
const fs = require("fs");
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const ip = require("ip");
const a2 = require("argon2"); // only for demo authentication

const cookieParser = require('cookie-parser');


const app = express();
let server = null;

// If running on glitch.com, use a different option
if (process.env.MADE_WITH === "glitch.com") {
	server = http.createServer(app); // just use default http server internally
	// but use https here
	app.use(function(req, res, next) {
		// thanks to https://support.glitch.com/t/force-glitch-projects-to-use-https/5918
		if (req.get('X-Forwarded-Proto').indexOf("https") !== -1) {
			return next();
		} else {
			res.redirect('https://' + req.hostname + req.url);
		}
	});
} else {
	// running on local server
	// Load up HTTPS stuff.
	const options = {
		key: fs.readFileSync("key.pem"),
		cert: fs.readFileSync("cert.pem")
	};
	//console.warn("Options:", options);
	// Create the server.
	server = https.createServer(options, app);
}

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

const nodeEnv = process.env.NODE_ENV;
console.log(nodeEnv);
app.use(function(req, res, next) {
	res.locals.render = {};
	
	crypto.randomBytes(24, function(err, buf) {
		if (err) {
			throw err;
		}
		// base64 but made url-safe
		res.locals.render.nonce = buf.toString("base64");
		const devEval = (nodeEnv === "dev") ? " 'unsafe-eval'" : "";
		res.set("Content-Security-Policy", `script-src 'unsafe-inline' https: 'nonce-${res.locals.render.nonce}' 'strict-dynamic'` + devEval);
		next();
	});
});

app.get(/favicon\.ico/, function(req, res, next) {
	console.warn("Favicon requested");
	res.sendFile(path.join(__dirname, "favicon.ico"));
})

// launch the app!
const listener = server.listen(port, function() {
	console.log("Launching!!", listener.address().port);
	// for testing purposes
	console.log(ip.address());
});

module.exports = {
	app: app,
	httpsServer: server,
	// because Glitch hosting is unstable and turns off after 12 hours of constant running
	launchTime: launchTime
};
