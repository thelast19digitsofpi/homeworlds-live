// gameFunctions.mjs
//
// Apparently gameState was not enough.
// I also have to share even more game-related functionality between server and client.

function getCompactSummary(allActions, players, winner) {
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
		// actions are separated by semicolons
		// e.g. "s,g1A;b,y3C,5"
		lines.push(columns.join(";"));
	}
	// turns are separated by newlines
	return lines.join("\n");
}

export { getCompactSummary };
