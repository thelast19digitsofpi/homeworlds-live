// lobby.jsx
//
// For the screen when you are deciding which game to play


class MainLobby extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			pingMs: "unknown",
			whosOnline: [],
			gameRooms: [],
			
			view: "game-list",
			roomID: null, // id, not array index!
			room: null,
			
			updateIntervalID: null,
			
			alerts: [],
			alertKey: 1,
		};
	}
	
	showCreateGame() {
		this.setState({
			view: "create-game",
			// reset
			roomID: null,
			room: null,
		});
	}
	
	showGameList() {
		this.setState({
			view: "game-list",
			// reset
			roomID: null,
			room: null,
		});
	}
	
	showSpecificRoom(newRoomID) {
		console.warn(`showSpecificRoom(${newRoomID})`);
		console.log(this.state.gameRooms);
		const rooms = this.state.gameRooms;
		for (let i = 0; i < rooms.length; i++) {
			if (rooms[i].id === newRoomID) {
				this.setState({
					view: "specific-room",
					roomID: newRoomID,
					room: rooms[i],
				});
				return;
			}
		}
		// If we do not find the room, show the game list
		this.showGameList();
	}
	
	handleServerUpdateResponse(data) {
		this.setState({
			whosOnline: data.whosOnline,
			gameRooms: data.gameRooms,
		});
		console.log("Received server update response");
		
		let foundRoom = false;
		for (let i = 0; i < data.gameRooms.length; i++) {
			if (data.gameRooms[i].id === this.state.roomID) {
				console.log("Updating conditions of the room");
				this.setState({
					room: data.gameRooms[i],
				});
				foundRoom = true;
			}
		}
		// If the room dies while you are inside it, go back to the lobby
		if (!foundRoom && this.state.room) {
			this.showGameList();
			this.addNewAlert("The room you were in was abandoned, so it closed.", "primary");
		}
	}
	
	addNewAlert(message, type) {
		// just in case we try to add 2+ alerts at once or something
		this.setState(function(oldState) {
			return {
				// neat, a legitimate use for ([{...}]) in real code!
				alerts: oldState.alerts.concat([{
					message: message,
					type: type,
					key: oldState.alertKey,
				}]),
				// increment so they are unique
				alertKey: oldState.alertKey + 1,
			};
		});
	}
	
	closeAlert(index) {
		const alerts = this.state.alerts;
		this.setState({
			// get 0...index-1 followed by index+1...end
			alerts: alerts.slice(0, index).concat(alerts.slice(index + 1)),
		});
	}
	
	// LifeCycleFunctions
	componentDidMount() {
		console.log("Component did mount");
		
		socket.on("pong", (ms) => {
			this.setState({
				pingMs: ms,
			});
		});
		
		// For the regular pings to update the list of games
		socket.emit("updatePlease");
		const intervalID = setInterval(function() {
			socket.emit("updatePlease");
		}, 2000);
		this.setState({
			updateIntervalID: intervalID,
		});
		// When you disconnect, stop pinging...
		socket.on("disconnect", function() {
			clearInterval(this.state.updateIntervalID);
		}.bind(this));
		// ...and then when you reconnect, resume.
		socket.on("reconnect", function() {
			const newIntervalID = setInterval(() => socket.emit("updatePlease"), 3500);
			this.setState({
				updateIntervalID: newIntervalID,
			});
		}.bind(this));
		
		socket.on("updateResponse", this.handleServerUpdateResponse.bind(this));
		
		socket.on("createGameSuccess", () => {
			this.showGameList();
		});
		
		
		
		// The final event handler
		// Seems so anti-climactic
		socket.on("gameStart", function(data) {
			location = "/game/" + data.roomID;
		});
	}
	
	componentWillUnmount() {
		console.warn("Why is this being called?!");
		clearInterval(this.state.intervalID);
	}
	
	render() {
		let mainScreen;
		if (this.state.view === "game-list") {
			mainScreen = <div className="col-xs-12 col-lg-9">
				<h4>Join a Game</h4>
				<button className="btn btn-secondary" onClick={() => this.showCreateGame()}>Create a game instead</button>
				
				<GameRooms list={this.state.gameRooms}
				           onRowClick={(room) => this.showSpecificRoom(room)} />
			</div>;
		} else if (this.state.view === "create-game") {
			// whenDone is a prop function to switch back when you submit or click "back"
			mainScreen = <div className="col-xs-12 col-lg-9">
				<h4>Create a Game</h4>
				<button className="btn btn-secondary" onClick={() => this.showGameList()}>Join an existing game instead</button>
				<CreateGame
					whenDone={() => this.showGameList()}
					activeUsers={this.state.whosOnline} />
			</div>
		} else if (this.state.view === "specific-room") {
			mainScreen = <div className="col-xs-12 col-lg-9">
				<button className="btn btn-secondary" onClick={() => this.showGameList()}>Go back to the lobby</button>
				<SpecificRoom room={this.state.room} />
			</div>
		}
		
		return <React.Fragment>
			<h2>Main Lobby</h2>
			<p className="lead">Welcome to Homeworlds Live! If you are new, check out the <a onClick={() => alert("TODO")} href="#">tutorial</a>.</p>
			<Alerts list={this.state.alerts} onClick={this.closeAlert.bind(this)} />
			<div className="row">
				{mainScreen}
				<div className="col-xs-12 col-lg-3">
					<h4>Who's Online</h4>
					<WhosOnline list={this.state.whosOnline} />
					<p className="small">Ping time: {this.state.pingMs} ms</p>
				</div>
			</div>
		</React.Fragment>
	}
}


ReactDOM.render(
	<MainLobby />,
	document.getElementById("lobby-container")
);
