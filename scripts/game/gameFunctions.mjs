// gameFunctions.mjs
//
// Apparently gameState was not enough.
// I also have to share even more game-related functionality between server and client.

function getCompactSummary(allActions, players, winner, isInProgress) {
	console.log("Generating Summary!");
	const lines = [];
	// first line is players
	lines.push("Players: " + players.join(","));
	// second line is winner
	lines.push("Winner: " + (winner || "none"));
	for (let i = 0; i < allActions.length; i++) {
		// allActions is an array of arrays
		const turnActions = allActions[i];
		// closest thing JS has to a string builder
		const columns = [];
		for (let j = 0; j < turnActions.length; j++) {
			const action = turnActions[j];
			// format: action type (b=build t=trade m=move d=discover x=steal s=sacrifice c=catastrophe h=homeworld e=eliminate)
			let column = [];
			switch (action.type) {
				case "homeworld":
					column = ["h", action.star1, action.star2, action.ship];
					break;
				case "build":
					column = ["b", action.newPiece, action.system];
					break;
				case "trade":
					column = ["t", action.oldPiece, action.newPiece];
					break;
				case "move":
					// oldPiece is what you move
					column = ["m", action.oldPiece, action.system];
					break;
				case "discover":
					// oldPiece is what you move, newPiece is the new system
					// the system counter auto-increments
					column = ["d", action.oldPiece, action.newPiece];
					break;
				case "steal":
					// "x" because "s" is used for sacrifice (and "x" is capture in chess)
					column = ["x", action.oldPiece];
					break;
				case "sacrifice":
					column = ["s", action.oldPiece];
					break;
				case "catastrophe":
					column = ["c", action.color, action.system];
					break;
				case "eliminate":
					// for resignation
					column = ["e", action.player];
					break;
				default:
					console.log("[Game#getSummary] Invalid action!", action);
					break;
			}
			// parts of an action are separated by commas
			// e.g. "h,b1A,r2C,g3C"
			columns.push(column.join(","));
		}
		// if this is the last turn
		if (i === allActions.length - 1 && isInProgress) {
			columns.push("..."); // indicates ongoing turn
		}
		
		// actions are separated by semicolons
		// e.g. "s,g1A;b,y3C,5"
		if (columns.length === 0) {
			lines.push("pass");
		} else {
			lines.push(columns.join(";"));
		}
	}
	// turns are separated by newlines
	return lines.join("\n");
}

// gets the JSON for the map, specifically in a format I can use when building tutorials
function getMapJSON() {
	// JSON.stringify is not sufficient
	// I want it formatted my way
	let strings = ["{", "\t\"map\": {",];
	const current = this.getCurrentState();
	const map = current.map;
	// mult = multiplicity?
	const colors = "bgry", sizes = 3, mult = "ABCDE";
	for (let i = 0; i < colors.length; i++) {
		for (let s = 1; s <= sizes; s++) {
			for (let k = 0; k < 3; k++) {
				const serial = `${colors[i]}${s}${mult[k]}`;
				const data = map[serial];
				if (data) {
					const ownerString = (data.owner === null ? "null" : `"${data.owner}"`);
					strings.push(`\t"${serial}": {"at": ${data.at}, "owner": ${ownerString}},`);
				} else {
					strings.push(`\t"${serial}": null,`);
				}
			}
		}
		// break line after each color
		strings.push("");
	}
	// remove the comma from the second to last line
	const lastPiece = strings[strings.length - 2];
	strings[strings.length - 2] = lastPiece.substring(0, lastPiece.length - 1);
	// the last newline becomes the closing brace
	strings[strings.length - 1] = "\t},";
	// now, add the homeworld data
	strings.push("\t\"homeworldData\": " + JSON.stringify(current.homeworldData) + ",");
	strings.push("\t\"turn\": " + JSON.stringify(current.turn) + ",");
	strings.push("\t\"actions\": " + JSON.stringify(current.actions) + ",");
	strings.push("\t\"phase\": " + JSON.stringify(current.phase));
	strings.push("}");
	return strings.join("\n");
}

export { getCompactSummary, getMapJSON };
