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
		socket.on("gamePosition", function(game) {
			const isYourTurn = (game.currentState.turn === YOUR_USERNAME);
			const isHomeworldSetup = (game.currentState.phase === "setup");
			this.setState({
				// we want a GameState object, not a vanilla object
				current: GameState.recoverFromJSON(game.currentState),
				// Start homeworld setup if and only if it is your turn
				actionInProgress: (isYourTurn && isHomeworldSetup) ? {type: "homeworld"} : null,
			});
		}.bind(this));
		
		// race conditions are going to seriously mess this up...
		socket.on("action", function(data) {
			this.doAction(data.action, data.player);
		}.bind(this));
		socket.on("endTurn", function(data) {
			this.doEndTurn(data.player);
		}.bind(this));
	},
	
	// this one just generically asks if you can do anything at all
	canInteract: function(state) {
		return state.turn === YOUR_USERNAME;
	},
	// I have to be a little bit careful here
	// we call doAction when the other player moves, too
	onBeforeAction: function(action, player, oldState, newState) {
		// hmmm... do we even need anything else?
		return true;
	},
	onAfterAction: function(action, player, newState) {
		console.warn("onAfterAction", player);
		if (player === YOUR_USERNAME) {
			console.log("emitting");
			socket.emit("doAction", {
				action: action,
				gameID: GAME_ID,
			});
		}
	},
	onAfterEndTurn: function(player, newState) {
		console.warn("onAfterEndTurn", arguments);
		if (player === YOUR_USERNAME) {
			console.log("emitting");
			socket.emit("doEndTurn", {
				gameID: GAME_ID
			});
		}
	},
}, {
	viewer: YOUR_USERNAME,
});

ReactDOM.render(<LiveGame />, document.getElementById("game-container"));