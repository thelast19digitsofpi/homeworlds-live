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
- [ ] canInteract(state): Checks if the player is allowed to interact with the board at all. If false, you are blocked even from showing the action list button, for example.
- [?] onBeforeAction(action, player, oldState, newState): Called before the player does an action. Return true or false; true allows the action, false does not. Note that returning *undefined* counts as *true*, but console.log()s a warning.
- [?] onAfterAction(action, newState): Called after an action is done successfully. Cannot block actions.
- [ ] onBeforeEndTurn(player, oldState, newState): Called before the player ends their turn. Again, can return false to block the end-turn.
- [ ] onAfterEndTurn(player, newState): 
- [?] onMount(): Called inside componentDidMount.
- [?] onUnmount(): Called inside componentWillUnmount.
*/

function withGame(WrappedComponent, events, additionalState) {
	return class extends React.Component {
		constructor(props) {
			super(props);
			
			this.state = {
				// array of arrays.
				// each element of "history" is a list of positions that together make up 1 move
				history: [[]],
				
				// The current play state as a GameState object.
				// Anyway, we hope the props are helpful...
				current: props.current || props.gameState || new GameState(props.players || ["south", "north"]),
				
				// These are important.
				scaleFactor: 0.5,
				viewer: "south",
				
				// Popup data for clicking on a ship.
				popup: null,
				// For actions in progress. E.g. you click the "trade" button THEN a stash piece.
				actionInProgress: null,
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
		
		/*
		I now divide the methods into categories.
		The following methods are all very fundamental to managing state and such.
		*/
		
		// Gets the current state.
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
		
		/*
		Doing actions.
		
		Yeah, these need to check for legality.
		If they are done illegitimately, an Error is thrown.
		*/
		
		// Pushes a new game state onto the history stack.
		// Assumes (and ensures) 2 things:
		// (1) The state at the start of a turn is index [0] in that turn's inner array.
		// (2) The current state is the last item in the stack.
		updateGameState(newState, isNewTurn) {
			// The safer method for calling React's setState()
			this.setState(reactState => {
				// Copy the history array
				let history = reactState.history.slice();
				// If we just ended a turn (started the next)...
				if (isNewTurn) {
					history.push([]);
				}
				
				// Now, the current state onto the stack.
				history[history.length - 1].push(newState);
				// Replace the history array and update the current state.
				return {
					history: history,
					current: newState
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
					if (events.onAfterAction) {
						events.onAfterAction.call(this, action, player, newState);
					}
				}
			} catch (error) {
				// again, a better error system is good
				if (error.constructor !== Error) {
					// TypeError, etc
					console.error("[Game.doAction]", error);
				}
				alert("Illegal action!\n" + error.message);
			}
		}
		
		doEndTurn(player) {
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
			
			this.updateGameState(newState, true);
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
				this.actionInProgress = null;
			}
			
			// // delay logging until after render
			// setTimeout(() => console.log(this.state.history), 100);
		}
		
		// Undoes the actions you took this turn.
		doResetTurn(player) {
			const newHistory = this.state.history.slice();
			console.log(newHistory);
			// clear the most recent turn
			const startOfTurn = (newHistory[newHistory.length - 1][0]) || this.getCurrentState();
			
			// set the most recent turn to only contain that state
			newHistory[newHistory.length - 1] = [startOfTurn];
			// change the history
			this.setState({
				history: newHistory,
				current: startOfTurn,
				// also clear the action popup and action in progress
				actionInProgress: (startOfTurn.phase === "setup" ? {
					type: "homeworld",
					player: player,
				} : null),
				popup: null,
			});
			
			// also call any events
			if (events.onAfterResetTurn) {
				events.onAfterResetTurn.call(this, player, startOfTurn);
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
		
		// NOTE: Clicking a piece in the bank does NOT work,
		// unless you have already begun an actionInProgress.
		getActionsAvailableForPiece(player, piece) {
			const current = this.getCurrentState();
			return current.getActionsAvailableForPiece(player, piece);
		}
		
		// Handles clicking on any piece on the board.
		handleBoardClick(piece, event) {
			console.error(event);
			window.___lastE = event.nativeEvent;
			const aip = this.state.actionInProgress;
			const current = this.getCurrentState();
			
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
						this.doAction({
							type: "move",
							player: current.turn,
							oldPiece: aip.oldPiece,
							system: current.map[piece].at,
						}, current.turn);
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
					actionInProgress: null
				})
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
		
		handleResetClick() {
			if (events.canInteract && !events.canInteract.call(this, this.getCurrentState())) {
				console.warn("Cannot Interact with the Board");
				return false;
			}
			
			this.doResetTurn(this.getCurrentState().turn);
		}
		
		render() {
			const current = this.getCurrentState();
			const winBanner = <p className="alert alert-primary lead">
				{"Game over, " +
					(current.winner ? current.winner + " has won!" : "the game is a draw!")
				}
			</p>
			
			
			let starMapStyle = {
				// make there be a border, but it is invisible
				borderColor: "rgba(0,0,0,0)",
				borderStyle: "solid",
				borderWidth: "2px",
				borderRadius: "4px",
			};
			// Modify the look based on if you can currently interact...
			const canInteract = (events.canInteract ? events.canInteract.call(this, current) : true);
			if (canInteract) {
				starMapStyle.borderColor = "#ccc";
			} else {
				// nothing
			}
			
			
			// very very simple heuristic that scales the board down based on the number of pieces that are on the board
			let numPiecesOnBoard = 0;
			for (let serial in current.map) {
				if (current.map[serial] !== null) {
					numPiecesOnBoard++;
				}
			}
			
			const boardScale = this.state.scaleFactor * Math.min(1, 1.15 - numPiecesOnBoard/60);
			const stashScale = (window.innerHeight / 1800) * Math.min(1, 0.75 + numPiecesOnBoard/60);
			
			// I am not sure if sending the entire state object is "correct"
			return <WrappedComponent reactState={this.state} gameState={current}>
				<div className="game row no-gutters">
					<div className="star-map-wrapper col">
						<div className="star-map" style={starMapStyle} ref={this.starMapRef}>
							<StarMap
								map={current.map}
								homeworldData={current.homeworldData}
								scaleFactor={ boardScale }
								viewer={this.state.viewer}
								
								handleBoardClick={(piece, event) => this.handleBoardClick(piece, event)}
							/>
							{/* Display the actions popup if applicable */}
							<ActionsPopup
								popup={this.state.popup}
								handleButtonClick={(acData) => this.handleButtonClick(acData)}
							/>
						</div>
						{current.phase === "end" ? winBanner : null}
						<p className="info">
							Turn: {current.turn} &bull;
							Actions left: {current.actions.number}
						</p>
						<ActionInProgress actionInProgress={this.state.actionInProgress} />
					</div>
					<div className="stash col-auto" align="right">
						<h4 align="center">Stash</h4>
						<Stash
							scaleFactor={ stashScale }
							data={current.map}
							handleClick={(serial) => this.handleStashClick(serial)}
						/>
						{canInteract && <button
							onClick={() => this.handleResetClick()}
							className="btn btn-danger mt-1">Reset Turn</button>
						}
						<br/>
						{canInteract &&
							/* todo: clicking "end turn" should check for warnings like overpopulations */
						<button className="btn btn-lg btn-info mt-1"
						        onClick={() => this.doEndTurn(current.turn)}>End Turn</button>
						}
					</div>
				</div>
			</WrappedComponent>;
		}
	}
}


