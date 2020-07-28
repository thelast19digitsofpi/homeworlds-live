// elo.js
//
// simple Elo rating system

const db = require("./database.js");
const myUtil = require("./my-util.js");

const INITIAL_RATING = 1500;
const RATING_FLOOR = 100;

function launchEloDatabase() {
	db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='elo';", [], function(error, stuff) {
		if (error === null) {
			console.log("Elo success!");
			if (!stuff) {
				// table does not exist
				db.run(`CREATE TABLE elo(
					userID INTEGER,
					rating INTEGER,
					FOREIGN KEY(userID) REFERENCES users(id)
				)`)
			}
		} else {
			console.log("SOMETHING WENT WRONG!!");
			console.log(error);
		}
	});
}

// is this proper?
launchEloDatabase();

// "result" is 1 for first player wins, 0.5 for draw, 0 for first player loses
// returns an array [newRating1, newRating2]
function getAdjustedRatings(result, rating1, rating2) {
	const factor1 = Math.pow(10, rating1/300);
	const factor2 = Math.pow(10, rating2/300);
	const k = 32; // todo: maybe change based on number of games?
	
	const expectedScore = factor1 / (factor1 + factor2);
	return [
		Math.round(rating1 - k * (expectedScore - result)),
		Math.round(rating2 + k * (expectedScore - result))
	];
}

async function getRatingByUsername(username) {
	try {
		const userData = await myUtil.databaseCall(db, "get", "SELECT id FROM users WHERE username = ?", [username]);
		if (userData) {
			// their id is data.id
			const eloData = await myUtil.databaseCall(db, "get", "SELECT rating FROM elo WHERE userID = ?", [userData.id]);
			if (eloData) {
				return eloData.rating || INITIAL_RATING;
			} else {
				return INITIAL_RATING;
			}
		} else {
			console.warn("Username not found in database at all!");
			return -1;
		}
	} catch (error) {
		console.error("[getRatingByUsername] SOMETHING WENT WRONG!!");
		console.error(error);
	}
	return -1;
}

async function setRatingByUsername(username, rating) {
	try {
		const userData = await myUtil.databaseCall(db, "get", "SELECT id FROM users WHERE username = ?", [username]);
		if (userData) {
			// their id is data.id
			const eloData = await myUtil.databaseCall(db, "get", "SELECT 1 FROM elo WHERE userID = ?", [userData.id]);
			if (eloData) {
				// modify the existing rating
				myUtil.databaseCall(db, "run", "UPDATE elo SET rating = ? WHERE userID = ?", [rating, userData.id]);
			} else {
				// they were unrated
				// so add a rating to the table
				myUtil.databaseCall(db, "run", "INSERT INTO elo VALUES (?, ?)", [userData.id, rating]);
			}
		} else {
			console.warn("Username not found in database at all!");
			return -1;
		}
	} catch (error) {
		console.error("[getRatingByUsername] SOMETHING WENT WRONG!!");
		console.error(error);
	}
	return -1;
}

// This function actually adjusts the ratings in the table.
// Again, 1 = first player wins, etc.
async function updateUserRatings(result, username1, username2) {
	const rating1 = await getRatingByUsername(username1);
	const rating2 = await getRatingByUsername(username2);
	// hope no errors occurred
	if (rating1 !== -1 && rating2 !== -1) {
		const newRatings = getAdjustedRatings(result, rating1, rating2);
		// these are also async but we do not care
		setRatingByUsername(username1, newRatings[0]);
		setRatingByUsername(username2, newRatings[1]);
		// e.g. { "alice": [1500, 1516], "bob", [1500, 1484] }
		return {
			[username1]: [rating1, newRatings[0]],
			[username2]: [rating2, newRatings[1]],
		};
	} else {
		console.log("Some rating failed!");
	}
}

function test() {
	const tests = [
		[0, 1500, 1500],
		[0.5, 1500, 1500],
		[1, 1500, 1500],
		[0, 1400, 1600],
		[1, 1400, 1600],
		[0, 1000, 2000],
		[0.5, 1000, 2000],
		[1, 1000, 2000],
	];

	for (let i = 0; i < tests.length; i++) {
		console.log("Elo Test", tests[i], "result: ", getAdjustedRatings.apply(null, tests[i]));
	}
}

module.exports = {
	getAdjustedRatings: getAdjustedRatings,
	getRatingByUsername: getRatingByUsername,
	setRatingByUsername: setRatingByUsername,
	updateUserRatings: updateUserRatings,
	
	test: test,
};
