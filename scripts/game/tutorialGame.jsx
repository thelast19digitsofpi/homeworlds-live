
import React from 'react';
import ReactDOM from 'react-dom';
import GameState from './gameState.mjs';
import withGame from './game.jsx';

// handles tutorial UI
class TutorialWrapper extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		const parent = this.props.reactState;
		const tutorial = this.props.tutorial;
		const currentStep = tutorial.steps[parent.stepID];
		let showPopup = (parent.messages && parent.messages.length > 0);
		
		const popup = showPopup ? <div className="tutorial-popup-wrapper">
			<div className="tutorial-popup card bg-light text-dark border border-primary">
				<div className="card-body">
					<h5 className="card-title text-center">{parent.messageTitle || tutorial.title}</h5>
					<p style={{whiteSpace: "pre-line"}} className="mb-0">
						{parent.messages[parent.messageNumber - 1] /* -1 because array index */}
					</p>
				</div>
				<div className="card-footer align-center btn-group">
					<button className="btn btn-secondary btn-sm"
						disabled={parent.messageNumber <= 1}
						onClick={() => this.props.prevMessage()}>
						<i className="material-icons md-24 align-middle">chevron_left</i>
					</button>
					<button className="btn btn-secondary" disabled>
						{parent.messageNumber}/{parent.messages.length}
					</button>
					<button className="btn btn-secondary btn-sm" onClick={() => this.props.nextMessage()}>
						<i className="material-icons md-24 align-middle">
							{parent.messageNumber >= parent.messages.length ? "check" : "chevron_right"}
						</i>
					</button>
				</div>
			</div>
		</div> : null;
		
		// ooh this is interesting
		return <div className="position-relative">
			<h3>{tutorial.title}</h3>
			{/* button group at top */}
			<div className="btn-group">
				<button className="btn btn-danger"
					onClick={() => this.props.navMethods.returnToMenu()}>
					<i className="material-icons md-18 mr-1 align-middle">undo</i>
					Back to Menu
				</button>
				<button className="btn btn-secondary" onClick={() => this.props.displayStartMessage()}>
					<i className="material-icons md-18 mr-1 align-middle">restore</i>
					Show Intro
				</button>
				<button className="btn btn-secondary"
					onClick={() => this.props.displayHint()}>
					<i className="material-icons md-18 mr-1 align-middle">help_outline</i>
					Show Hint
				</button>
				{
					parent.complete && <button className="btn btn-success"
						onClick={() => this.props.navMethods.nextTutorial()}>
						<i className="material-icons md-18 mr-1 align-middle">play_arrow</i>
						Next Module
					</button>
				}
			</div>
			{/* Render the game */}
			{this.props.children}
			{popup}
		</div>;
	}
}

const methods = {
	
};

const TutorialGame = withGame(TutorialWrapper, {
	onMount: function() {
		const tutorial = this.props.tutorial;
		// mapOrPlayers, phase, hwData, nextSystemID, turnOrder, turn, actions, winner
		let maxSystem = 0;
		for (let serial in tutorial.startMap) {
			const data = tutorial.startMap[serial];
			if (data && data.at > maxSystem) {
				maxSystem = data.at;
			}
		}
		
		let needsHomeworld = true;
		for (let serial in tutorial.startMap) {
			const data = tutorial.startMap[serial];
			if (data && data.at === 1) {
				// your homeworld.
				needsHomeworld = false; // you have it
				break; // stop searching
			}
		}
		
		const gameState = new GameState(
			tutorial.startMap,
			needsHomeworld ? "setup" : "playing",
			needsHomeworld ? {} : {you: 1, enemy: 2}, // standard procedure
			maxSystem + 1,
			["you", "enemy"],
			"you",
			{number: 1, sacrifice: null},
			null // winner
		);
		
		this.setState({
			current: gameState,
			history: [[gameState]],
			viewer: "you",
			actionInProgress: needsHomeworld ? {type: "homeworld"} : null,
		});
		
		// some functions
		this.addToActionQueue = function(action) {
			this.setState(function(reactState) {
				return {
					enemyActionQueue: reactState.enemyActionQueue.concat([action]),
				};
			});
		}.bind(this);
		
		// has to be done one at a time
		this.shiftActionQueue = function() {
			const first = this.state.enemyActionQueue[0];
			this.setState({
				enemyActionQueue: this.state.enemyActionQueue.slice(1),
			});
			return first;
		}.bind(this);
		
		this.displayStartMessage = function() {
			this.setState(function(reactState) {
				const step = this.props.tutorial.steps[reactState.stepID];
				return {
					messages: step.startMessages,
					messageTitle: step.title || this.props.tutorial.title,
					messageNumber: 1,
					showPopup: true,
				};
			}.bind(this));
		}.bind(this);
		
		// do it when we launch
		this.displayStartMessage();
		
		// more functions
		this.displayHint = function displayHint() {
			const step = this.props.tutorial.steps[this.state.stepID];
			const hint = step.hint;
			if (hint) {
				this.setState({
					// make it an array if it is not already
					messages: (hint instanceof Array) ? hint : [hint],
					messageTitle: "Hint",
					messageNumber: 1,
				});
			}
		}.bind(this);
		
		this.clearMessage = function clearMessage() {
			this.setState({
				messages: null,
				showPopup: false,
				messageNumber: 1,
			});
		}.bind(this);
		
		// to move to the next help message
		this.nextMessage = function nextMessage() {
			if (this.state.messageType !== "start") {
				this.clearMessage();
			} else {
				if (this.state.messageNumber >= this.state.messages.length) {
					this.clearMessage();
					if (this.state.enemyActionQueue.length > 0) {
						this.nextEnemyAction();
					}
				} else {
					const step = this.props.tutorial.steps[this.state.stepID];
					this.setState({
						messageNumber: this.state.messageNumber + 1,
					});
				}
			}
		}.bind(this);
		
		this.prevMessage = function prevMessage() {
			if (this.state.messageNumber > 1) {
				const step = this.props.tutorial.steps[this.state.stepID];
				this.setState({
					messageNumber: this.state.messageNumber - 1,
				});
			}
		}.bind(this);
		
		this.advanceStep = function advanceStep() {
			const currentStep = this.props.tutorial.steps[this.state.stepID];
			let nextIndex = this.state.stepID + 1;
			if (currentStep.nextStep) {
				// nextStep uses the game state to decide which one is next
				let result = currentStep.nextStep(this.getCurrentState());
				if (typeof result === "number") {
					// offset from the current state
					nextIndex = this.state.stepID + result;
				} else if (typeof result === "string") {
					// loop thru all steps and find the one with the proper ID
					for (let i = 0; i < this.props.tutorial.steps.length; i++) {
						const otherStep = this.props.tutorial.steps[i];
						if (otherStep.id === result) {
							nextIndex = i;
							break;
						}
					}
				}
			}
			// make things happen
			console.warn("Moving to step " + nextIndex);
			// don't go before the start
			if (nextIndex < 0) nextIndex = 0;
			if (nextIndex < this.props.tutorial.steps.length) {
				// move to that index
				this.setState({
					stepID: nextIndex,
				});
				this.displayStartMessage();
			} else {
				// you have finished the step
				// disable the tutorial
				console.log("End of Module");
				this.setState({
					messageTitle: "Scenario Complete",
					messages: this.props.tutorial.endMessages,
					messageNumber: 1,
					complete: true,
				});
			}
		}.bind(this);
		
		this.nextEnemyAction = function nextEnemyAction(delay) {
			console.log(this.state.enemyActionQueue);
			const enemyActionTimeout = setTimeout(function() {
				// get the state BEFORE shifting the queue
				const queue = this.state.enemyActionQueue;
				const action = this.shiftActionQueue();
				if (action) {
					if (action.type === "end-turn") {
						// call this.advanceStep after doing the end-turn
						this.doEndTurn("enemy", this.advanceStep);
					} else {
						this.doAction(action, "enemy");
						// loop it
						// queue contains at least this action and possibly more
						if (queue.length >= 3) {
							this.nextEnemyAction(1500);
						} else if (queue.length === 2) {
							// shorter delay for just an end turn
							this.nextEnemyAction(750);
						}
						// else, do not request another action
					}
				}
				// below: the timer is 0.5s for end-turn and 1.5s for actions
			}.bind(this), delay || 1500); // will adjust
			
			// put the timeout key in the state so we can clear it if needed
			this.setState({
				enemyActionTimeout: enemyActionTimeout,
			});
		}.bind(this);
	},
	
	onUnmount: function() {
		clearTimeout(this.enemyActionTimeout);
	},
	
	getProps: function() {
		return {
			setParentState: this.setState.bind(this),
			
			tutorial: this.props.tutorial,
			navMethods: this.props.navMethods,
			
			nextMessage: this.nextMessage,
			prevMessage: this.prevMessage,
			clearMessage: this.clearMessage,
			displayStartMessage: this.displayStartMessage,
			displayHint: this.displayHint,
		};
	},
	
	canInteract: function(gameState) {
		return gameState.turn === "you" && !(this.state.complete);
	},
	
	onBeforeButtonClick: function(actionType, oldState) {
		console.log("onBeforeButtonClick", arguments);
		
		const step = this.props.tutorial.steps[this.state.stepID];
		const banned = step.bannedActions;
		// Is the action on a simple list of banned actions?
		if (banned instanceof Array && banned.indexOf(action.type) >= 0) {
			this.setState({
				messages: ["We aren't doing " + actionType + " actions right now."],
				messageTitle: "Not Yet",
				messageNumber: 1,
			});
			return false;
		}
		
		if (banned instanceof Object && banned[actionType]) {
			const msg = banned[actionType];
			this.setState({
				message: (msg instanceof Array) ? msg : [msg],
				messageTitle: "Not Yet",
				messageNumber: 1,
			});
			return false;
		}
		return true;
	},
	
	onBeforeAction: function(action, player, oldState, newState) {
		console.log("onBeforeAction", arguments);
		// don't complain about enemy moves
		if (oldState.turn !== "you") {
			return true;
		}
		const step = this.props.tutorial.steps[this.state.stepID];
		// bannedActions can accept array or object
		if (step.bannedActions instanceof Array && step.bannedActions.indexOf(action.type) !== -1) {
			return false;
		}
		// object has the banned ones as keys (values are messages, which should be caught in onBeforeButtonClick)
		if (step.bannedActions instanceof Object && step.bannedActions[action.type]) {
			return false;
		}
		if (this.props.tutorial.bannedActions && this.props.tutorial.bannedActions.indexOf(action.type) !== -1) {
			return false;
		}
		if (step.checkAction) {
			const result = step.checkAction(action, oldState);
			if (!result) {
				// no return!
				console.error(new Error("This is bad. Function did not return! Assuming move is good..."));
				return true;
			}
			
			if (result[1]) {
				console.warn("Result", result[1]);
				this.setState({
					messages: (result[1] instanceof Array) ? result[1] : [result[1]],
					messageTitle: result[0] ? "Success" : "Try Again!",
					messageNumber: 1,
				});
			}
			return result[0];
		}
	},
	
	// onAfterAction: function(action, newState) {
		
	// },
	
	onBeforeEndTurn: function(player, oldState) {
		if (player !== "you") {
			return true;
		}
		const step = this.props.tutorial.steps[this.state.stepID];
		if (step.checkEndTurn) {
			const result = step.checkEndTurn(this.state.current);
			if (result[1]) {
				// show a message if they made a wrong decision
				const resetNote = result[0] ? "" : "\n\n(Click \"Reset Turn\" to try again.)"
				const messages = (result[1] instanceof Array) ? result[1].slice() : [result[1]];
				// put the reset note on the last message, if there is one
				if (messages.length > 0) {
					messages[messages.length - 1] += resetNote;
				}
				this.setState({
					messages: messages,
					messageTitle: result[0] ? "Good Turn" : "Try Again",
					messageNumber: 1,
				});
			} else if (result[0]) {
				// no message but we did pass
				// we have to start the action queue
				// (nextEnemyAction uses setTimeout already)
				this.nextEnemyAction();
			}
			return result[0];
		} else {
			return true;
		}
	},
	
	onAfterEndTurn: function(player, newState) {
		// don't call this when the opponent ends their turn.
		if (player === "enemy") {
			return true;
		}
		// unfortunately I have to do all the same stuff
		const step = this.props.tutorial.steps[this.state.stepID];
		if (step.checkEndTurn) {
			const result = step.checkEndTurn(this.state.current);
			// do any actions specified
			for (let i = 0; i < result.length; i++) {
				const maybeAction = result[i];
				const current = this.getCurrentState();
				console.log("possible action", i, maybeAction, typeof maybeAction);
				// who at JS decided to make typeof not distinguish arrays?!
				if (typeof maybeAction === "object" && !(maybeAction instanceof Array)) {
					this.addToActionQueue(result[i]);
				}
			}
			console.log(1);
			if (!result[1]) {
				// length 3 or more includes actions, so we use a longer timer
				this.nextEnemyAction(result.length >= 3 ? 1500 : 500);
			}
		} else {
			// nothing? so we just end the turn?
			this.nextEnemyAction(500);
		}
		this.addToActionQueue({
			// not a real action type
			// just a signifier (see nextEnemyAction)
			type: "end-turn",
		});
	},
	
}, {
	stepID: 0,
	
	// these things really belong on TutorialWrapper
	// but I also need to update them from e.g. onBeforeEndTurn
	showPopup: true,
	
	// Lifting all the state
	messages: null,
	messageTitle: null,
	messageType: "start",
	messageNumber: 1,
	
	complete: false,
	
	// we pass this to the wrapped component which is rendered inside i.e. is the child
	setParentState: null,
	
	// the opponent may need to do several actions at once
	// I think this is the only way to do it
	enemyActionQueue: [],
	enemyActionTimeout: null,
});


export default TutorialGame;