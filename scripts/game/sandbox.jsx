// sandbox.jsx
//
// Allows you to move pieces around and do everything. Could be used to set up puzzles, if you can move the pieces to the right positions.

import React from 'react';
import ReactDOM from 'react-dom';
import withGame from './game.jsx';


// gets the JSON for the map, specifically in a format I can use when building tutorials
function getMapJSON() {
	// JSON.stringify is not sufficient
	// I want it formatted my way
	let strings = ["{"];
	const map = this.getCurrentState().map;
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
	// the last newline becomes the closing brace
	strings[strings.length - 1] = "}";
	return strings.join("\n");
}

function SandboxDisplay(props) {
	return <div className="sandbox">
		<div className="upper-row">
			<button onClick={props.getMap} className="btn btn-secondary">Get Map</button>
			<button disabled className="btn btn-secondary">Get Log</button>
			<textarea readOnly value={props.pasteContents} placeholder={'Map and log appear here'}></textarea>
		</div>
		{props.children}
	</div>;
}
// the empty object is because we have no events
const GameSandbox = withGame(SandboxDisplay, {
	onMount: function() {
		this.getMap = function() {
			// update the textarea contents
			this.setState({
				pasteContents: getMapJSON.call(this),
			});
		}.bind(this)
	},
	
	getProps: function() {
		return {
			getMap: this.getMap,
			pasteContents: this.state.pasteContents,
		};
	},
}, {
	// this sets the existing state rather than adding new state
	actionInProgress: {
		type: "homeworld",
		player: "south",
	},
	// this adds new state
	pasteContents: "",
});


ReactDOM.render(<GameSandbox />, document.getElementById('game-container'));
