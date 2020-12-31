// sandbox.jsx
//
// Allows you to move pieces around and do everything. Could be used to set up puzzles, if you can move the pieces to the right positions.

import React from 'react';
import ReactDOM from 'react-dom';
import withGame from './game.jsx';
import GameState from './gameState.mjs';
import { getCompactSummary } from './gameFunctions.mjs';
import unpackSummary from './unpackSummary.js';

// gets the JSON for the map, specifically in a format I can use when building tutorials
function getMapJSON() {
	// JSON.stringify is not sufficient
	// I want it formatted my way
	let strings = ["{", "\t\"map\": {",];
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
	// remove the comma from the second to last line
	const lastPiece = strings[strings.length - 2];
	strings[strings.length - 2] = lastPiece.substring(0, lastPiece.length - 1);
	// the last newline becomes the closing brace
	strings[strings.length - 1] = "\t},";
	// now, add the homeworld data
	strings.push("\"homeworldData\": " + JSON.stringify(this.getCurrentState().homeworldData));
	strings.push("}");
	return strings.join("\n");
}

function SandboxDisplay(props) {
	return <div className="sandbox">
		<div className="upper-row">
			<div className="d-inline-block">
				<div>
					<button onClick={props.getMap} className="btn btn-info">Get Map</button>
					<button onClick={props.getLog} className="btn btn-info">Get Log</button>
				</div>
				<div>
					<span>Import: </span>
					<button onClick={() => props.loadMap(props.textareaValue)}
						className="btn btn-secondary">Map</button>
					<button onClick={() => props.loadGame(props.textareaValue)}
						className="btn btn-secondary">Log</button>
				</div>
			</div>
			<textarea style={{resize: "none"}} className="small" value={props.textareaValue} onChange={event => props.setTextareaValue(event.target.value)} placeholder={'Map and log appear here'}></textarea>
			
			{props.loadError && <p className="text-danger">Error: {props.loadError}</p>}
		</div>
		{props.children}
	</div>;
}
// the empty object is because we have no events
const GameSandbox = withGame(SandboxDisplay, {
	onConstructor: function() {
		// Just generate a couple of methods
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
			});
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
				const letters = "ABC", colors = "bgry";
				let players = [];
				let maxSystem = 0;
				for (let i = 0; i < colors.length; i++) {
					for (let s = 1; s <= 3; s++) {
						for (let j = 0; j < letters.length; j++) {
							// form a serial number with the color, size, and letter
							const serial = colors[i] + String(s) + letters[j];
							if (dataMap[serial]) {
								// parse the owner and do some extra stuff with it
								const owner = dataMap[serial].owner;
								newMap[serial] = {
									at: Number(dataMap[serial].at),
									owner: owner || null,
								};
								// check for players
								if (owner && players.indexOf(owner) === -1) {
									players.push(owner);
								}
								
								// advance the system number
								if (newMap[serial].at > maxSystem) {
									maxSystem = newMap[serial].at;
								}
							} else {
								// we need the explicit null
								newMap[serial] = null;
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
							// it's probably the other way
							hwData[players[1]] = 1;
							hwData[players[0]] = 2;
						}
					}
					
					// Ask the user if the homeworlds need switched.
					this.setState({
						showSwitchHomeworlds: true,
					});
				}
				
				const gameState = new GameState(
					newMap,
					players.length > 1 ? "playing" : "end",
					hwData,
					maxSystem + 1,
					players,
					players[0] || "south", // turn
					{number: 1, sacrifice: null},
					// declare a winner if only 1 player was found
					players.length === 1 ? players[0] : null
				);
				let viewer = players[0] || "south";
				// more conventional first/second players
				if (players[1] === "south" || players[1] === "you") {
					viewer = players[1];
				}
				this.setState({
					// mapOrPlayers, phase, hwData, nextSystemID, turnOrder, turn, actions, winner
					current: gameState,
					// since we don't know the past, this is assumed as the start point
					history: [[gameState]],
					viewer: viewer,
				});
			} catch (error) {
				console.log(error);
				this.setState({
					loadError: "There was a problem with that map.",
				});
			}
		}.bind(this);
		
		this.loadGame = function() {
			// safety first
			try {
				// read off lines
				const lines = this.state.textareaValue.split("\n");
				const playerLine = lines[0];
				// remove the "Players: " and then split by commas
				const players = playerLine.split("Players: ")[1].split(",");
				// I knew I had already done this somewhere...
				let results = unpackSummary(players, this.state.textareaValue);
				if (results.error) {
					this.setState({
						loadError: results.error,
					});
				}
				
				this.setState({
					history: results.history,
					current: results.currentState,
					actionInProgress: results.currentState.phase === "setup" ? {type: "homeworld"} : null,
				});
			} catch (error) {
				console.log(error);
				this.setState({
					loadError: "There was a problem with that game log, and it prevented me from showing a partial map (this is probably a bug). The message was: " + error.message,
				});
			}
		}.bind(this);
	},
	
	// not sure how THIS never showed up...
	canInteract: function() {
		return true;
	},
	
	getProps: function() {
		return {
			getMap: this.getMap,
			getLog: this.getLog,
			loadMap: this.loadMap,
			loadGame: this.loadGame,
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
	disableWarnings: true,
	// this adds new state
	textareaValue: "",
	loadError: null,
	showSwitchHomeworlds: false,
});


ReactDOM.render(<GameSandbox />, document.getElementById('game-container'));
