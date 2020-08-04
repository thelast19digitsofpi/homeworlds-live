
import React from 'react';
import ReactDOM from 'react-dom';
import GameState from './gameState.mjs';
import withGame from './game.jsx';
import tutorialList from '../tutorials/tutorialList.js';
console.log(tutorialList);

// hmm could be a bad name
class TutorialWrapper extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		const parent = this.props.reactState;
		const tutorial = parent.tutorial;
		const currentStep = tutorial.steps[parent.stepID];
		let showPopup = (parent.messages && parent.messages.length > 0);
		
		const popup = showPopup ? <div className="tutorial-popup-wrapper">
			<div className="tutorial-popup card bg-light text-dark border border-primary">
				<div className="card-body">
					<h5 className="card-title text-center">{parent.messageTitle || tutorial.title}</h5>
					<p style={{whiteSpace: "pre-line"}}>
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
			<h2>{tutorial.title}</h2>
			<div className="btn-group">
				<button className="btn btn-secondary" onClick={() => this.props.displayStartMessage()}>
					<i className="material-icons md-18 mr-1 align-middle">restore</i>
					Show Intro
				</button>
				<button className="btn btn-secondary" onClick={() => this.props.displayHint()}>
					<i className="material-icons md-18 mr-1 align-middle">help_outline</i>
					Show Hint
				</button>
			</div>
			{this.props.children}
			{popup}
		</div>;
	}
}

const methods = {
	
};

const TutorialGame = withGame(TutorialWrapper, {
	onMount: function() {
		const tutorial = tutorialList[0];
		// mapOrPlayers, phase, hwData, nextSystemID, turnOrder, turn, actions, winner
		let maxSystem = 0;
		for (let serial in tutorial.startMap) {
			const data = tutorial.startMap[serial];
			if (data && data.at > maxSystem) {
				maxSystem = data.at;
			}
		}
		
		const gameState = new GameState(
			tutorial.startMap,
			"playing",
			{you: 1, enemy: 2}, // standard procedure
			maxSystem + 1,
			["you", "enemy"],
			"you",
			{number: 1, sacrifice: null},
			null
		);
		
		this.setState({
			current: gameState,
			history: [[gameState]],
			viewer: "you",
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
				const step = reactState.tutorial.steps[reactState.stepID];
				return {
					messages: step.startMessages,
					messageTitle: step.title || reactState.tutorial.title,
					messageNumber: 1,
					showPopup: true,
				};
			});
		}.bind(this);
		
		// do it when we launch
		this.displayStartMessage();
		
		// more functions
		this.displayHint = function() {
			const step = this.state.tutorial.steps[this.state.stepID];
			if (step.hint) {
				this.setState({
					messages: [step.hint],
					messageTitle: "Hint",
					messageNumber: 1,
				});
			}
		}.bind(this);
		
		this.clearMessage = function() {
			this.setState({
				messages: null,
				showPopup: false,
				messageNumber: 1,
			});
		}.bind(this);
		
		// to move to the next help message
		this.nextMessage = function() {
			if (this.state.messageType !== "start") {
				this.clearMessage();
			} else {
				if (this.state.messageNumber >= this.state.messages.length) {
					this.clearMessage();
					if (this.state.enemyActionQueue.length > 0) {
						this.nextEnemyAction();
					}
				} else {
					const step = this.state.tutorial.steps[this.state.stepID];
					this.setState({
						messageNumber: this.state.messageNumber + 1,
					});
				}
			}
		}.bind(this);
		
		this.prevMessage = function() {
			if (this.state.messageNumber > 1) {
				const step = this.state.tutorial.steps[this.state.stepID];
				this.setState({
					messageNumber: this.state.messageNumber - 1,
				});
			}
		}.bind(this);
		
		this.advanceStep = function() {
			if (this.state.stepID < this.state.tutorial.steps.length - 1) {
				this.setState({
					stepID: this.state.stepID + 1,
				});
				this.displayStartMessage();
			} else {
				this.setState({
					messageTitle: "Scenario Complete",
					messages: this.state.tutorial.endMessages,
					messageNumber: 1,
				});
			}
		}.bind(this);
		
		this.nextEnemyAction = function() {
			if (this.state.enemyActionQueue.length > 0) {
				setTimeout(function() {
					const action = this.shiftActionQueue();
					if (action) {
						if (action.type === "end-turn") {
							this.doEndTurn("enemy");
							this.advanceStep();
						} else {
							this.doAction(action, "enemy");
							// loop it
							this.nextEnemyAction();
						}
					}
				}.bind(this), 1500); // will adjust
			}
		}.bind(this);
	},
	
	getProps: function() {
		return {
			setParentState: this.setState.bind(this),
			
			nextMessage: this.nextMessage,
			prevMessage: this.prevMessage,
			clearMessage: this.clearMessage,
			displayStartMessage: this.displayStartMessage,
			displayHint: this.displayHint,
		};
	},
	
	canInteract: function(gameState) {
		return gameState.turn === "you";
	},
	
	onBeforeAction: function(action, player, oldState, newState) {
		console.log("onBeforeAction", arguments);
		// don't complain about enemy moves
		if (oldState.turn !== "you") {
			return true;
		}
		const step = this.state.tutorial.steps[this.state.stepID];
		if (step.checkAction) {
			const result = step.checkAction(action, oldState);
			if (result[1]) {
				this.setState({
					message: result[1],
					messageTitle: result[0] ? "Good Choice" : "Try Again!",
					messageNumber: 1,
				});
			}
			return result[0];
		}
	},
	
	onBeforeEndTurn: function(player, oldState) {
		if (player !== "you") {
			return true;
		}
		const step = this.state.tutorial.steps[this.state.stepID];
		if (step.checkEndTurn) {
			const result = step.checkEndTurn(this.state.current);
			if (result[1]) {
				// show a message if they made a wrong decision
				const resetNote = result[0] ? "" : "\n\n(Click \"Reset Turn\" to try again.)"
				this.setState({
					messages: [result[1] + resetNote],
					messageTitle: result[0] ? "Good Turn" : "Try Again",
					messageNumber: 1,
				});
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
		const step = this.state.tutorial.steps[this.state.stepID];
		if (step.checkEndTurn) {
			const result = step.checkEndTurn(this.state.current);
			// do any actions specified
			for (let i = 0; i < result.length; i++) {
				const maybeAction = result[i];
				const current = this.getCurrentState();
				if (typeof maybeAction === "object") {
					this.addToActionQueue(result[i]);
				}
			}
			this.addToActionQueue({
				// not a real action type
				// just a signifier (see onComponentUpdate)
				type: "end-turn",
			});
		}
	},
	
	onComponentUpdate: function() {
		
	},
	
}, {
	tutorial: tutorialList[0],
	stepID: 0,
	
	// these things really belong on TutorialWrapper
	// but I also need to update them from e.g. onBeforeEndTurn
	showPopup: true,
	
	// Lifting all the state
	messages: null,
	messageTitle: null,
	messageType: "start",
	messageNumber: 1,
	
	// we pass this to the wrapper component which is rendered inside i.e. is the child
	setParentState: null,
	
	// the opponent may need to do several actions at once
	// I think this is the only way to do it
	enemyActionQueue: [],
});


ReactDOM.render(<TutorialGame />, document.getElementById("game-container"));