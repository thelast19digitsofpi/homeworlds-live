// sandbox.jsx
//
// Allows you to move pieces around and do everything. Could be used to set up puzzles, if you can move the pieces to the right positions.

import React from 'react';
import ReactDOM from 'react-dom';
import withGame from './game.jsx';
import GameState from './gameState.mjs';
import { getCompactSummary, getMapJSON } from './gameFunctions.mjs';
import unpackSummary from './unpackSummary.js';
import {moveToIndex, moveToBeginning, backTurn, backAction, forwardTurn, forwardAction, moveToEnd} from './gameHistory.js';

function SandboxPopup(props) {
	const textarea = <textarea
		key={props.importing ? "import-textarea" : "export-textarea"}
		rows="4"
		style={{resize: "none"}}
		className="small"
		value={props.textareaValue}
		onChange={event => props.setTextareaValue(event.target.value)}
		placeholder={'Map and log appear here'}></textarea>;
	
	const popupButtons = props.importing ? [
		<button onClick={() => props.load(props.textareaValue)}
			className="btn btn-secondary" key="load">Load</button>
	] : [
		<button onClick={props.getMap} className="btn btn-info" key="map">Get Map</button>,
		<button onClick={props.getLog} className="btn btn-info" key="log">Get Log</button>
	];
	// you don't "cancel" an export
	popupButtons.push(<button onClick={props.closePort} className="btn btn-danger" key="cancel">{props.importing ? "Cancel" : "Close"}</button>)
	
	// note to self: importing is dominant over exporting
	return (props.importing || props.exporting) ? <div className="control-popup-wrapper" key={Math.random()}>
		<div className="control-popup card bg-light text-dark border border-primary">
			<div className="card-body">
				<h5 className="card-title text-center">
					{props.importing ? "Open" : "Save"} Map or Game
				</h5>
				<p>{
					// I probably could let it detect which one it is...
					props.importing ? "Paste your map or game log below, then click the button to import." : "Click the buttons below to get either just the map, or the entire game log."
				}</p>
				{textarea}
			</div>
			{/* Control Buttons */}
			<div className="card-footer align-center btn-group">
				{popupButtons}
			</div>
		</div>
	</div> : null;
}

function SandboxDisplay(props) {
	console.error("Incineration Counter:", props.popupIncinerationCounter);
	// forcefully force React to utterly incinerate the previous popup each time
	const popup = <SandboxPopup key={props.popupIncinerationCounter} {...props} />;
	
	const upperRow = <div className="upper-row">
		<p>
			<button onClick={props.showImport} className="btn btn-info">
				<i className="material-icons md-18 align-middle">open_in_browser</i>
				Import
			</button>
			<button onClick={props.showExport} className="btn btn-info">
				<i className="material-icons md-18 align-middle">save_alt</i>
				Export
			</button>
			<span className="mr-4">&nbsp;</span>
			{/* Undo/Redo buttons */}
			<button onClick={() => backTurn.call(props.parent)}
				className="btn btn-secondary"
				disabled={props.turnIndex === 0}>
				<i className="material-icons md-18 align-middle">skip_previous</i>
				Undo
			</button>
			<button onClick={() => forwardTurn.call(props.parent)}
				className="btn btn-secondary"
				disabled={props.turnIndex === props.maxTurnIndex}>
				Redo
				<i className="material-icons md-18 align-middle">skip_next</i>
			</button>
		</p>
		
		{props.loadError && <p className="text-danger">Error: {props.loadError}</p>}
	</div>;
		
	return <div className="sandbox">
		<div className="position-relative">
			{upperRow}
			{props.children}
			{popup}
		</div>
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
				// assume game is in progress unless phase is "end"
				textareaValue: getCompactSummary(this.state.allActions, gs.turnOrder, gs.winner, gs.phase !== "end"),
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
				let viewer = players[0] || "south";
				if (!hwData) {
					// darn, we have to guess
					hwData = {};
					const southIndex = players.indexOf("south");
					const youIndex = players.indexOf("you");
					if (southIndex >= 0) {
						// oh good
						hwData["south"] = 1;
						// the other player (presumably north?) gets system 2
						hwData[players[1 - southIndex]] = 2;
					} else if (youIndex >= 0) {
						// also good
						hwData["you"] = 1;
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
				
				// preferred viewers
				if (players[1] === "south" || players[1] === "you") {
					viewer = players[1];
				}
				
				if (players.length === 1) {
					players.push({
						// table of common opponents
						south: "north",
						north: "south",
						you: "enemy",
						enemy: "you",
					}[players[0]] || "unknown");
				}
				
				const gameState = new GameState(
					newMap,
					jsonData.phase || (players.length > 1 ? "playing" : "end"),
					hwData,
					maxSystem + 1,
					players,
					jsonData.turn || players[0] || "south", // turn
					jsonData.actions || {number: 1, sacrifice: null},
					// declare a winner if only 1 player was found
					players.length === 1 ? players[0] : null
				);
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
				console.error("Unpacking summary", players);
				// I knew I had already done this somewhere...
				let results = unpackSummary(players, this.state.textareaValue);
				if (results.error) {
					this.setState({
						loadError: results.error,
					});
				}
				
				let aip = null;
				// don't launch homeworld construction if they already made one
				if (results.currentState.phase === "setup" && results.currentState.actions.number > 0) {
					aip = {type: "homeworld"};
				}
				
				this.setState({
					history: results.history,
					allActions: results.allActions,
					current: results.currentState,
					actionInProgress: aip,
				});
			} catch (error) {
				console.log(error);
				this.setState({
					loadError: "There was a problem with that game log, and it prevented me from showing a partial map (this is probably a bug). The message was: " + error.message,
				});
			}
		}.bind(this);
		
		// tries to intelligently predict if it is a map or a game
		this.load = function() {
			const entry = this.state.textareaValue.trim();
			// allow for some minor corruption
			if (entry[0] === "{" || entry[1] === "{") {
				// probably JSON
				this.loadMap();
			} else {
				this.loadGame();
				this.setState(function(reactState) {
					return {
						viewer: reactState.current.turnOrder[0] || "south",
					};
				});
			}
			
			// close the import/export window
			this.closePort();
			this.adjustCursor();
		}.bind(this);
		
		
		this.showImport = function() {
			this.setState({
				importing: true,
				popupIncinerationCounter: this.state.popupIncinerationCounter + 1,
			});
		}.bind(this);
		this.showExport = function() {
			this.setState({
				exporting: true,
				textareaValue: "",
				popupIncinerationCounter: this.state.popupIncinerationCounter + 1,
			});
		}.bind(this);
		// Port = the common letters from "import" and "export"
		this.closePort = function() {
			this.setState({
				importing: false,
				exporting: false,
			});
		}.bind(this);
		
		this.clipFuture = function() {
			if (this.state.turnIndex < this.state.history.length - 1) {
				// you undid the action, drop all that other state
				console.log(this.state.turnIndex, this.state.history);
				
				let shrunkHistory = this.state.history.slice(0, this.state.turnIndex);
				// we want to include up to the current state
				const thisTurn = this.state.history[this.state.turnIndex].slice(0, this.state.actionIndex + 1);
				shrunkHistory.push(thisTurn);
				
				// same for actions
				let shrunkActions = this.state.allActions.slice(0, this.state.turnIndex);
				// but keep one less thing because actions go between history states
				const thisTurn2 = this.state.allActions[this.state.turnIndex].slice(0, this.state.actionIndex);
				shrunkActions.push(thisTurn2);
				
				this.setState({
					history: shrunkHistory,
					allActions: shrunkActions,
				});
				// I don't want to deal with state update batching
				this.forceUpdate();
			}
		}.bind(this);
		
		this.adjustCursor = function() {
			this.setState(function(reactState) {
				const lastEntry = reactState.history[reactState.history.length - 1];
				return {
					turnIndex: reactState.history.length - 1,
					actionIndex: lastEntry.length - 1,
				};
			});
		}.bind(this);
	},
	
	onBeforeAction: function() {
		this.clipFuture();
		return true;
	},
	onBeforeEndTurn: function() {
		this.clipFuture();
		return true;
	},
	onAfterAction: function() {
		this.adjustCursor();
		return true;
	},
	onAfterEndTurn: function() {
		this.adjustCursor();
		return true;
	},
	
	getProps: function() {
		return {
			getMap: this.getMap,
			getLog: this.getLog,
			load: this.load,
			textareaValue: this.state.textareaValue,
			setTextareaValue: this.setTextareaValue,
			loadError: this.state.loadError,
			
			turnIndex: this.state.turnIndex,
			maxTurnIndex: this.state.history.length - 1,
			
			showImport: this.showImport,
			showExport: this.showExport,
			closePort: this.closePort,
			
			importing: this.state.importing,
			exporting: this.state.exporting,
			
			popupIncinerationCounter: this.state.popupIncinerationCounter,
			
			// for the .call() of the navigation functions
			parent: this,
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
	
	// for map loading and saving
	importing: false,
	exporting: false,
	
	turnIndex: 0,
	actionIndex: 0,
	
	// For preventing the popup from being selected when you close and reopen it.
	popupIncinerationCounter: 0,
});


ReactDOM.render(<GameSandbox />, document.getElementById('game-container'));
