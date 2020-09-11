// accounts.js
//
// User accounts (login, etc).
// Also creates a middleware to validate cookies



let db = require("./database.js");
const {app} = require("./https.js");
const a2 = require("argon2");
const crypto = require("crypto");
const myUtil = require("./my-util.js");

// Express methods for database checking.


// Not sure of the best place to put these
const passwordOptions = {
	type: a2.argon2i,
	timeCost: 8,
	memoryCost: 12800,
	parallelism: 4,
	hashLength: 48,
	saltLength: 24,
};
// 1 hour
const COOKIE_LIFE = 1000 * 60 * 60;

// these could cause confusion so we declare them as already taken
const bannedUsernames = ["you", "player", "enemy", "cpu", "computer", "north", "south", "east", "west"]
async function isUsernameTaken(username) {
	// these are mostly deceptive ones like "you"
	if (bannedUsernames.indexOf(username.toLowerCase()) === -1) {
		return true;
	}
	
	try {
		const userData = await myUtil.databaseCall(db, "get", "SELECT * FROM users WHERE username = ?", [username]);
		console.log("[isUsernameTaken] username ->", userData);
		return userData !== undefined;
	} catch (error) {
		console.error("What?!", error);
		return true;
	}
}


function isUsernameValid(username) {
	if (typeof username !== "string") {
		console.log("Bad username: not a string. It is good to know that is possible...")
		return false;
	}
	// 3-16 characters
	if (username.length < 3 || username.length > 16) {
		return false;
	}
	
	// only letters, numbers, and some special characters are allowed
	if (/[^A-Za-z0-9\.!@#$%^&*\(\)_\-+= ]/.test(username)) {
		return false;
	}
	
	// spaces may not be at the beginning or end
	if (/^\s/.test(username) || /\s$/.test(username)) {
		return false;
	}
	
	return true;
}

// Hashes a cookie using sha256.
// I figure since cookies are not brute-forceable (192 bit random tokens), 
function hashCookie(cookie) {
	return crypto.createHmac("sha256", "cookie").update(cookie).digest("base64");
}

// Returns either a username (string) or null.
async function authenticateCookie(cookie) {
	// Get the sha256 of the cookie.
	const hashedCookie = hashCookie(cookie);
	try {
		const row = await myUtil.databaseCall(db, "get", "SELECT * FROM users WHERE cookie = ?", [hashedCookie]);
		if (row) {
			if (Date.now() < row.cookieExpires) {
				return row.username;
			}
		}
		return null;
	} catch (error) {
		console.error("[authenticateCookie] SQL error:", error);
		return null;
	}
}

// Renews the session cookie.
// This function can be called during socket connections or when you browse around.
// QUESTION: Should I change the cookie itself, or just the expire time?
// (note: the client will not know the cookie is invalid)
function renewCookie(username) {
	myUtil.databaseCall(db, 'run', "UPDATE users SET cookieExpires = ? WHERE username = ?", [Date.now() + COOKIE_LIFE, username]);
}

// Authenticating Cookies
app.use(async function(req, res, next) {
	const sessionCookie = req.cookies["hwl-session"];
	let valid = false;
	// Disallow zero-length cookies as that might disrupt things
	if (sessionCookie && sessionCookie.length > 0) {
		// Validate it
		const username = await authenticateCookie(sessionCookie);
		if (username) {
			// Cookie matches
			valid = true;
			res.locals.render.userInfo = {
				loggedIn: true,
				username: username,
			};
			// they successfully logged in, so renew the cookie for them
			renewCookie(username);
		}
	}
	
	console.warn("Cookie valid?", valid ? "YES" : "NO");
	
	// If they were not logged in...
	if (!valid) {
		res.locals.render.userInfo = {
			loggedIn: false,
		};
	}
	
	next();
});

// Login Screen (GET)
app.get("/login", function(req, res) {
	// so if the user is already authenticated, send them to the lobby
	if (res.locals.render.userInfo && res.locals.render.userInfo.loggedIn) {
		return res.redirect("/lobby");
	} else {
		// show login screen
		res.render("login", res.locals.render);
	}
});

// Create Account Screen (GET)
app.get("/createAccount", function(req, res) {
	// so if the user is already authenticated, just return them to the lobby
	const isValidCookie = false; // todo: obviously this needs to be legit
	if (isValidCookie) {
		return res.redirect("/");
	} else {
		// show account creation screen
		res.render("createAccount", res.locals.render);
	}
});

// Changing your Password
app.get("/changePassword", function(req, res) {
	if (res.locals.render.userInfo && res.locals.render.userInfo.loggedIn) {
		return res.render("changePassword", res.locals.render);
	} else {
		return res.redirect("/login");
	}
});

app.post("/changePassword", async function(req, res) {
	console.log("Changing password");
	// Who is this?
	const username = res.locals.render.userInfo.username;
	if (!username) {
		console.log("changePassword: Not Logged In");
		// you aren't logged in
		return res.redirect("/login");
	}
	
	// Query database to find the user
	try {
		const row = await myUtil.databaseCall(db, "get", "SELECT * FROM users WHERE username = ?", [username]);
		if (!row) {
			// you don't exist (?!)
			console.warn("[POST changePassword] This isn't good! POST to changePassword but user does not exist");
			return res.redirect("/login");
		}
		
		const correct = await a2.verify(row.hashedPassword, req.body.oldPassword);
		if (correct) {
			// now check if the new passwords match
			const newPassword = req.body.newPassword;
			if (typeof newPassword !== "string") {
				// Password is not a string
				console.warn("How did they send a non-string as their password?");
				return res.send("That doesn't look like a password. Were you hacking? If not, please try again.");
			} else if (newPassword !== req.body.confirmPassword) {
				// Confirm-password is not identical
				res.locals.render.error = "The new passwords do not match.";
				return res.render("changePassword", res.locals.render);
			} else if (newPassword.length < 12 || newPassword.length >= 100) {
				// password length out of range
				res.locals.render.error = "The new password must be between 12 and 99 characters.";
				return res.render("changePassword", res.locals.render);
			} else {
				// Yay! It's valid!
				
				// We can send the user to the lobby now.
				a2.hash(newPassword, passwordOptions).then(function(hash) {
					myUtil.databaseCall(db, "run", "UPDATE users SET hashedPassword = ? WHERE username = ?", [hash, username]);
				});
				return res.redirect("/lobby");
			}
		} else {
			res.locals.render.error = "The old password was incorrect. Please try again.";
			return res.render("changePassword", res.locals.render);
		}
	} catch (error) {
		res.locals.render.error = "Something went wrong. It could be that you are not logged in.";
		return res.status(500).render("login", res.locals.render);
	}
});

// Logging in
app.post("/login", async function(req, res) {
	console.log("POST to login");
	
	// First get the username
	const username = req.body.username;
	const passwordGuess = req.body.password;
	
	// Query database for user
	try {
		const row = await myUtil.databaseCall(db, "get", "SELECT * FROM users WHERE username = ?", [username]);
		let invalid = true;
		if (!row) {
			// pretend to care about the password
			// this is the hash of something I computed during testing
			await a2.verify("$argon2d$v=19$m=12800,t=8,p=4$6Qusa8rgnoE2qPS4Xm4KSjf4GXw4vqN5$OKiKl0NranAXgCreJtoO2yl+g9BByUrk1/wY0fP0XPvDMowIS9p9t8tZ99m/vvqo", passwordGuess);
		} else {
			// verify the password
			const correct = await a2.verify(row.hashedPassword, passwordGuess);
			if (correct) {
				invalid = false;
			}
		}
		
		if (invalid) {
			res.locals.render.error = "The username or password is incorrect.";
			return res.render("login", res.locals.render);
		} else {
			// You have successfully logged in
			// 33 bytes, because that is divisible by 3 and thus base64 encodes nicely
			const cookie = (await myUtil.promiseCryptoBytes(33))
				.toString('base64')
				// url safe
				.replace(/\//g, "-").replace(/\+/g, "_");
			// Put the cookie in the http headers
			res.append('Set-Cookie', `hwl-session=${cookie}; Path=/; HttpOnly`);
			// Put the hashed cookie in the database
			myUtil.databaseCall(db, 'run', "UPDATE users SET cookie = ?, cookieExpires = ? WHERE username = ?", [hashCookie(cookie), Date.now() + COOKIE_LIFE, username]);
			return res.redirect("/lobby");
		}
	} catch (error) {
		return res.status(500).send("500 Internal Server Error: " + error.message);
	}
});

// Creating Account
app.post("/createAccount", async function(req, res) {
	console.log("POST to createAccount");
	
	const username = req.body.username;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword; // I hope this works
	
	if (password !== confirmPassword) {
		res.locals.render.username = username;
		res.locals.render.error = {
			type: "confirmPassword",
			message: "Passwords do not match.",
		};
		return res.status(400).render("createAccount", res.locals.render);
	}
	if (password.length < 12 || password.length >= 100) {
		res.locals.render.username = username;
		res.locals.render.error = {
			type: "password",
			message: "Your password must be at least 12 characters and not more than 99.",
		};
		return res.render("createAccount", res.locals.render);
	}
	
	// check if the username is reserved (like "north" or "you" or "player")
	if (bannedUsernames.indexOf(username) >= 0) {
		res.locals.render.username = username;
		res.locals.render.error = {
			type: "username",
			message: "That username is reserved. Please pick another.",
		};
		return res.render("createAccount", res.locals.render);
	}
	
	// check if the username is taken
	if (await isUsernameTaken(username)) {
		res.locals.render.username = username;
		res.locals.render.error = {
			type: "username",
			message: "That username is already taken. Please pick another.",
		};
		return res.render("createAccount", res.locals.render);
	}
	
	if (!isUsernameValid(username)) {
		res.locals.render.username = username;
		res.locals.render.error = {
			type: "username",
			message: "This username is not valid. Please pick another.",
		};
		return res.render("createAccount", res.locals.render);
	}
	
	// create their account
	try {
		const hashedPassword = await a2.hash(password, passwordOptions);
		
		// Create the cookie for this session
		const cookie = (await myUtil.promiseCryptoBytes(33)).toString('base64')
			.replace(/\+/g, "_").replace(/\//g, "-");
		// Put the raw cookie in the http header
		res.append('Set-Cookie', `hwl-session=${cookie}; Path=/; HttpOnly`);
		// Append the user to the database!!
		await myUtil.databaseCall(db, "run", "INSERT INTO users VALUES (null, ?, ?, ?, ?)",
			[username, hashedPassword, hashCookie(cookie), Date.now() + COOKIE_LIFE]);
		// When they log in, redirect them to the lobby
		return res.redirect("/lobby");
	} catch (error) {
		console.error("Something Weird Happened");
		console.error(error);
		return res.status(500).send("500 Unknown Error. Please try again, or more likely, report a bug.");
	}
});

// Log Out
// Note that technically this is a side effect but you should be able to type /logout in the web browser
app.get("/logout", function(req, res) {
	if (res.locals.render.userInfo.loggedIn) {
		const username = res.locals.render.userInfo.username;
		// we do not actually need a callback, as this can run on its own
		db.run("UPDATE users SET cookie = NULL, cookieExpires = 0 WHERE username = ?", [username]);
	}
	return res.redirect("/");
});

module.exports = {
	cookieLife: COOKIE_LIFE,
	renewCookie: renewCookie,
	authenticateCookie: authenticateCookie,
};
