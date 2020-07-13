// liveGame.jsx
//
// Higher order components really do work.
// I still think inheritance (class LiveGame extends Game) would be slightly cleaner.

function LiveGameDisplay(props) {
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
		{this.props.children}
		<div className="lower-display">
			{clockElements}
		</div>
	</React.Fragment>
}


const LiveGame = withGame(LiveGameDisplay, {
	
});

ReactDOM.render(<LiveGame />, document.getElementById("game-container"));