// specificRoom.jsx
//
// When you click on a room, it shows you this.


// Props Wanted:
// room
// removePlayer(username), handleStartClick(), handle
// 
class SpecificRoom extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			confirmRemoveUsername: null,
			error: null,
		};
		// I'm unsure so... betterSafeThanSorry();
		this.playerToLi = this.playerToLi.bind(this);
	}
	
	
	getTimeControlString() {
		let tcTime = "None";
		let tcExtension = "";
		const tc = this.props.room.options.timeControl;
		if (tc) {
			const minutes = Math.floor(tc.start / 60);
			const seconds = tc.start % 60;
			tcTime = `${minutes} minute${minutes === 1 ? "" : "s"}`;
			if (seconds > 0) {
				tcTime += `, ${seconds} second${seconds === 1 ? 's' : ''}`;
			}
			
			if (tc.bonus > 0) {
				tcExtension = ` with a ${tc.bonus}-second ${tc.type}`;
			}
		}
		
		return tcTime + tcExtension;
	}
	
	confirmRemove(playerOrUsername) {
		this.setState({
			confirmRemoveUsername: playerOrUsername.username || playerOrUsername,
		});
	}
	
	cancelRemove() {
		this.setState({
			confirmRemoveUsername: null,
		});
	}
	
	// Returns an object with 3 booleans: joined, owner, invited
	getYourStatus() {
		const room = this.props.room;
		const status = {
			joined: false,
			invited: false,
			owner: false,
		};
		for (let i = 0; i < room.players.length; i++) {
			if (room.players[i].username === YOUR_USERNAME) {
				status.joined = true;
				if (i === 0) { // owner is always first on the list
					status.owner = true;
				}
			}
		}
		for (let i = 0; i < room.invitedPlayers.length; i++) {
			if (room.invitedPlayers[i].username === YOUR_USERNAME) {
				status.invited = true;
			}
		}
		return status;
	}
	
	playerToLi(player) {
		let removeButton = (
			<button className="float-right btn btn-danger btn-sm"
			        onClick={() => this.confirmRemove(player.username)}
			        >Remove</button>
		);
		if (this.state.confirmRemoveUsername === player.username) {
			removeButton = <span className="float-right">
				<button className="btn btn-danger btn-sm"
				        onClick={() => this.removePlayer(player.username)}>Confirm</button>
				<button className="btn btn-secondary btn-sm"
				        onClick={this.cancelRemove.bind(this)}>CANCEL</button>
			</span>
		}
		
		// show disconnected players in red
		return <li key={player.username}
		    className={(player.connected ? "" : "text-danger ") + "list-group-item"}>
			{player.username}
			{player.connected ? null : " (offline)"}
			{/* Show the "remove" button only if you are the owner */}
			{this.getYourStatus().owner && removeButton}
		</li>
	}
	
	clearError() {
		this.setState({error: null});
	}
	
	/* Button click methods */
	
	// all rather simple
	startGame() {
		socket.emit("prepareStartGame", this.props.room.id);
		this.clearError();
	}
	
	joinGame() {
		socket.emit("joinGame", this.props.room.id);
		this.clearError();
	}
	
	leaveGame() {
		socket.emit("leaveGame", this.props.room.id);
		this.clearError();
	}
	
	// ok this needs more information
	removePlayer(username) {
		socket.emit("removePlayer", this.props.room.id, username);
		this.clearError();
	}
	
	confirmStart() {
		socket.emit("confirmStart", this.props.room.id);
		this.clearError();
	}
	
	cancelStart() {
		socket.emit("cancelStart", this.props.room.id);
		this.clearError();
	}
	
	// Launch sequence
	haveYouConfirmed() {
		const room = this.props.room;
		for (let i = 0; i < room.confirmedStart.length; i++) {
			const player = room.confirmedStart[i];
			if (player.username === YOUR_USERNAME) {
				return true;
			}
		}
		return false;
	}
	
	// some event listeners, and since SpecificRoom gets unmounted, we need a socket.off()
	componentDidMount() {
		socket.on("gameRoomError", function(error) {
			this.setState({
				error: error.message,
			});
		}.bind(this));
	}
	componentWillUnmount() {
		socket.off("gameRoomError");
	}
	
	render() {
		const room = this.props.room;
		const options = room.options;
		
		// Are you the owner of this room? Are you in it? Have you been invited?
		let yourStatus = this.getYourStatus();
		
		const stayConnectedWarning = (
			<h6 className="text-primary"><strong>Note: You must keep a tab open to the lobby, or you will be <u>removed from the game</u>.</strong> When {yourStatus.owner ? "you are" : "the owner is"} ready to play, ALL players must confirm they wish to play before the game starts.</h6>
		)
		
		// if you are the owner
		const startGameButton = <button className="btn btn-lg btn-primary"
			onClick={() => this.startGame()}>START GAME</button>
		
		// if you are in the room
		// "If you wish to" is so the join and leave buttons do not overlap
		const leaveGameButton = <React.Fragment>
			<span className="ml-2 mr-2">If you wish to:</span>
			<button className="btn btn-lg btn-danger"
			        onClick={() => this.leaveGame()}>LEAVE GAME</button>
		</React.Fragment>
		const joinGameButton = <button className="btn btn-lg btn-success"
			onClick={() => this.joinGame()}>Join Game</button>
		
		
		const roomControls = <React.Fragment>
			{yourStatus.joined && stayConnectedWarning}
			<hr/>
			<p>
				{yourStatus.owner && startGameButton}
				{yourStatus.joined ? leaveGameButton : joinGameButton}
			</p>
		</React.Fragment>
		
		// UI for the launch sequence!
		const launchSequenceUI = <p className="lead">
			{this.haveYouConfirmed() ? " Waiting for all players to confirm..." : (<React.Fragment>
				You need to &#160;
				<button onClick={() => this.confirmStart()} className="btn btn-primary">confirm you are ready!</button> <br/>
				Or, if you want, you can &#160;
				<button onClick={() => this.cancelStart()} className="btn btn-danger">cancel</button> the game starting.
			</React.Fragment>)}
		</p>
		
		// Render!
		if (room.isStarting) {
			return <div className="jumbotron">
				<h2>Game Is Starting!</h2>
				<p className="lead">
					Game #{room.id}
					&bull;
					Time control: {this.getTimeControlString()}
					&bull;
					Players: {room.players.map(player => player.username).join(", ")}
				</p>
				{launchSequenceUI}
			</div>;
		} else {
			return <div className="container">
				<h4>Game Room #{room.id}</h4>
				<h5 className="text-muted">
					This table fits {room.numPlayers} players
					&bull;
					Time control: {this.getTimeControlString()}
				</h5>
				
				{ /* Rendering the Error Message */
					this.state.error && 
					<p className="text-danger">
						{this.state.error}
						<button class="btn btn-secondary btn-small" onClick={() => this.clearError()}>OK</button>
					</p>
				}
				
				{roomControls}
				
				{/* Player Lists */}
				<div className="row">
					<div className="col">
						<h5>Players Joined</h5>
						<ul className="list-group">
							{room.players.map(this.playerToLi)}
						</ul>
					</div>
					<div className="col">
						<h5>Players Invited</h5>
						<ul className="list-group">
							{ /* Show the list of invited players, or the word "none" */
								room.invitedPlayers.length > 0 ?
								room.invitedPlayers.map(this.playerToLi) :
								<li className="list-group-item">(none)</li>
							}
						</ul>
					</div>
				</div>
			</div>;
		}
	}
}