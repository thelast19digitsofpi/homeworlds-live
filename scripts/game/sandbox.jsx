// sandbox.jsx
//
// Allows you to move pieces around and do everything. Could be used to set up puzzles, if you can move the pieces to the right positions.

import React from 'react';
import ReactDOM from 'react-dom';
import withGame from './game.jsx';
import GameState from './gameState.mjs';
import { getCompactSummary } from './gameFunctions.mjs';

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
			<button onClick={props.getLog} className="btn btn-secondary">Get Log</button>
			<textarea style={{resize: "none"}} className="small" value={props.textareaValue} onChange={props.setTextareaValue} placeholder={'Map and log appear here'}></textarea>
			<button onClick={() => props.loadMap(props.textareaValue)}>Load Map</button>
			<button onClick={() => props.loadGame(props.textareaValue)}>Load Game Log</button>
			{props.loadError && <p className="text-danger">Error: {props.loadError}</p>}
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
				textareaValue: getMapJSON.call(this),
			});
		}.bind(this);
		
		this.getLog = function() {
			const gs = this.getCurrentState();
			this.setState({
				textareaValue: getCompactSummary(this.state.allActions, gs.turnOrder, gs.winner),
			});
		}.bind(this);
		
		this.setTextareaValue = function(contents) {
			this.setState({
				textareaValue: contents,
			})
		}.bind(this);
		
		this.loadMap = function() {
			// safety first
			try {
				// load the JSON
				const jsonData = JSON.parse(this.state.textareaValue);
				// check if it is a raw map or an object with a map property
				let dataMap = jsonData;
				if (jsonData.hasOwnProperty("map")) {
					dataMap = jsonData.map;
				}
				
				// parse the map manually
				const newMap = {};
				const letters = "ABCDE", colors = "bgry";
				let players = [];
				let maxSystem = 0;
				for (let i = 0; i < colors.length; i++) {
					for (let s = 1; s <= 3; s++) {
						for (let j = 0; j < letters.length; j++) {
							// form a serial number with the color, size, and letter
							const serial = colors[i] + String(s) + letters[j];
							if (jsonMap[serial]) {
								newMap[serial].at = Number(jsonMap[serial].at);
								// parse the owner and do some extra stuff with it
								const owner = jsonMap[serial].owner;
								newMap[serial].owner = owner || null;
								// check for players
								if (owner && players.indexOf(owner) === -1) {
									players.push(owner);
								}
								
								// advance the system number
								if (newMap[serial].at > maxSystem) {
									maxSystem = newMap[serial].at;
								}
							}
						}
					}
				}
				
				// ugh I'm not sure how to do this...
				let hwData = jsonData.homeworldData;
				if (!hwData) {
					// darn, we have to guess
					hwData = {};
					const southIndex = players.indexOf("south");
					const youIndex = players.indexOf("you");
					if (southIndex >= 0) {
						// oh good
						hwData.south = 1;
						// the other player (presumably north?) gets system 2
						hwData[players[1 - southIndex]] = 2;
					} else if (youIndex >= 0) {
						// also good
						hwData.you = 1;
						hwData[players[1 - youIndex]] = 2;
					} else {
						// ok now we really have to guess
						// ...
						// how about we look for the majority of ships?
						let guessScores = [0, 0];
						// Get the pieces at systems 1 and 2.
						const getPieces = GameState.prototype.getAllPiecesAtSystem;
						const hw1 = getPieces.call({ map: newMap }, 1);
						const hw2 = getPieces.call({ map: newMap }, 2);
						// Check if more 1-ships belong to player 0 and 2-ships belong to player 1
						for (let i = 0; i < hw1.length; i++) {
							if (hw1[i].owner === players[0]) {
								// it's more likely player 0 is homeworld 1 here
								guessScores[0]++;
							} else if (hw1[i].owner === players[1]) {
								// it's more likely player 1 is homeworld 1 here
								guessScores[1]++;
							}
						}
						// now do the opposite for the other system
						for (let i = 0; i < hw2.length; i++) {
							if (hw2[i].owner === players[0]) {
								// guessScores[1] is "how likely is it that player 1 is homeworld 1"
								guessScores[1]++;
							} else if (hw2[i].owner === players[1]) {
								guessScores[0]++;
							}
						}
						
						// now we guess
						if (guessScores[0] >= guessScores[1]) {
							// it's probably like this
							hwData[players[0]] = 1;
							hwData[players[1]] = 2;
						} else {
							// it's probably this way
							hwData[players[1]] = 1;
							hwData[players[0]] = 2;
						}
					}
					
					// Ask the user if the homeworlds need switched.
					this.setState({
						showSwitchHomeworlds: true,
					});
				}
				
				this.setState({
					// mapOrPlayers, phase, hwData, nextSystemID, turnOrder, turn, actions, winner
					gameState: new GameState(
						newMap,
						players.length > 1 ? "playing" : "end",
						hwData,
						maxSystem + 1,
						players,
						players[0] || "south", // turn
						{number: 1, sacrifice: null},
						// declare a winner if only 1 player was found
						players.length === 1 ? players[0] : null
					),
					viewer: players[0] || "south",
				});
			} catch (error) {
				console.log(error);
				this.setState({
					loadError: "There was a problem with that map.",
				});
			}
		}.bind(this);
	},
	
	getProps: function() {
		return {
			getMap: this.getMap,
			getLog: this.getLog,
			textareaValue: this.state.textareaValue,
			setTextareaValue: this.setTextareaValue,
			loadError: this.state.loadError,
		};
	},
}, {
	// this sets the existing state rather than adding new state
	actionInProgress: {
		type: "homeworld",
		player: "south",
	},
	// this adds new state
	textareaValue: "",
	loadError: null,
	showSwitchHomeworlds: false,
});


ReactDOM.render(<GameSandbox />, document.getElementById('game-container'));
