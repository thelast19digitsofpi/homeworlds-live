// liveGame.jsx
//
// Higher order components really do work, albeit somewhat messily.
// I still think inheritance (class LiveGame extends Game) would be slightly cleaner.

function LiveGameDisplay(props) {
	// get the state object of the game
	const state = props.data;
	
	const clocks = []; // somehow get these
	let clockElements = [];
	for (let i = 0; i < clocks.length; i++) {
		let className = "clock";
		if (clocks[i].running) {
			className += " active";
		}
		clockElements.push(<div className={className}>
			<p className="title clock-name">Player Name</p>
			<p className="clock-value">03:44</p>
		</div>)
	}
	
	return <React.Fragment>
		{props.children}
		<div className="lower-display">
			{clockElements}
		</div>
	</React.Fragment>
}

// wrapper component, events, additional state
const LiveGame = withGame(LiveGameDisplay, {
	// These methods will be run on the wrapped component
	onMount: function() {
		socket.on("action", function(data) {
			this.doAction(data.action, data.player);
		});
	},
	
	// this one just generically asks if you can do anything at all
	canDoActions: function(state) {
		return state.turn === YOUR_USERNAME;
	},
	onBeforeAction: function(action, oldState, newState) {
		if (oldState.turn !== YOUR_USERNAME) {
			return false;
		}
		
		return true;
	},
	onAfterAction: function(action) {
		socket.emit("doAction", {
			action: action,
			gameID: GAME_ID,
		});
	}
}, {
	viewer: YOUR_USERNAME,
});

ReactDOM.render(<LiveGame />, document.getElementById("game-container"));