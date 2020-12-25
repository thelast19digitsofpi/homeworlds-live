// game.js
//
// A higher-order component that makes game components.
// The second parameter contains an object with optional events.
// The third parameter contains an object with additional state.


/*
PROPS ACCEPTED: ([+] = done, [?] = untested, [ ] = not implemented yet)
- [+] current (or gameState): GameState to start with.
- [+] players: The array of players that are playing the game. I think only strings work.

EVENTS:
- [+] canInteract(state): Checks if the player is allowed to interact with the board at all. If false, you are blocked even from showing the action list button, for example.
- [+] onBeforeButtonClick(actionType, oldState): Called when the player clicks an action button. Can be used to stop trades before they get the actionInProgress message.
- [+] onBeforeAction(action, player, oldState, newState): Called before the player does an action. Return true or false; true allows the action, false does not. Note that returning *undefined* is undefined behavior... I don't actually remember what it does and probably is not consistent.
- [+] onAfterAction(action, newState): Called after an action is done successfully. Cannot block actions.
- [+] onBeforeEndTurn(player, oldState, newState): Called before the player ends their turn. Again, can return false to block the end-turn.
- [+] onAfterEndTurn(player, newState): 
- [+] onMount(): Called inside componentDidMount.
- [+] onUnmount(): Called inside componentWillUnmount.
- [+] getProps(): Not really an event, but gets an object with props to send down. Right now I also send the entire React state object, but hopefully I will transition away from that.
- [+] onComponentUpdate(): Called inside componentDidUpdate.
*/

import React from 'react';
import GameState from './gameState.mjs';
import StarMap from './starmap.jsx';
import ActionInProgress from './actionInProgress.jsx';
import ActionsPopup from './action_popup.jsx';
import Stash from './stash.jsx';
import WarningPrompt from './warningPrompt.jsx';
import TurnControls from './turnControls.jsx';

function withGame(WrappedComponent, events, additionalState) {
	return class extends React.Component {
		constructor(props) {
			super(props);
			
			this.state = {
				// array of arrays.
				// each element of "history" is a list of positions that together make up 1 move
				history: [[]],
				
				// while history is a list of positions
				// allActions is a list of, well, actions
				allActions: [[]],
				
				// The current play state as a GameState object.
				// Anyway, we hope the props are helpful...
				current: props.current || props.gameState || new GameState(props.players || ["south", "north"]),
				
				// These are important.
				scaleFactor: 0.5,
				viewer: "south",
				displayMode: "normal",
				allowAnimations: true,
				
				// Popup data for clicking on a ship.
				popup: null,
				// For actions in progress. E.g. you click the "trade" button THEN a stash piece.
				actionInProgress: null,
				
				// a state variable to disable warnings
				// note that a prop can also override this
				disableWarnings: false,
				
				// the warnings themselves are computed from the GameState
				showWarningPrompt: false,
				
				// whichever piece most recently "did something"
				recentlyUsedPiece: null,
			};
			this.state.current = GameState.recoverFromJSON(this.state.current);
			// start with a state in the history list!
			this.state.history[0].push(this.state.current);
			
			// extend or alter that state
			for (let key in additionalState) {
				this.state[key] = additionalState[key];
			}
			
			// we need the coordinates of the star map
			this.starMapRef = React.createRef();
			
			// for my debugging!
			window._g = this;
			
			// Bind specific methods.
			const bindThese = ["toggleWarningPopup", "handleEndTurnClick", "handleResetClick", "handleEmptyClick"];
			for (let i = 0; i < bindThese.length; i++) {
				const method = bindThese[i];
				this[method] = this[method].bind(this);
			}
			
			// lastly...
			if (events.onConstructor) {
				events.onConstructor.call(this);
			}
		}
		
		setDisplayMode(type) {
			this.setState({
				displayMode: type,
			});
		}
		
		componentDidMount() {
			if (events.onMount) {
				events.onMount.call(this);
			}
			// I will probably forget...
			if (events.componentDidMount) {
				events.componentDidMount.call(this);
			}
			
			// we always need this one
			let resizeTimer = null;
			window.addEventListener("resize", function() {
				// Delay resizing until 250ms after there have been no resize events
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => this.forceUpdate(), 250);
			}.bind(this));
		}
		
		componentWillUnmount() {
			if (events.onUnmount) {
				events.onUnmount.call(this);
			}
			// again, I will probably forget
			if (events.componentWillUnmount) {
				console.log("events.componentWillUnmount -> onUnmount, please");
				// but do it anyway (this would be a very difficult bug to trace)
				events.componentWillUnmount.call(this);
			}
		}
		
		componentDidUpdate() {
			// call the corresponding method
			if (events.onComponentUpdate) {
				events.onComponentUpdate.call(this);
			}
		}
		
		/*
		I now divide the methods into categories.
		The following methods are all very fundamental to managing state and such.
		*/
		
		// Gets the current GameState.
		getCurrentState() {
			return this.state.current;
		}
		
		// We cannot mutate maps...
		copyMap(oldMap) {
			let newMap = {};
			for (let serial in oldMap) {
				newMap[serial] = oldMap[serial];
			}
			return newMap;
		}
		
		// Gets the number and type of actions you would have after sacrificing.
		getSacrificeActions(serial) {
			return {
				number: Number(serial[1]),
				sacrifice: serial[0],
			};
		}
		
		// Changes the disable-warnings state.
		changeDisableWarnings(bool) {
			this.setState({
				disableWarnings: bool,
			});
		}
		
		/*
		Doing actions.
		
		Yeah, these need to check for legality.
		If they are done illegitimately, an Error is thrown.
		*/
		
		// Pushes a new game state onto the history stack.
		// Assumes (and ensures) 2 things:
		// (1) The state at the start of a turn is index [0] in that turn's inner array.
		// (2) The current state is the last item in the stack.
		// Third parameter is a callback.
		updateGameState(newState, isNewTurn, callback) {
			// The safer method for calling React's setState()
			this.setState(reactState => {
				// Copy the history array
				let history = reactState.history.slice();
				// If we just ended a turn (started the next)...
				if (isNewTurn) {
					history.push([]);
				}
				
				// sometimes newState is a vanilla object
				const newGameState = (newState instanceof GameState) ? newState : GameState.recoverFromJSON(newState);
				
				// Now, the current state onto the stack.
				history[history.length - 1].push(newGameState);
				// Replace the history array and update the current state.
				return {
					history: history,
					current: newGameState
				};
			}, callback || (() => {})); // use the callback if provided
		}
		
		// Appends the action to the list of actions taken so far
		appendAction(action) {
			// this is annoyingly difficult
			this.setState(function(reactState) {
				const newActions = reactState.allActions.slice();
				const thisTurn = newActions[newActions.length - 1].slice();
				thisTurn.push(action);
				newActions[newActions.length - 1] = thisTurn;
				return {
					allActions: newActions,
				};
			});
		}
		
		/*
		Since most of the logic is in gameState.js, here we only need these 2 methods.
		Note that catastrophe requires a call to doAction().
		It does NOT require that you have any actions left, nor does it cost one if you do.
		*/
		
		// Does an action. The second parameter (player) can also be passed as a
		// property of action as action.turn or action.player, but this is not recommended
		doAction(action, player) {
			if (typeof player === undefined) {
				console.log("[doAction] Player not passed, this is wrong! (But will work, I think.)");
				player = action.player;
				if (typeof player === undefined) {
					console.log("^^ Belay that. It will not work.");
					throw new TypeError("Still?! OK, this is a bug: Player not given to doAction()")
				}
			}
			const current = this.getCurrentState();
			if (current.turn !== player) {
				throw new Error("It is not your turn!");
			}
			
			// for animations
			let recentlyUsedPiece = null;
			if (action.type === "build" || action.type === "trade") {
				recentlyUsedPiece = action.newPiece;
			} else if (action.type === "move" || action.type === "discover" || action.type === "steal") {
				recentlyUsedPiece = action.oldPiece;
			}
			
			let newState;
			try {
				switch (action.type) {
					case "homeworld":
						newState = current.doHomeworld(player, action.star1, action.star2, action.ship);
						break;
					case "build":
						newState = current.doBuild(player, action.newPiece, action.system);
						break;
					case "trade":
						newState = current.doTrade(player, action.oldPiece, action.newPiece);
						break;
					case "move":
						newState = current.doMove(player, action.oldPiece, action.system);
						break;
					case "discover":
						// the "newPiece" is the new star you discover
						newState = current.doDiscovery(player, action.oldPiece, action.newPiece);
						break;
					case "steal":
						newState = current.doSteal(player, action.oldPiece);
						break;
					case "sacrifice":
						newState = current.doSacrifice(player, action.oldPiece);
						break;
					case "catastrophe":
						newState = current.doCatastrophe(action.color, action.system);
						break;
					case "eliminate":
						// note: this is only due to clock/disconnection eliminations or other interventions
						newState = current.manuallyEliminatePlayer(action.player);
						break;
					default:
						throw new Error("Invalid action type " + action.type + ". Could be a bug!");
				}
				console.log("New state", newState);
				
				let doUpdate = true;
				// Call any middleware (is that the right word?)
				if (events.onBeforeAction) {
					// return false to cancel the action
					const valid = events.onBeforeAction.call(this, action, player, current, newState);
					// I explicitly stated that "undefined" return is considered a true
					// I think undefined -> block causes more pain than good
					// but false/null/0/"" do block
					console.log("Validity:", valid);
					if (!valid && valid !== undefined) {
						doUpdate = false;
					}
				}
				
				if (doUpdate) {
					console.log("Updating!");
					this.updateGameState(newState);
					this.appendAction(action);
					if (events.onAfterAction) {
						events.onAfterAction.call(this, action, player, newState);
					}
					this.setState({
						recentlyUsedPiece: recentlyUsedPiece,
					});
				}
			} catch (error) {
				// again, a better error system is good
				if (error.constructor !== Error) {
					// TypeError, etc
					console.error("[Game.doAction]", error);
				}
				alert("Illegal action!\n" + error.message);
			}
			
			this.dismissWarnings();
		}
		
		doEndTurn(player, callback) {
			const current = this.getCurrentState();
			const newState = current.doEndTurn();
			// whoa there... check that you actually can end the turn
			if (events.onBeforeEndTurn && 
					!events.onBeforeEndTurn.call(this, player, current, newState)) {
				console.log("Blocked");
				return;
			}
			
			// Somewhat rough way of preventing end-turn before the homeworld is set up
			if (current.phase === "setup" && this.state.actionInProgress) {
				console.log("Cannot end turn without a homeworld!");
				return;
			}
			
			this.updateGameState(newState, true, callback);
			this.setState({
				// append a single empty array to the end
				allActions: this.state.allActions.concat([[]])
			});
			if (events.onAfterEndTurn) {
				events.onAfterEndTurn.call(this, player, newState);
			}
			// Clear any actions in progress.
			// In homeworld setup phase, start the homeworld actionInProgress if it is your turn.
			const dontShow = (events.canInteract && !events.canInteract.call(this, newState));
			// the double negative is a little weird
			if (newState.phase === "setup" && !dontShow) {
				this.setState({
					actionInProgress: {
						type: "homeworld",
						player: newState.turn,
					},
				});
			} else {
				// just clear it totally
				this.setState({
					actionInProgress: null,
				});
			}
			
			// dismiss any warnings
			this.dismissWarnings();
		}
		
		// Undoes the actions you took this turn.
		doResetTurn(player) {
			const newHistory = this.state.history.slice();
			const current = this.getCurrentState();
			console.log(newHistory);
			// clear the most recent turn
			const startOfTurn = (newHistory[newHistory.length - 1][0]) || current;
			
			// set the most recent turn to only contain that state
			newHistory[newHistory.length - 1] = [startOfTurn];
			// In homeworld setup phase, start the homeworld actionInProgress if it is your turn.
			const dontShowAIP = (events.canInteract && !events.canInteract.call(this, current));
			// change the history
			this.setState({
				history: newHistory,
				current: startOfTurn,
				// remove the last array from the list, then append an empty array
				allActions: this.state.allActions.slice(0, -1).concat([[]]),
				
				// also clear the action popup and action in progress
				// show homeworld popup in setup phase if you can interact
				actionInProgress: (startOfTurn.phase === "setup" && !dontShowAIP) ? {
					type: "homeworld",
					player: player,
				} : null,
				popup: null,
			});
			
			// also call any events
			if (events.onAfterResetTurn) {
				events.onAfterResetTurn.call(this, player, startOfTurn);
			}
			
			this.dismissWarnings();
		}
		
		
		// Not sure where to put this
		dismissWarnings() {
			this.setState({
				showWarningPrompt: false,
				showWarningPopup: false,
			});
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
		
		// NOTE: Clicking a piece in the bank does NOT work,
		// unless you have already begun an actionInProgress.
		getActionsAvailableForPiece(player, piece) {
			const current = this.getCurrentState();
			return current.getActionsAvailableForPiece(player, piece);
		}
		
		// Handles clicking on nothing...
		handleEmptyClick() {
			this.setState({
				popup: null,
			});
		}
		
		// Handles clicking on any piece on the board.
		handleBoardClick(piece, event) {
			window.___lastE = event.nativeEvent;
			const aip = this.state.actionInProgress;
			const current = this.getCurrentState();
			
			// I think this should happen regardless
			this.dismissWarnings();
			
			// are you authorized?
			if (events.canInteract && !events.canInteract.call(this, current)) {
				// meant as a silent failure, but I want to know about it
				console.warn("Player cannot do actions.");
				// additionally, clear the AIP window so it is not stuck
				this.setState({
					actionInProgress: null,
					popup: null,
				});
				return;
			}
			
			if (aip) {
				// If an action is in progress:
				try {
					if (aip.type === "move") {
						// this is the only one that requires clicking on the board twice
						// allow canceling the action by clicking the same piece twice
						const newSystem = current.map[piece].at;
						const oldSystem = current.map[aip.oldPiece].at;
						if (newSystem !== oldSystem) {
							// at least you're trying to move
							this.doAction({
								type: "move",
								player: current.turn,
								oldPiece: aip.oldPiece,
								system: current.map[piece].at,
							}, current.turn);
						} else {
							// clicked the same system, don't alert about illegal moves
							console.log("Canceling move action.");
						}
					}
				} catch (error) {
					// TODO: Not alert()!
					if (error instanceof TypeError) {
						console.warn(error);
						alert("This is a bug! You clicked on " + piece + " which has no map data, or some other bug...");
					} else {
						alert("Illegal action!\n" + error.message);
					}
				}
				this.setState({
					actionInProgress: null,
				});
			} else {
				// Start of an action.
				// For now, console.log the actions
				const actions = this.getActionsAvailableForPiece(current.turn, piece);
				console.log(actions);
				
				// Where to position the popup?
				const rect = this.starMapRef.current.getBoundingClientRect();
				const offsetX = rect.left + window.scrollX;
				const offsetY = rect.top + window.scrollY;
				
				// position the popup
				let x = event.nativeEvent.pageX - offsetX;
				let y = event.nativeEvent.pageY - offsetY;
				let xSide = "left";
				let ySide = "top";
				
				// make the popup display on the left if you click on the right side of the screen
				if (x > rect.width/2) {
					x = rect.width - x;
					xSide = "right";
				}
				// same thing vertically
				if (y > rect.height/2) {
					y = rect.height - y;
					ySide = "bottom";
				}
				
				this.setState({
					popup: {
						actions: actions,
						x: x + 10,
						y: y + 10,
						// which CSS position property to use
						xSide: xSide,
						ySide: ySide,
					},
				});
			}
		}
		
		// Handles clicking on the action button.
		handleButtonClick(actionData) {
			if (actionData === null) {
				// cancel
				this.setState({
					actionInProgress: null,
					popup: null,
				});
				console.log("Canceling action");
				return;
			}
			
			const current = this.getCurrentState();
			// are you authorized?
			if (events.canInteract && !events.canInteract.call(this, current)) {
				// meant as a silent failure, but I want to know about it
				console.warn("Player cannot do actions.");
				// additionally, clear the UI so they are not stuck
				this.setState({
					actionInProgress: null,
					popup: null,
				});
				return;
			}
			
			// Check if you can even begin that action.
			if (events.onBeforeButtonClick && !events.onBeforeButtonClick.call(this, actionData.type, current)) {
				console.warn("Action type is blocked.");
				this.setState({
					actionInProgress: null,
					popup: null,
				});
				return;
			}
			
			try {
				switch (actionData.type) {
					case "build":
					case "steal":
					case "sacrifice":
					case "catastrophe":
						this.doAction(actionData, current.turn);
						break;
					case "trade":
					case "move":
					case "discover":
						// Trades and movements are done by later clicking a different piece
						this.setState({
							actionInProgress: actionData,
						});
						break;
					default:
						throw new Error("This action (" + actionData.type + ") is invalid (or not supported)");
						break;
				}
			} catch (error) {
				// TODO: better messaging
				alert(error.message || String(error));
				console.warn(error);
			}
			
			// and at the end...
			this.setState({
				popup: null,
			});
		}
		
		// Handles clicking on stash pieces.
		handleStashClick(serial) {
			const aip = this.state.actionInProgress;
			const current = this.getCurrentState();
			
			// are you authorized?
			// (if the method exists but returns a false...)
			if (events.canInteract && !events.canInteract.call(this, current)) {
				// meant as a silent failure, but I want to know about it
				console.warn("Player cannot do actions.");
				// additionally, clear the AIP window so it is not stuck
				this.setState({
					actionInProgress: null,
				});
				return;
			}
			
			if (aip) {
				try {
					if (aip.type === "trade" || aip.type === "discover") {
						this.doAction({
							type: aip.type,
							player: current.turn,
							oldPiece: aip.oldPiece,
							newPiece: serial,
						}, current.turn);
					} else if (aip.type === "homeworld") {
						// Check if the piece is already taken.
						for (let key in aip) {
							// "key" will be star1, star2, etc (and also type but we don't really care because that never matches a serial)
							if (serial === aip[key]) {
								// you have already used this piece
								// (don't yell at them, they probably just double-clicked)
								return;
							}
						}
						
						// Here we have to update the actionInProgress object itself
						let newAIP = {};
						if (!aip.star1) {
							newAIP = {
								star1: serial,
							};
						} else if (aip.star2 === undefined) { // because "null" is a legit option for star2
							newAIP = {
								star1: aip.star1,
								star2: serial,
							};
						} else if (!aip.ship) {
							newAIP = {
								star1: aip.star1,
								star2: aip.star2,
								ship: serial,
							};
						}
						
						newAIP.type = "homeworld";
						newAIP.player = current.turn;
						
						// Check if you are done
						// note: if the order gets changed, this will BREAK
						if (newAIP.ship) {
							this.doAction(newAIP, current.turn);
							// clear the AIP
							this.setState({
								actionInProgress: null
							})
						} else {
							this.setState({
								actionInProgress: newAIP,
							});
						}
					}
					// else, no action to do here
				} catch (error) {
					// TODO: better delivery
					// TODO: custom error class?
					console.warn("[Game.handleStashClick]", error);
					alert(error.message);
				}
				// Homeworld setup is a 3-part action; all others only require 1 stash click
				if (aip.type !== "homeworld") {
					this.setState({
						actionInProgress: null
					});
				}
			}
		}
		
		// Handles clicking Reset Turn.
		handleResetClick() {
			if (events.canInteract && !events.canInteract.call(this, this.getCurrentState())) {
				console.warn("Cannot Interact with the Board");
				return false;
			}
			
			this.doResetTurn(this.getCurrentState().turn);
		}
		
		// Handles clicking End Turn. Not for use by the warning component.
		handleEndTurnClick() {
			const current = this.getCurrentState();
			if (!this.props.disableWarnings && !this.state.disableWarnings) {
				const warnings = current.getEndTurnWarnings();
				for (let i = 0; i < warnings.length; i++) {
					if (warnings[i].level === "warning" || warnings[i].level === "danger") {
						this.setState({
							showWarningPrompt: true,
						});
						return;
					}
				}
			}
			
			// if nothing sufficiently serious was found...
			this.doEndTurn(current.turn);
		}
		
		toggleWarningPopup() {
			this.setState(function(reactState) {
				// Toggle the popup, but don't show it over the confirm prompt
				return {
					showWarningPopup: !(reactState.showWarningPopup || reactState.showWarningPrompt),
				};
			});
		}
		
		// The grand finale method, as I call it
		render() {
			const current = this.getCurrentState();
			const winBanner = <p className="alert alert-primary lead">
				{"Game over, " +
					(current.winner ? current.winner + " has won!" : "the game is a draw!")
				}
			</p>;
			
			const warnings = current.getEndTurnWarnings();
			
			let starMapStyle = {
				// make there be a border, but it is invisible
				borderColor: "rgba(0,0,0,0)",
				borderStyle: "solid",
				borderWidth: "2px",
				borderRadius: "4px",
			};
			// Modify the look based on if you can currently interact...
			const canInteract = (events.canInteract ? events.canInteract.call(this, current) : true);
			let endTurnClass = "success";
			if (canInteract) {
				starMapStyle.borderColor = "#ccc";
			}
			
			
			// very very simple heuristic that scales the board down based on the number of pieces that are on the board
			let numPiecesOnBoard = 0;
			for (let serial in current.map) {
				if (current.map[serial]) {
					numPiecesOnBoard++;
				}
			}
			
			const baseScale = Math.min(window.innerHeight / 1800, window.innerWidth / 2000);
			const boardScale = baseScale * Math.min(1.1, 1.25 - 0.5 * numPiecesOnBoard/36);
			const stashScale = baseScale * Math.min(1, 0.75 + numPiecesOnBoard/60);
			
			// I am not sure if sending the entire state object is "correct"
			const moreProps = events.getProps ? events.getProps.call(this) : {};
			const sym = (this.state.displayMode === "symbol");
			const F = React.Fragment; // the <> </> messes up syntax highlighting in sublime
			
			// The Right Column
			// (stash needs the AIP to be more intelligent)
			const rightColumn = <div className="stash col-auto" align="right">
				<Stash
					scaleFactor={ stashScale }
					displayMode={this.state.displayMode}
					map={current.map}
					actionInProgress={this.state.actionInProgress}
					handleClick={(serial) => this.handleStashClick(serial)}
				/>
				
				{/* ...ok this is too many props */}
				<TurnControls
					canInteract={canInteract}
					
					warnings={warnings}
					showDisableWarnings={!this.props.disableWarnings}
					disableWarnings={this.props.disableWarnings || this.state.disableWarnings}
					changeDisableWarnings={(bool) => this.changeDisableWarnings(bool)}
					
					showPopup={this.state.showWarningPopup && !this.state.showWarningPrompt}
					toggleWarningPopup={this.toggleWarningPopup}
					handleEndTurnClick={this.handleEndTurnClick}
					handleResetClick={this.handleResetClick} />
			</div>;
			
			const radioHandler = (event) => this.setDisplayMode(event.target.value);
			const allowAnimationHandler = (event) => this.setState({allowAnimations: event.target.checked});
			
			return <WrappedComponent
					reactState={this.state}
					gameState={current}
					{...moreProps}>
				<div className="game row no-gutters">
					<div className="star-map-wrapper col">
						<p className="mb-0 mt-0">
							{/* Color reference */}
							<strong className="text-blue mr-2">Trade {sym && <F>= &#x21c6;;</F>}</strong>
							<strong className="text-success mr-2">Build {sym && <F>= +;</F>}</strong>
							<strong className="text-danger mr-2">Steal {sym && <F>= &#x2734;;</F>}</strong>
							<strong className="text-yellow mr-2">Move {sym && <F>= ^.</F>}</strong>
							{/* inline block to make the text wrap with the checkbox */}
							<span className="d-inline-block mr-2">
								Ship display: &nbsp;
								<select id="displayMode"
									name="displayMode"
									value={this.state.displayMode}
									onChange={radioHandler}>
									<option value="normal">Normal</option>
									<option value="symbol">Colorblind</option>
									<option value="number">Size-blind</option>
								</select>
							</span>
							{/* same deal here for animation controls */}
							<span className="d-inline-block">
								<input type="checkbox"
									name="allowAnimations"
									id="allowAnimations"
									value={this.state.allowAnimations}
									onChange={allowAnimationHandler} />
								<label htmlFor="allowAnimations">Animations</label>
							</span>
						</p>
						<div className="star-map" style={starMapStyle} ref={this.starMapRef}>
							{/* The Star Map!! */}
							<StarMap
								map={current.map}
								homeworldData={current.homeworldData}
								scaleFactor={ boardScale }
								viewer={this.state.viewer}
								displayMode={this.state.displayMode}
								setDisplayMode={this.state.setDisplayMode}
								// for homeworld purposes or possibly another way to handle the active piece
								actionInProgress={this.state.actionInProgress}
								recentlyUsedPiece={this.state.recentlyUsedPiece}
								
								handleBoardClick={(piece, event) => this.handleBoardClick(piece, event)}
							/>
							{/* Display the actions popup if applicable */}
							<ActionsPopup
								popup={this.state.popup}
								handleButtonClick={(acData) => this.handleButtonClick(acData)}
								onBlur={this.handleEmptyClick}
							/>
						</div>
						{current.phase === "end" ? winBanner : null}
						<p className="info">
							Turn: {current.turn} &bull;
							Actions left: {current.actions.number}
						</p>
						
						{/* Give the warning prompt if you try to end your turn dangerously */
							this.state.showWarningPrompt && 
							<WarningPrompt
								warnings={warnings}
								onClose={() => this.dismissWarnings()}
								onEndTurn={() => this.doEndTurn(current.turn)} />
						}
						
						{/* The AIP indicator cares about your number of actions left on the turn
						This is because a sacrifice is, in some sense, "in progress" until you run out of actions... and because it makes sense to put that down there */}
						<ActionInProgress
							displayMode={this.state.displayMode}
							canInteract={canInteract}
							actionInProgress={this.state.actionInProgress}
							turnActions={current.actions} />
					</div>
					{rightColumn}
				</div>
			</WrappedComponent>;
		}
	}
}

export default withGame;
