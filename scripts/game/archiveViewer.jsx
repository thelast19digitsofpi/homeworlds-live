// archiveViewer.jsx
//
// Lets you look thru a past game

import React from 'react';
import ReactDOM from 'react-dom';
import GameState from './gameState.mjs';
import withGame from './game.jsx';
import unpackSummary from './unpackSummary.js';


// this is definitely not "proper" React, right?
// who cares?
// they don't want me to use inheritance which would actually make sense here
// and this is a module so they aren't even global scope pollutants
function moveToIndex(t, a) {
	// note this simply fails if either index is invalid
	if (!this.state.history[t] || !this.state.history[t][a]) {
		console.log("Bad indices", t, a);
		return;
	}
	this.setState({
		current: this.state.history[t][a],
		turnIndex: t,
		actionIndex: a,
	});
}
function moveToBeginning() {
	// simple
	moveToIndex.call(this, 0, 0);
}
function backTurn() {
	if (this.state.turnIndex <= 0) {
		moveToBeginning.call(this);
	} else {
		moveToIndex.call(this, this.state.turnIndex - 1, 0);
	}
}
function backAction() {
	console.log(this.state.actionIndex, this.state.turnIndex);
	if (this.state.actionIndex <= 0) {
		// go back to the last thing on the previous turn
		if (this.state.turnIndex <= 0) {
			// we are at (0, 0)
			moveToBeginning.call(this);
		} else {
			// move from (n, 0) to (n-1, end)
			const newTurnIndex = this.state.turnIndex - 1;
			moveToIndex.call(this, newTurnIndex, this.state.history[newTurnIndex].length - 1);
		}
	} else {
		moveToIndex.call(this, this.state.turnIndex, this.state.actionIndex - 1);
	}
}

// the forward ones are a little tricky
function forwardAction() {
	if (this.state.actionIndex + 1 >= this.state.history[this.state.turnIndex].length) {
		forwardTurn.call(this);
	} else {
		moveToIndex.call(this, this.state.turnIndex, this.state.actionIndex + 1);
	}
}

function forwardTurn() {
	if (this.state.turnIndex + 1 >= this.state.history.length) {
		moveToEnd.call(this);
	} else {
		// we still start at the beginning of the turn
		moveToIndex.call(this, this.state.turnIndex + 1, 0);
	}
}

function moveToEnd() {
	// all right I give in
	const turnIndex = this.state.history.length - 1;
	moveToIndex.call(this, turnIndex, this.state.history[turnIndex].length - 1);
}

function ArchiveWrapper(props) {
	const methods = props.reactState.methods;
	const iconify = (type) => (
		<i className="material-icons md-24 align-middle">{type}</i>
	);
	const btnClass = "btn btn-secondary";
	return <React.Fragment>
		<div className="btn-group" role="group" style={{verticalAlign: "middle"}}>
			<button className={btnClass} onClick={methods.moveToBeginning}>
				{iconify("skip_previous")}
				<span className="align-middle">Beginning</span>
			</button>
			<button className={btnClass} onClick={methods.backTurn}>
				{iconify("fast_rewind")}
				<span className="align-middle">Turn</span>
			</button>
			<button className={btnClass} onClick={methods.backAction}>
				{iconify("chevron_left")}
				<span className="align-middle">Action</span>
			</button>
			<button className={btnClass} onClick={methods.forwardAction}>
				<span className="align-middle">Action</span>
				{iconify("chevron_right")}
			</button>
			<button className={btnClass} onClick={methods.forwardTurn}>
				<span className="align-middle">Turn</span>
				{iconify("fast_forward")}
			</button>
			<button className={btnClass} onClick={methods.moveToEnd}>
				<span className="align-middle">End</span>
				{iconify("skip_next")}
			</button>
		</div>
		<div>
			{props.children}
		</div>
	</React.Fragment>
}

const ArchiveGame = withGame(ArchiveWrapper, {
	canInteract: function() {
		return false;
	},
	
	onMount: function() {
		const results = unpackSummary(this.props.players, this.props.summary);
		console.log(results);
		if (results.error) {
			console.error(results.error);
		}
		
		console.log("state");
		this.setState({
			viewer: this.props.players[0],
			current: results.currentState,
			history: results.history,
			winner: results.winner,
			// the last element from the array
			turnIndex: results.history.length - 1,
			// the last element from the last element from the array... yeah
			// || [] just to prevent errors
			actionIndex: (results.history[results.history.length - 1] || []).length - 1,
		
			// ok this is serious abuse of the React model
			// consider it my "revenge", served cold...
			methods: {
				moveToBeginning: moveToBeginning.bind(this),
				backTurn: backTurn.bind(this),
				backAction: backAction.bind(this),
				forwardTurn: forwardTurn.bind(this),
				forwardAction: forwardAction.bind(this),
				moveToEnd: moveToEnd.bind(this),
			},
		});
		
		window._a = this;
	},
}, {
	turnIndex: 0,
	actionIndex: 0,
	methods: {},
});

ReactDOM.render(<ArchiveGame players={GAME_INFO.players} summary={GAME_INFO.summary} />, document.getElementById("game-container"));
