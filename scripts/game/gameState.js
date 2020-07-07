// gameState.js
//
// Generic immutable single game state.
// Designed to work with both client and server. No React code here!


class GameState {
	// Call as (map, phase, hwData, nextSystemID, turnOrder, turn, actions, winner)
	// or just as (players)
	// note: phase is string, either "setup" or "playing" or "end"
	constructor(mapOrPlayers, phase, hwData, nextSystemID, turnOrder, turn, actions, winner) {
		if (arguments.length <= 1) {
			// just an array of players
			const players = mapOrPlayers || ["south", "north"];
			this.map = GameState.createEmptyMap(players.length);
			this.homeworldData = {}; // will initialize soon
			this.nextSystemID = 1;
			this.turnOrder = players;
			this.turn = players[0]; // first element is first turn
			this.actions = {
				sacrifice: null,
				number: 1
			}
			this.phase = "setup";
			this.winner = null;
		} else {
			// the whole thing
			// because the methods return new GameState()s
			// (GameState is immutable)
			this.map = mapOrPlayers;
			this.phase = phase;
			this.homeworldData = hwData;
			this.nextSystemID = nextSystemID;
			this.turnOrder = turnOrder;
			this.turn = turn;
			this.actions = actions;
			this.winner = winner; // or still null, to indicate no-winner
		}
	}
	
	// Static function for constructing a GameState's map from scratch.
	static createEmptyMap(numPlayers) {
		const colors = ['b', 'g', 'r', 'y'];
		const sizes = 3;
		const specifiers = 'ABCDE';
		const numOfEachType = numPlayers + 1;
		
		let map = {};
		for (let i = 0; i < colors.length; i++) {
			for (let s = 1; s <= sizes; s++) {
				for (let j = 0; j < numOfEachType; j++) {
					const serial = colors[i] + String(s) + specifiers[j];
					map[serial] = null;
				}
			}
		}
		
		return map;
	}
	
	// Static function for recovering a GameState from a JSON-ified object.
	static recoverFromJSON(jsonOrObject) {
		let obj = jsonOrObject;
		if (typeof obj === "string") {
			obj = JSON.parse(obj);
		}
		
		return new GameState(
			obj.map,
			obj.phase,
			obj.homeworldData,
			obj.nextSystemID,
			obj.turnOrder,
			obj.turn,
			obj.actions,
			obj.winner
		);
	}
	
	/*
	I now divide the methods into categories.
	The methods below are basic queries.
	*/
	
	// Basic method to get all pieces at a particular system.
	// Returns array of {serial: "", owner: ""}. As usual, owner=null means star.
	getAllPiecesAtSystem(systemID) {
		var pieces = [];
		for (let serial in this.map) {
			let info = this.map[serial];
			if (info && info.at === systemID) {
				pieces.push({
					serial: serial,
					owner: info.owner
				});
			}
		}
		return pieces;
	}
	
	// Gets the smallest piece of a specific color. Returns serial number.
	// Returns null if no piece of the color is available.
	getSmallestPieceInStash(color) {
		const letters = "ABCDE";
		for (let size = 1; size <= 3; size++) {
			for (let i = 0; i < 3; i++) {
				let serial = color + size.toString() + letters[i];
				if (this.map[serial] === null) {
					return serial;
				}
			}
		}
		return null;
	}
	
	// Like the above, but also uses a size.
	// You can pass either ('b', 2) or ('b2').
	// Returns "null" if failed.
	getPieceInStashByType(color, size) {
		if (typeof size === "undefined") {
			// they must have passed "b2" in the color string
			size = Number(color[1]);
			color = color[0];
		}
		
		const letters = "ABCDE";
		for (let i = 0; i < 3; i++) {
			let serial = color + size.toString() + letters[i];
			if (this.map[serial] === null) {
				return serial;
			}
		}
		return null;
	}
	
	// Like the above, but a more intuitive version for yes/no answers.
	// Returns a boolean for if the piece is in the stash.
	pieceExistsInStash(color, size) {
		if (arguments.length === 2) {
			// they must have passed "b2" in the color string
			size = Number(color[1]);
			color = color[0];
		}
		
		const letters = "ABCDE";
		for (let i = 0; i < 3; i++) {
			let serial = color + size.toString() + letters[i];
			if (this.map[serial] === null) {
				return true;
			}
		}
		return false;
	}
	
	// Gets all the color powers a given player can have at a given system.
	// Returns object with the colors as keys, e.g. {'b': true, 'r': true} if you can trade and attack.
	// Returns empty object if the player has no ships there or the system does not exist.
	getPowersAtSystem(player, systemID) {
		let powers = {};
		let playerHasAnyShipsThere = false;
		for (let serial in this.map) {
			// The piece must be at the system, and either unowned (i.e. a star) or the player's
			const data = this.map[serial];
			// if that piece is there
			if (data && data.at === systemID) {
				if (data.owner === null || data.owner === player) {
					// Set the associated power to true.
					powers[serial[0]] = true;
				}
				// Also check for the player having a ship there
				if (data.owner === player) {
					playerHasAnyShipsThere = true;
				}
			}
		}
		
		if (playerHasAnyShipsThere) {
			return powers;
		} else {
			return {};
		}
	}
	
	// Gets all stars at a system.
	// Returns array of serial numbers.
	getStarsAtSystem(systemID) {
		let stars = [];
		for (let serial in this.map) {
			const data = this.map[serial];
			// the piece must be in play, at that system, and be a star
			if (data && data.at === systemID && data.owner === null) {
				stars.push(serial);
			}
		}
		return stars;
	}
	
	// Pass in 2 parameters, each either a piece or an array of pieces.
	// Returns true if all sizes in star1 are different from every size in star2.
	areStarsConnected(stars1, stars2) {
		// Convert them both into arrays.
		if (!(stars1 instanceof Array)) {
			stars1 = [stars1];
		}
		if (!(stars2 instanceof Array)) {
			stars2 = [stars2];
		}
		
		// If either is empty, then return false (can't move to nonexistent system!)
		if (stars1.length === 0 || stars2.length === 0) {
			return false;
		}
		
		for (let i = 0; i < stars1.length; i++) {
			const a = stars1[i];
			for (let j = 0; j < stars2.length; j++) {
				const b = stars2[j];
				// [1] on a serial number is the size (2 in b2C)
				if (a[1] === b[1]) {
					// Matching size between the 2 systems
					return false;
				}
			}
		}
		return true;
	}
	
	// Checks if a system is overpopulated with the given color (4+ pieces there).
	isSystemOverpopulated(color, systemID) {
		let matches = 0;
		for (let serial in this.map) {
			const data = this.map[serial];
			if (data && data.at === systemID) {
				// Check if the color matches
				if (serial[0] === color) {
					// that is one extra ship there!
					matches += 1;
				}
			}
		}
		// catastrophe begins at 4
		return matches >= 4;
	}
	
	// Checks if a player has color power in some system.
	// Slightly cleaner than calling getPowersAtSystem plus checking sacrifice
	hasPower(player, color, systemID) {
		const hasDirect = this.getPowersAtSystem(player, systemID)[color];
		// indirect access to color via sacrifice
		const hasIndirect = this.actions.sacrifice === color;
		const hasActions = this.actions.number > 0;
		// you need an action, and either direct or indirect technology
		return hasActions && (hasDirect || hasIndirect);
	}
	
	// Gets the active player's homeworld system id.
	activePlayerHomeworld() {
		return this.homeworldData[this.turn];
	}
	
	// Gets all pieces at the homeworld systems. Only the owner's pieces are concerned!
	// Returns something like { "north": { stars: [], ships: [] }, ... }
	getPiecesAtHomeworlds() {
		let homeworlds = {};
		for (let player in this.homeworldData) {
			homeworlds[player] = {
				stars: [],
				ships: [],
			};
		}
		
		// Now loop over the map
		for (let serial in this.map) {
			const data = this.map[serial];
			if (data) {
				// Check if it is at any homeworld
				// (if a player has not set up yet, they will not be included here)
				for (let player in this.homeworldData) {
					// homeworldData stores which systems are homeworld systems
					// mapping is homeworldData[player] = systemID
					if (data.at === this.homeworldData[player]) {
						// final if statement: owner's ships go in one array, stars in the other
						if (data.owner === player) {
							// ship!
							homeworlds[player].ships.push(serial);
						} else if (data.owner === null) {
							// star!
							homeworlds[player].stars.push(serial);
						}
						// else, invader ship, do nothing.
					}
				}
			}
		}
		
		// we have our data
		return homeworlds;
	}
	
	/*
	The next few methods check for availability of a standard action.
	NONE of them actually check for color power in the system!
	This is because we do not know if the player has sacrificed a ship.
	So:
	- Build only checks if there is an old ship of that color in the system,
	and a new one in the bank.
	- Trade only checks if the old ship exists and the new ship exists in the bank.
	- Move only checks if the ship exists and the systems exist and are connected.
	- Discover checks the above and if the new star exists in the bank.
	- Attack checks if the enemy ship exists and the player has a strong enough ship there.
	
	Requires the full serial number (b2A) for the ship; partials (b2) do not work here.
	*/
	
	// Checks if the given player can build the given color at the given system.
	// NOTE: Does NOT check for access to green technology (due to sacrifices)!!
	canBuildColor(player, color, systemID) {
		// This can fail if there are no pieces in the stash,
		// or you do not have that color there.
		let hasThisColor = false;
		let pieceInStash = false;
		for (let serial in this.map) {
			const data = this.map[serial];
			// We actually are only concerned with pieces of one particular color
			if (serial[0] === color) {
				if (data === null) {
					// We found something in the stash!
					pieceInStash = true;
				} else if (data.at === systemID && data.owner === player) {
					// We found a ship of the right color!
					hasThisColor = true;
				}
			}
		}
		
		return hasThisColor && pieceInStash;
	}
	
	// Checks if the given player can trade one ship for another.
	// The latter can be either in the form 'b', 'b2', or 'b2C'.
	// Returns false if the player does not own the old ship,
	// or there is no appropriate piece in the bank.
	// Calls pieceExistsInStash().
	canTrade(player, oldSerial, newShip) {
		const data = this.map[oldSerial];
		// Is your old ship in the bank? Do you even own it?
		if (!data || data.owner !== player) {
			return false;
		}
		// Cannot trade a ship for its own color
		if (oldSerial[0] === newShip[0]) {
			return false;
		}
		// Varying procedure depending on how much info we have
		if (newShip.length === 1) { // just a color
			// Whew. Does something of the correct size and color exist? Return that answer.
			return this.pieceExistsInStash(newShip, Number(oldSerial[1]));
		} else if (newShip.length === 2) { // color & size, like on SDG
			// Catch size mismatches right here!
			if (oldSerial[1] !== newShip[1]) {
				return false;
			}
			
			return this.pieceExistsInStash(newShip[0], Number(newShip[1]));
		} else { // full serial number
			// we specified the entire piece we want
			// just make sure it is not in use, and the size matches
			return this.map[newShip] === null && oldSerial[1] === newShip[1];
		}
	}
	
	// Checks if the given player could possibly trade that ship for anything.
	// If not, we do not want to give them a "Trade..." popup.
	couldPossiblyTrade(player, oldSerial) {
		for (let newSerial in this.map) {
			// It needs to be in the stash
			if (this.map[newSerial] === null) {
				// Check if compatible (different color, same size)
				if (oldSerial[0] !== newSerial[0] && oldSerial[1] === newSerial[1]) {
					// Yep, this is tradeable
					return true;
				}
			}
		}
		
		// No ship found
		return false;
	}
	
	// Checks if the player can move the given ship to the given system.
	// The destination system must exist. Use checkDiscover() otherwise.
	// Returns false if the ship is not owned by the player,
	// or the systems are not connected.
	// Calls getStarsAtSystem() and areStarsConnected().
	canMove(player, serial, destination) {
		const data = this.map[serial];
		// as usual, exit immediately if the ship is not owned by the player
		if (!data || data.owner !== player) {
			return false;
		}
		
		// get the ship's system
		const fromStars = this.getStarsAtSystem(data.at);
		const toStars = this.getStarsAtSystem(destination);
		return this.areStarsConnected(fromStars, toStars);
	}
	
	// Checks if the player can use one piece to discover another as a system.
	// Returns false if either:
	// (1) The ship is not owned by the player.
	// (2) The star piece is not in the bank.
	// (3) The ship's system is not connected to the new star.
	canDiscover(player, shipSerial, starSerial) {
		const shipData = this.map[shipSerial];
		// If the player does not own it:
		if (!shipData || shipData.owner !== player) {
			console.log("Not yours!", shipData);
			return false;
		}
		// If the star piece is in use, this will be an object
		if (this.map[starSerial]) {
			console.log("Piece in use!", this.map[starSerial])
			return false;
		}
		// I feel like people will hack and try to discover a g4 or something.
		if (!this.map.hasOwnProperty(starSerial)) {
			console.log("Piece does not exist. Piece never existed.", starSerial);
			return false;
		}
		
		// Get the player's system.
		const fromStars = this.getStarsAtSystem( shipData.at);
		console.log("From", fromStars, "to", starSerial);
		// It needs to be connected to the new star!
		return this.areStarsConnected(fromStars, starSerial);
	}
	
	// Checks if the player can attack (steal) the given ship.
	// Returns false if either:
	// (1) The piece is in the bank, is a star, or is owned by the player already.
	// (2) The ship is in a system where the player has no ships of that size or larger.
	canSteal(player, targetSerial) {
		const tData = this.map[targetSerial];
		if (!tData || !tData.owner || tData.owner === player) {
			// in bank, is a star, or already yours
			console.log("Ship must belong to an opponent", tData);
			return false;
		}
		
		// Loop over all other pieces.
		// Check for a ship owned by player in the same system.
		for (let serial in this.map) {
			const data2 = this.map[serial];
			// must be on the board, at the given system, owned by the player
			if (data2 && data2.at === tData.at && data2.owner === player) {
				// The ship must also be larger than or equal to the target!
				// remember [1] is the size.
				if (Number(serial[1]) >= Number(targetSerial[1])) {
					return true;
				}
			}
		}
		// noneFoundReturnFalse
		return false;
	}
	
	// There is no such thing as you "can't" end your turn.
	// But there can be warnings.
	
	
	/*
	Action maps.
	
	WARNING: These do NOT update anything!
	They ONLY return a new version of the map with the specified action, NOTHING else!
	
	WARNING: These also do NOT clean up the map (of abandoned ships/stars).
	
	I am not sure if I want these to check for non-damaging errors.
	However, really bad errors (like building a b2F or discovering a y4) will throw.
	*/
	
	// The state is immutable
	copyMap(oldMap) {
		let newMap = {};
		for (let serial in oldMap) {
			newMap[serial] = oldMap[serial];
		}
		return newMap;
	}
	
	// Builds the specified piece (by serial number) at the specified system to belong to player.
	buildMap(player, piece, systemID) {
		if (!this.map.hasOwnProperty(piece)) {
			throw new Error("build: piece " + piece + " does not exist in the game.");
		}
		if (this.map[piece]) {
			throw new Error("build: piece " + piece + " is already on the map");
		}
		
		// that was surprisingly easy!
		// of course we have to return a new map
		let newMap = this.copyMap(this.map);
		newMap[piece] = {
			owner: player,
			at: systemID
		};
		return newMap;
	}
	
	// Trades oldPiece for newPiece. The former is returned to the bank.
	// I think this one actually does a full error check.
	// After all, being able to trade stars or create new pieces is a really bad thing.
	tradeMap(player, oldPiece, newPiece) {
		if (!this.map.hasOwnProperty(oldPiece) || !this.map.hasOwnProperty(newPiece)) {
			throw new Error("trade: one or more pieces is illegal (must be a serial number)");
		}
		// being able to trade for a star marker could have dire consequences
		if (this.map[newPiece]) {
			throw new Error("trade: piece " + newPiece + " is already on the map");
		}
		// we need this because we reference oldPiece
		if (!this.map[oldPiece]) {
			throw new Error("trade: piece " + oldPiece + " is in the stash");
		}
		// ignoring this could cause serious problems
		if (this.map[oldPiece] && this.map[oldPiece].owner !== player) {
			throw new Error("trade: piece " + oldPiece + " does not belong to the player");
		}
		
		// return a new map with one change
		let newMap = this.copyMap(this.map);
		newMap[oldPiece] = null; // return to stash
		newMap[newPiece] = {
			// put the new piece right where the old one was
			at: this.map[oldPiece].at,
			owner: this.map[oldPiece].owner,
		};
		return newMap;
	}
	
	// Moves oldPiece to a new system.
	// This method is quite dangerous.
	moveMap(oldPiece, systemID) {
		if (!this.map[oldPiece]) {
			throw new Error("move: Piece Does Not Exist");
		}
		if (this.map[oldPiece].owner === null) {
			throw new Error("move: Piece is a star. You cannot move stars.");
		}
		
		let newMap = this.copyMap(this.map);
		newMap[oldPiece].at = systemID;
		return newMap;
	}
	
	// Discovers a system and moves there. The ID of the new system must be provided.
	discoverMap(newID, ship, star) {
		if (!this.map[ship]) {
			throw new Error("discover: Ship does not exist");
		}
		if (this.map[ship].owner === null) {
			throw new Error("discover: So-called \"ship\" is a star.");
		}
		if (!this.map.hasOwnProperty(star)) {
			throw new Error("discover: The star piece does not exist in the game.");
		}
		if (this.map[star]) {
			throw new Error("discover: The star piece is in use already.");
		}
		
		let newMap = this.copyMap(this.map);
		// make it a star.
		newMap[star] = {
			at: newID,
			owner: null,
		};
		newMap[ship].at = newID;
		return newMap;
	}
	
	// Sacrifices the ship. Returns the map with that ship gone.
	sacrificeMap(serial) {
		if (!this.map[serial]) {
			throw new Error("sacrifice: Sacrifice piece is in the bank.");
		}
		if (this.map[serial].owner === null) {
			throw new Error("sacrifice: Cannot sacrifice a star.");
		}
		
		let newMap = this.copyMap(this.map);
		newMap[serial] = null; // it's gone
		return newMap;
	}
	
	// Gets the number and type of actions you would have after sacrificing.
	getSacrificeActions(serial) {
		return {
			number: Number(serial[1]),
			sacrifice: serial[0],
		};
	}
	
	// Steals a ship, i.e. makes it belong to the given player.
	stealMap(serial, player) {
		if (!this.map[serial]) {
			throw new Error("steal: Piece being stolen is in the bank.");
		}
		if (this.map[serial].owner === null) {
			throw new Error("steal: So-called \"ship\" being stolen is a star.");
		}
		let newMap = this.copyMap(this.map);
		newMap[serial].owner = player;
		return newMap;
	}
	
	// Returns the map after a catastrophe takes place of a color in a system.
	catastropheMap(color, systemID) {
		// Do nothing if the system is not overpopulated.
		if (!this.isSystemOverpopulated(color, systemID)) {
			return this.map;
		}
		
		var newMap = {};
		
		// If a catastrophe takes out the star, the entire system is destroyed.
		// But if it was half of a binary, the stuff not of the overpopulated color survives.
		let shipsThere = []; // in case we have to destroy them
		let foundSurvivingStar = false; // true if at least one star in the system survived
		
		for (let serial in this.map) {
			const data = this.map[serial];
			newMap[serial] = data; // copy over old data, at least for now
			if (data && data.at === systemID) {
				// Piece is at the system.
				if (serial[0] === color) {
					// Color matched! Return it to the stash!
					newMap[serial] = null;
				} else {
					// We found a piece NOT of the same color there.
					// If it is a star, then the other ships are safe.
					if (data.owner === null) {
						// Star.
						foundSurvivingStar = true;
					} else {
						// Ship.
						shipsThere.push(serial);
					}
					// Record it in the new map exactly as it was.
					newMap[serial] = this.map[serial];
				}
			}
		}
		
		// If no stars survived, delete all the ships that were at that system.
		// The system will naturally cease to exist.
		if (!foundSurvivingStar) {
			for (let i = 0; i < shipsThere.length; i++) {
				// set that ship's location data to null to move it into the stash
				newMap[shipsThere[i]] = null;
			}
		}
		return newMap;
	}
	
	// I cannot think of how to do this without looping twice.
	// This function finds systems with either ships or stars, but not both.
	// Second optional parameter is one system you want to preserve.
	
	// NOTE: This function actually does require oldMap to be passed!
	// This is because it is often called with the result of buildMap() or so.
	static clearLonersMap(oldMap, preserveSystem) {
		// Data will be organized as { systemID: { ships: true, stars: false }, ... }.
		
		// First, get all the systems
		let systemStatus = {};
		for (let serial in oldMap) {
			// If it is in play, record it in the system data.
			const data = oldMap[serial];
			if (data) {
				// It can either be a ship or a star.
				// If we have not seen that system before, create a template.
				if (!systemStatus[data.at]) {
					systemStatus[data.at] = { ships: false, stars: false };
				}
				
				// Now, update depending on what type this is
				if (data.owner === null) {
					// it is a star, so this system has a star
					systemStatus[data.at].stars = true;
				} else {
					// it is a ship
					systemStatus[data.at].ships = true;
				}
			}
		}
		
		// Now, for any object (ship or star) at a system with nothing of the other type, delete it.
		let newMap = {};
		for (let serial in oldMap) {
			const data = oldMap[serial];
			newMap[serial] = data; // copy over either the null or the data.
			if (data) {
				// If they sent us 1 system to preserve, then ignore any ships there
				if (data.at !== preserveSystem) {
					// Now check if the ship or star is actually abandoned!
					const hasShips = systemStatus[data.at].ships;
					const hasStars = systemStatus[data.at].stars;
					// If there are no stars OR no ships, then null.
					if (!hasShips || !hasStars) {
						newMap[serial] = null;
					} else {
						// Copy over the old stuff.
						newMap[serial] = data;
					}
				}
			}
		}
		
		return newMap;
	}
	
	/*
	Doing actions.
	
	Since GameState objects are immutable, these return new GameState()s.
	
	Yeah, these need to check for legality.
	If they are done illegitimately, an Error is thrown.
	*/
	
	// So in this version updateState returns a new GameState() object,
	// with the updates prescribed.
	// Format: Object with (all optional) properies:
	// map, hwData/homeworldData, nextSystemID, turn, actions
	// e.g. { map: ..., turn: "north", actions: {...} } will make it north's turn
	updateState(whatUpdated) {
		return new GameState(
			// order is map, phase, hwData, nextSystemID, turnOrder, turn, actions, winner
			whatUpdated.map || this.map,
			whatUpdated.phase || this.phase,
			// 2 different ways to pass homeworld data
			whatUpdated.hwData || whatUpdated.homeworldData || this.homeworldData,
			whatUpdated.nextSystemID || this.nextSystemID,
			this.turnOrder, // turn order never changes
			whatUpdated.turn || this.turn,
			whatUpdated.actions || this.actions,
			// Here we expect "null" as a draw, so we have to compare to "undefined"
			(whatUpdated.winner === undefined ? this.winner : whatUpdated.winner)
		);
	}
	
	// Returns a copy of the actions object with 1 less action. Has no guards.
	oneLessAction() {
		return {
			sacrifice: this.actions.sacrifice,
			number: this.actions.number - 1,
		};
	}
	
	// Whether or not there is appropriate actions remaining.
	hasActionsForColor(color) {
		// you need to have some actions left, and either no sacrifice or the specified color
		return this.actions.number > 0 && (this.actions.sacrifice === null || this.actions.sacrifice === color);
	}
	
	// These all start with "do" because they actually update the state!
	// You can pass null for star2 to create a handicap homeworld
	doHomeworld(player, star1, star2, ship) {
		console.log("[GameState.doHomeworld]", player, star1, star2, ship);
		// Fail if the game is not in setup mode
		if (this.phase !== "setup") {
			console.log(this.phase, "setup");
			throw new Error("It is not time for homeworld setup.");
		}
		// Fail if it is not your turn
		if (this.turn !== player) {
			throw new Error("It is not your turn to set up your homeworld.");
		}
		// Fail if any of the pieces are taken
		const pieces = [star1, ship];
		// You can neglect one of your stars if you really want to
		if (star2) {
			pieces.push(star2);
		}
		for (let i = 0; i < pieces.length; i++) {
			const freeToTake = this.map.hasOwnProperty(pieces[i]) && this.map[pieces[i]] === null;
			if (!freeToTake) {
				throw new Error("The piece " + pieces[i] + " is not available in the stash. If you have not been hacking, this is a bug.");
			}
		}
		// We use the number of actions to determine if you have your HW set up or not
		if (this.actions.number <= 0) {
			throw new Error("Your turn is over.");
		}
		
		// Do you already have a homeworld? (?!)
		if (this.homeworldData.hasOwnProperty(player)) {
			throw new Error("You already have a homeworld!");
		}
		
		// All right, I think all systems are go
		const newHomeworldData = {};
		// Copy everything into newHomeworldData
		for (let existingPlayer in this.homeworldData) {
			newHomeworldData[existingPlayer] = this.homeworldData[existingPlayer];
		}
		// Set up the map
		const newMap = this.copyMap(this.map);
		const system = this.nextSystemID;
		newHomeworldData[player] = system;
		// Stars are not "owned" by anyone
		newMap[star1] = {
			at: system,
			owner: null,
		};
		// You can legitimately enter a 1-star homeworld, hence the if statement
		if (star2) {
			newMap[star2] = {
				at: system,
				owner: null,
			};
		}
		// Ships are, though
		newMap[ship] = {
			at: system,
			owner: player
		};
		
		// Return the new state!
		return this.updateState({
			map: newMap,
			nextSystemID: system + 1,
			homeworldData: newHomeworldData,
			// consider that a spent action for better keeping of track
			actions: this.oneLessAction(),
		});
	}
	
	// Player is passed because we like to check for errors
	doBuild(player, buildWhat, system) {
		if (this.turn !== player) {
			throw new Error("It is not your turn");
		}
		// First check: player has actions left!
		if (!this.hasActionsForColor('g')) {
			throw new Error("You have no actions left, or you sacrificed a ship that is not green. You cannot build.");
		}
		
		// If you only asked to build a color, find the serial number now.
		// But I would recommend supplying exact serials directly.
		let serial = buildWhat;
		if (buildWhat.length === 1) {
			// Only a color
			serial = this.getSmallestPieceInStash(buildWhat);
		} else if (buildWhat.length === 2) {
			// Color and size
			serial = this.getPieceInStashByType(buildWhat);
		}
		// If we do not find anything, slam the brakes!
		if (serial === null) {
			throw new Error("The piece or color you want to build was not found in the stash!")
		}
		
		// If you have green (build) power OR sacrificed a green
		if (this.hasPower(player, 'g', system)) {
			// You have build power!
			// Can you build that ship?
			const colorToBuild = serial[0];
			if (this.canBuildColor(player, colorToBuild, system)) {
				// Is the ship requested the smallest available?
				const smallestPiece = this.getSmallestPieceInStash(colorToBuild);
				// Is the serial number requested compatible with the smallest piece in the stash?
				// (don't complain about building a g1C if the smallest is a g1B)
				// ...but DO complain if the piece requested is not in the stash!
				if (smallestPiece.substring(0, 2) === serial.substring(0, 2) && 
						this.map[serial] === null) {
					// Congratulations! You can build!
					const newMap = this.buildMap(player, serial, system);
					// Standard cleanup
					const cleanMap = GameState.clearLonersMap(newMap, this.activePlayerHomeworld())
					// We have to return the new state. GameStates are immutable!
					return this.updateState({
						map: cleanMap,
						actions: this.oneLessAction(),
					});
				} else {
					throw new Error("You cannot build that piece because it is not the smallest available piece of that color.");
				}
			} else {
				throw new Error("You cannot build that color in that system. You need a ship of the same color to also be there.");
			}
		} else {
			throw new Error("You cannot build in that system. You need access to GREEN technology, either using the star or one of YOUR ships.");
		}
	}
	
	// The old ship MUST be a serial number, but the new ship can be 'r', 'r2', or 'r2A'
	doTrade(player, oldSerial, newShip) {
		if (this.turn !== player) {
			throw new Error("It is not your turn");
		}
		if (!this.hasActionsForColor('b')) {
			throw new Error("You have no actions left, or you sacrificed a ship that is not blue. You cannot trade.");
		}
		
		// Check that the old serial is on the board
		if (!this.map[oldSerial]) {
			throw new Error("The \"ship\" you are trying to trade is not on the board! This could be a bug.");
		}
		
		// If the powers-that-be are on your side...
		if (this.hasPower(player, 'b', this.map[oldSerial].at)) {
			// You have trade power, that is good.
			if (this.canTrade(player, oldSerial, newShip)) {
				// again depends on newShip
				let newSerial;
				if (newShip.length === 1) {
					// e.g. convert (r2A, g) to g2
					newSerial = this.getPieceInStashByType(newShip + oldSerial[1])
				} else if (newShip.length === 2) {
					// just find the first such piece
					newSerial = this.getPieceInStashByType(newShip);
				} else {
					// we already have it
					newSerial = newShip;
				}
				
				if (!newSerial) {
					// Core dump!
					console.warn("[doTrade] Critical error happened with these parameters:", player, oldSerial, newShip);
					console.warn("Map:", this.map)
					throw new Error("Somehow that trade is invalid, and this is a bug because it should have been caught earlier!");
				}
				
				// OK, so now please do the trade.
				const newMap = this.tradeMap(player, oldSerial, newSerial);
				const cleanMap = GameState.clearLonersMap(newMap, this.activePlayerHomeworld())
				// update!
				return this.updateState({
					map: cleanMap,
					actions: this.oneLessAction(),
				});
			} else {
				// If you asked for a specific size...
				if (newShip[1] && newShip[1] !== oldSerial[1]) {
					throw new Error("You cannot make that trade. The sizes do not match.")
				} else {
					// some other issue
					throw new Error("You cannot make that trade. Probably the piece you want is not in the stash.");
				}
			}
		} else {
			throw new Error("You do not have access to blue (trade) technology there. You must either have a blue ship there, be at a blue star, or have sacrificed a blue ship anywhere.")
		}
	}
	
	// Still wants a system number...
	doMove(player, serial, system) {
		if (this.turn !== player) {
			throw new Error("It is not your turn");
		}
		if (!this.hasActionsForColor('y')) {
			throw new Error("You have no actions left, or you sacrificed a ship that is not yellow. You cannot move.");
		}
		
		// Check that the ship being moved is on the board
		if (!this.map[serial]) {
			throw new Error("The \"ship\" you are trying to move is not on the board! This could be a bug.");
		}
		// Check if the ship does not belong to you (including being a star)
		if (this.map[serial].owner !== player) {
			throw new Error("You do not own the ship. You can only move your own ships!");
		}
		
		// Do you have movement power?
		if (this.hasPower(player, 'y', this.map[serial].at)) {
			if (this.canMove(player, serial, system)) {
				// Nothing different to pick here
				const newMap = this.moveMap(serial, system);
				const cleanMap = GameState.clearLonersMap(newMap, this.activePlayerHomeworld());

				return this.updateState({
					map: cleanMap,
					actions: this.oneLessAction(),
				});
			} else {
				console.log(system);
				throw new Error("You cannot move there, because (probably) the systems are not connected. Systems are connected if and only if the stars are DIFFERENT sizes.");
			}
		} else {
			throw new Error("You do not have access to movement (yellow) technology in that system. You must have a yellow ship there, or be at a yellow star, or have sacrificed a yellow ship somewhere.");
		}
	}
	
	doDiscovery(player, ship, star) {
		if (this.turn !== player) {
			throw new Error("It is not your turn");
		}
		if (!this.hasActionsForColor('y')) {
			throw new Error("You have no actions left, or you sacrificed a ship that is not yellow. You cannot move.");
		}
		
		// The ship being moved is on the board...
		if (!this.map[ship]) {
			throw new Error("The \"ship\" you are trying to move is not on the board! This could be a bug.");
		}
		
		// Do you have yellow power?
		if (this.hasPower(player, 'y', this.map[ship].at)) {
			let starSerial = star;
			// If you only asked for a partial ('b2'), get the first available
			if (star.length === 2) {
				starSerial = this.getPieceInStashByType(this.map, star);
				if (starSerial === null) {
					throw new Error("No " + star + " piece exists in the stash to discover.");
				}
			}
			if (this.canDiscover(player, ship, star)) {
				// This has another effect: it increments the system counter by 1
				const newMap = this.discoverMap(this.nextSystemID, ship, star);
				const cleanMap = GameState.clearLonersMap(newMap, this.activePlayerHomeworld());
				// we also have to update the system number!
				return this.updateState({
					map: cleanMap,
					actions: this.oneLessAction(),
					nextSystemID: this.nextSystemID + 1,
				});
			} else {
				// If the piece is in use, put a more specific message 
				if (this.map[starSerial]) {
					throw new Error("The requested piece to discover is not in the stash.");
				} else {
					// some other error
					throw new Error("You cannot discover that star. Either the systems are not connected, or you do not own the ship.")
				}
			}
		} else {
			throw new Error("You do not have access to movement (yellow) technology in that system. You must have a yellow ship there, or be at a yellow star, or have sacrificed a yellow ship somewhere.");
		}
	}
	
	// The procedure for "steal y2 at system #5" is too complicated
	doSteal(player, ship) {
		if (this.turn !== player) {
			throw new Error("It is not your turn");
		}
		if (!this.hasActionsForColor('r')) {
			throw new Error("You have no actions left, or you sacrificed a ship that is not red. You cannot capture.");
		}
		
		// The ship being moved is on the board...
		if (!this.map[ship]) {
			throw new Error("The \"ship\" you are trying to capture is not on the board! This could be a bug.");
		}
		
		if (this.hasPower(player, 'r', this.map[ship].at)) {
			// OK, good.
			if (this.canSteal(player, ship)) {
				// Take over their ship!
				const newMap = this.stealMap(ship, player);
				// No need to clean up anything, I hope...
				// ...but maybe a good idea just because
				return this.updateState({
					map: GameState.clearLonersMap(newMap, this.activePlayerHomeworld()),
					actions: this.oneLessAction(),
				});
			} else {
				throw new Error("You cannot capture that ship. You must have a ship of that size or larger in the same system.")
			}
		} else {
			throw new Error("You do not have weapons technology there! You need to own a red ship there, be at a red star, or sacrifice a red ship somewhere.")
		}
	}
	
	// The other 2 special actions.
	doSacrifice(player, ship) {
		if (this.turn !== player) {
			throw new Error("It is not your turn");
		}
		// Sacrifice is a little different
		if (this.actions.sacrifice) {
			throw new Error("You have already sacrificed a ship for this turn.");
		}
		if (this.actions.number <= 0) {
			throw new Error("You have already done your action for this turn.");
		}
		
		// As always, the ship must exist.
		if (!this.map[ship]) {
			throw new Error("The \"ship\" you are trying to sacrifice is not on the board! This could be a bug or a faulty game record.");
		}
		
		// There is no power check here.
		if (this.map[ship].owner !== player) {
			throw new Error("You can only sacrifice YOUR SHIPS. That piece is either a star or an opponent's ship.");
		}
		
		// There are no "canSacrifice" methods either.
		const newMap = this.sacrificeMap(ship);
		const newActions = this.getSacrificeActions(ship);
		return this.updateState({
			map: GameState.clearLonersMap(newMap, this.activePlayerHomeworld()),
			actions: newActions
		});
	}
	
	doCatastrophe(color, system) {
		// Requires the fewest checks
		if (this.isSystemOverpopulated(color, system)) {
			const newMap = this.catastropheMap(color, system);
			const cleanMap = GameState.clearLonersMap(newMap, this.activePlayerHomeworld());
			// this is truly all we need
			return this.updateState({
				map: cleanMap
			});
		} else {
			throw new Error("That system is not overpopulated with that color so you cannot cause a catastrophe there.");
		}
	}
	
	// Checks players who may no longer be standing.
	// Returns a new version of the homeworldData object.
	getCleanHomeworldData() {
		// If the current phase is setting up homeworlds, stop.
		// First get all systems that are populated with both stars and ships.
		if (this.phase === "setup") {
			return this.homeworldData;
		}
		
		const newHWData = {};
		
		const homeworldPieces = this.getPiecesAtHomeworlds();
		for (let player in homeworldPieces) {
			const data = homeworldPieces[player]; // { stars: [...], ships: [owner's ships only] }
			// They must have a ship there and at least one star must survive
			if (data.stars.length > 0 && data.ships.length > 0) {
				// yay, you are still alive
				newHWData[player] = this.homeworldData[player];
			}
			// else you are not included i.e. DEAD!
		}
		
		return newHWData;
	}
	
	// Function to generate warnings if you are about to end your turn dangerously.
	// Should be called BEFORE endTurn() but after any actions are taken.
	// (Game stores a history of all actions.)
	getEndTurnWarnings() {
		let warnings = [];
		const you = this.turn;
		// If we are setting up the game...
		if (this.phase === "setup") {
			// Check for your homeworld setup.
			const allHWs = this.getPiecesAtHomeworlds();
			
			// Warnings to check:
			// (1) Ship is not large
			// (2) Only 1 star
			// (3) Stars are same size
			// (4) Stars are same color
			// (4) No Green
			// (5) No Blue
			const yourData = allHWs[you];
			const yourShips = yourData.ships;
			const yourStars = yourData.stars;
			const allPieces = yourShips.concat(yourStars);
			
			// OK...
			// So yourShips[0] is your only ship's serial; [1] is always the size. Is it 3?
			if (yourShips[0][1] !== "3") {
				warnings.push({
					// levels are "note", caution", "warning", "danger"
					level: "warning",
					message: "You seem to have started without a large ship! It is very important that you have a large ship to defend your homeworld.",
				});
			}
			// Do you only have 1 star?
			if (yourStars.length <= 1) {
				warnings.push({
					level: "danger",
					message: "You only have one star. You should start with a binary system (2 stars) so that it is much harder for your opponent to destroy your homeworld!",
				});
			} else {
				// Are your 2 stars the same size?
				if (yourStars[0][1] === yourStars[1][1]) {
					warnings.push({
						level: "caution",
						message: "You seem to have picked 2 stars of the same size. This could make it easier for your opponent to invade your homeworld, though it also may make it easier for you to grow...",
					});
				}
				// Are they the same color?!
				if (yourStars[0][0] === yourStars[1][0]) {
					warnings.push({
						level: "danger",
						message: "Uh oh! You picked 2 stars of the same color. This is not good because your opponent only needs 2 ships of that color to destroy your homeworld. This is very bad!",
					});
				}
			}
			
			// Check if you lack green or blue.
			let hasGreen = false;
			let hasBlue = false;
			for (let i = 0; i < allPieces.length; i++) {
				if (allPieces[i][0] === 'g') {
					hasGreen = true;
				}
				if (allPieces[i][0] === 'b') {
					hasBlue = true;
				}
			}
			
			if (!hasGreen) {
				warnings.push({
					level: "danger",
					message: "You do not have construction (green) technology in your homeworld! You will not be able to build new ships! This is bad.",
				});
			}
			if (!hasBlue) {
				warnings.push({
					level: "warning",
					message: "You do not have trading (blue) technology in your homeworld! This can make it more difficult to get into all four colors.",
				});
			}
			
			// 2-player games have additional warnings
			if (this.turnOrder.length === 2) {
				// Do your sizes match the opponent's?
				console.warn("todo... I want to get something else working first");
			}
		}
	}
	
	// Last and... kind of deserves to be last!
	doEndTurn() {
		// OK...
		// Here we do NOT give special treatment to the active player's homeworld.
		const cleanMap = GameState.clearLonersMap(this.map);
		// TODO: Check for destroyed homeworld systems
		// TODO: Check if all players are dead
		const newActions = {
			sacrifice: null,
			number: 1,
		};
		
		// OK, so in order to do this properly, we have to update the state twice.
		// First we update map and actions
		const tempState = this.updateState({
			map: cleanMap,
			actions: newActions
		});
		// Now we figure out who is still standing
		const newHWData = tempState.getCleanHomeworldData();
		
		// Are there only 0-1 players standing?
		const playersLeft = Object.keys(newHWData);
		if (playersLeft.length <= 1 && this.phase !== "setup") {
			// only one player standing OR all players are dead. Game over!
			const winner = playersLeft.length ? playersLeft[0] : null;
			return this.updateState({
				map: cleanMap,
				phase: "end",
				homeworldData: newHWData,
				winner: winner
			});
		} else {
			// Get the next turn.
			// Ignore destroyed homeworld players.
			const turnIndex = this.turnOrder.indexOf(this.turn);
			let nextPlayer = this.turn;
			const len = this.turnOrder.length;
			for (let i = 1; i < len; i++) {
				// Wrap around
				const newTurn = this.turnOrder[(turnIndex + i) % len];
				// If that player is still in the game OR has not set up yet
				if (newHWData[newTurn] || this.phase === "setup") {
					nextPlayer = newTurn;
					// and we want to stop searching now!
					break;
				}
			}
			// If we are setting up homeworlds and wrap around to the first player...
			let newPhase = this.phase;
			if (this.phase === "setup" && this.homeworldData[nextPlayer]) {
				// ...then it is no longer setup
				newPhase = "playing";
			}
			// We have the new map, the next player, and their default actions object.
			return this.updateState({
				map: cleanMap,
				phase: newPhase,
				turn: nextPlayer,
				actions: newActions,
				homeworldData: newHWData,
			});
		}
	}
	
	/*
	Clicking on a ship.
	
	The idea is that we show the user a pop-up with actions.
	*/
	
	// Gets available actions.
	// You click on:
	// (1) An existing ship of yours of some color, to build that color.
	// (2) A ship of yours, to trade it.
	// (3) A ship of yours, to move it.
	// (4) A ship of yours, to discover a new system.
	// (5) An enemy ship, to steal it.
	// (6) Any piece, to cause a catastrophe.
	// (7) A ship of yours, to sacrifice it.
	
	// NOTE: Clicking a piece in the bank first will NOT let you build, trade for, or discover it.
	getActionsAvailableForPiece(player, piece) {
		const map = this.map;
		// The piece must be on the board!
		if (!map[piece]) {
			return {};
		}
		let available = [];
		
		// Some common things
		const isYourShip = (map[piece].owner === player);
		const isStar = (map[piece].owner === null);
		const isEnemyShip = (!isYourShip && !isStar); // it can only be one of 3 things
		const system = map[piece].at;
		
		const actions = this.actions;
		
		if (isYourShip) {
			// You build by clicking on a similarly colored ship in the target system
			if (this.hasPower(player, 'g', system) && this.canBuildColor(player, piece[0], system)) {
				available.push({
					type: 'build',
					// put which ship the button would build
					newPiece: this.getSmallestPieceInStash(piece[0]),
					// this one has to know what system it is being built in
					system: system
				})
			}
			// You trade by first clicking on the ship you want to trade.
			// We do not yet know which piece you will trade it for.
			if (this.hasPower(player, 'b', system) && this.couldPossiblyTrade(player, piece)) {
				available.push({
					type: 'trade',
					oldPiece: piece
				})
			}
			// You move and discover by first clicking on the ship you want to move
			if (this.hasPower(player, 'y', system)) {
				// TODO: Again, this does not guarantee there are actually stars to move to
				available.push({
					type: 'move',
					oldPiece: piece
				})
				available.push({
					type: 'discover',
					oldPiece: piece
				})
			}
			// Stealing is done by clicking on the enemy piece which does not apply here
			// Sacrificing is done by clicking the piece you want to sacrifice
			if (actions.sacrifice === null && actions.number > 0) {
				available.push({
					type: 'sacrifice',
					oldPiece: piece
				})
			}
		} // end if (isYourShip)
		if (isEnemyShip) {
			if (this.hasPower(player, 'r', system) && this.canSteal(player, piece)) {
				available.push({
					type: 'steal',
					oldPiece: piece
				})
			}
		}
		// lastly, any piece can be involved in a catastrophe
		if (this.isSystemOverpopulated(piece[0], system)) {
			available.push({
				type: 'catastrophe',
				// not sure how I want to do this so for now I will be compatible
				oldPiece: piece,
				color: piece[0],
				system: system
			})
		}
		
		return available;
	}
}

// "module.exports" does not exist on the client...
if (typeof module !== "undefined") {
	module.exports = GameState;
}
