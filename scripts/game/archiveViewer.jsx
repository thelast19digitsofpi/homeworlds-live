// archiveViewer.jsx
//
// Lets you look thru a past game

import React from 'react';
import ReactDOM from 'react-dom';
import GameState from './gameState.mjs';
import withGame from './game.jsx';
import unpackSummary from './unpackSummary.js';
import {getCompactSummary, getMapJSON} from './gameFunctions.mjs';

import {moveToIndex, moveToBeginning, backTurn, backAction, forwardTurn, forwardAction, moveToEnd} from './gameHistory.js';

function ArchivePopup(props) {
	const showPopup = props.reactState.showPopup;
	const methods = props.reactState.methods;
	
	const textareaCSS = {
		resize: "none",
		width: "100%",
		userSelect: "all",
	};
	// similar to the sandbox one
	const textarea = <textarea
		key={props.importing ? "import-textarea" : "export-textarea"}
		rows="4"
		style={textareaCSS}
		className="small"
		readOnly={true}
		onFocus={e => e.target.select()}
		onClick={e => {e.target.focus(); e.target.select()}}
		value={props.reactState.textareaValue}
		placeholder={'Map and log appear here'}></textarea>;
	
	const popupButtons = <React.Fragment>
		<button onClick={methods.getMap} className="btn btn-secondary">Get Map (Current)</button>
		<button onClick={methods.getLog} className="btn btn-secondary">Get Log (Full)</button>
		<button onClick={methods.closePopup} className="btn btn-danger" key="cancel">Done</button>
	</React.Fragment>
	
	// note to self: importing is dominant over exporting
	return showPopup ? <div className="control-popup-wrapper">
		<div className="control-popup card bg-light text-dark border border-primary">
			<div className="card-body">
				<h5 className="card-title text-center">
					Export Position or Game
				</h5>
				<p>Click the buttons below to get either just the map, or the entire game log.</p>
				{textarea}
			</div>
			{/* Control Buttons */}
			<div className="card-footer align-center btn-group">
				{popupButtons}
			</div>
		</div>
	</div> : null;
}


function ArchiveWrapper(props) {
	const methods = props.reactState.methods;
	const iconify = (type) => (
		<i className="material-icons md-24 align-middle">{type}</i>
	);
	const btnClass = "btn btn-secondary";
	const upperRow = <div className="btn-group" role="group" style={{verticalAlign: "middle"}}>
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
		<button className="btn btn-success text-light" onClick={methods.openPopup}>
			{iconify("save_alt")}&nbsp;Export
		</button>
	</div>;
	
	const popup = <ArchivePopup {...props} />;
	
	return <div className="container-fluid">
		<div className="position-relative">
			{upperRow}
			{props.children}
			{popup}
		</div>
	</div>
}

function getMap() {
	this.setState({
		textareaValue: getMapJSON.call(this),
	});
}
	
function getLog() {
	// for archives it's a bit different
	const lastTurn = this.state.history[this.state.history.length - 1];
	const lastState = lastTurn[lastTurn.length - 1];
	this.setState({
		// assume game is in progress unless phase is "end"
		textareaValue: getCompactSummary(this.state.allActions, lastState.turnOrder, lastState.winner, lastState.phase !== "end"),
	});
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
			allActions: results.allActions,
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
				
				getMap: getMap.bind(this),
				getLog: getLog.bind(this),
				openPopup: function() {
					this.setState({
						showPopup: true,
						textareaValue: "",
					});
				}.bind(this),
				closePopup: function() {
					this.setState({
						showPopup: false,
					});
				}.bind(this),
			},
		});
		
		window._a = this;
	},
}, {
	turnIndex: 0,
	actionIndex: 0,
	methods: {},
	textareaValue: "",
	showPopup: false,
});

ReactDOM.render(<ArchiveGame players={GAME_INFO.players} summary={GAME_INFO.summary} />, document.getElementById("game-container"));
