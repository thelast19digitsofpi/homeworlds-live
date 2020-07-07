// util.js
//
// Provides utility functions

const crypto = require("crypto");

// Picks randomly from the array
function choose(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Promise version of crypto.getRandomBytes
function promiseifyFunction(fn) {
	return (function() {
		const args = arguments;
		return new Promise(function(resolve, reject) {
			fn(...args, function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	});
}


// Database stuff
function databaseCall(db, type, sql, params) {
	return new Promise(function(resolve, reject) {
		if (!db[type]) {
			reject(new Error("Bad type: " + type))
		} else {
			db[type](sql, params, function(err, row) {
				if (err) {
					reject(err);
				} else {
					resolve(row);
				}
			});
		}
	});
}

// Intentionally NOT an instance of Exception!
function UserError(message) {
	this.message = message;
	this.isUserError = true;
}

module.exports = {
	choose: choose,
	promiseify: promiseifyFunction,
	promiseCryptoBytes: promiseifyFunction(crypto.randomBytes),
	databaseCall: databaseCall,
	UserError: UserError,
};
