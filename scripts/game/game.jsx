// game.js
//
// A higher-order component that makes game components.
// The second parameter contains an object with optional events.
// The third parameter contains an object with additional state.


/*
PROPS ACCEPTED: ([+] = done, [?] = untested, [ ] = not implemented yet)
- [+] current (or gameState): GameState to start with.
- [+] players: The players that are playing the game. I think only strings work.

EVENTS:
- [?] onBeforeAction(action, oldState, newState): Called before the player does an action. Return true or false; true allows the action, false does not. Note that returning *undefined* counts as *true*, but console.log()s a warning.
- [?] onAfterAction(action, newState): Called after an action is done successfully. Cannot block actions.
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
				actionInProgress: {
					type: "homeworld",
				},
				
				// Everything else comes from additionalState
				...additionalState,
			};
			
			// for my debugging!
			window._g = this;
		}
		
		componentDidMount() {
			if (events.onMount) {
				events.onMount.call(this);
			}
			// I will probably forget...
			if (events.componentDidMount) {
				console.log("events.componentDidMount -> onMount, please");
			}
		}
		
		componentWillUnmount() {
			if (events.onUnmount) {
				events.onUnmount.call(this);
			}
			// again, I will probably forget
			if (events.componentWillUnmount) {
				console.log("events.componentWillUnmount -> onUnmount, please");
				// but do it anyway
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
		
		// I cannot think of how to do this without looping twice.
		// This function finds systems with either ships or stars, but not both.
		// You can pass a system ID to preserve.
		// This way, if you temporarily abandon your homeworld, it stays there.
		clearLonersMap(oldMap, preserveSystem) {
			// Data will be organized as { systemID: { ships: true, stars: false }, ... }.
			console.log("[clearLonersMap]", arguments);
			throw new Error("Should not be calling Game.clearLonersMap");
			
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
					// Ignore any ships at preserveSystem.
					// This would probably be the active player's homeworld.
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
		// property of action as action.turn or action.player, but this is not
		// recommended
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
					default:
						throw new Error("Invalid action type " + action.type + ". Could be a bug!");
				}
				console.log("New state", newState);
				
				let doUpdate = true;
				// Call any middleware (is that the right word?)
				if (events.onBeforeAction) {
					// return false to cancel the action
					const valid = events.onBeforeAction.call(this, action, current, newState);
					// I explicitly stated that "undefined" return is considered a true
					// I think undefined -> block causes more pain than good
					// but false/null/0/"" do block
					if (!valid && valid !== undefined) {
						doUpdate = false;
					}
				}
				
				if (doUpdate) {
					this.updateGameState(newState);
					if (events.onAfterAction) {
						events.onAfterAction.call(this, action, newState);
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
		
		doEndTurn() {
			const current = this.getCurrentState();
			const newState = current.doEndTurn();
			this.updateGameState(newState, true);
			// Clear any actions in progress
			// but in homeworld setup we should start them off with something
			if (newState.phase === "setup") {
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
			
			// delay logging until after render
			setTimeout(() => console.log(this.state.history), 100);
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
				this.setState({
					popup: {
						actions: actions,
						x: event.nativeEvent.clientX,
						y: event.nativeEvent.clientY - 50,
					},
				});
			}
		}
		
		// Handles clicking on the action button.
		handleButtonClick(actionData) {
			let success = true;
			try {
				switch (actionData.type) {
					case "build":
					case "steal":
					case "sacrifice":
					case "catastrophe":
						this.doAction(actionData, this.getCurrentState().turn);
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
				success = false;
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
			if (aip) {
				let success = true;
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
					} else {
						success = false; // no action to do here
					}
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
		
		// for my own testing, since React components seem to be inaccessible from window
		// note: probably going obsolete...
		testButton() {
			
		}
		
		render() {
			const current = this.getCurrentState();
			const winBanner = <p className="alert alert-info lead">
				{"Game over, " +
					(current.winner ? current.winner + " has won!" : "the game is a draw!")
				}
			</p>
			
			return <WrappedComponent>
				<div className="game row">
					<div className="star-map-wrapper col">
						<div className="star-map">
							<StarMap
								map={current.map}
								homeworldData={current.homeworldData}
								scaleFactor={this.state.scaleFactor}
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
							scaleFactor={ window.innerHeight / 1800 }
							data={current.map}
							handleClick={(serial) => this.handleStashClick(serial)}
						/>
						<button onClick={() => this.testButton()}>Test</button>
						<br/>
						{/* todo: click "end turn" should check for warnings like overpopulations */}
						<button className="btn btn-lg btn-info" onClick={() => this.doEndTurn()}>End Turn</button>
					</div>
				</div>
			</WrappedComponent>;
		}
		
	}
}


