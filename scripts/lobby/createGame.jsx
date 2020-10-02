// createGame.jsx
//
// The screen for creating a game.
// This might be a case where state is owned by multiple components...

import React from 'react';
import socket from './lobbySocket.js';

class CreateGame extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			numPlayers: 2,
			invitedPlayers: props.invitedPlayers || [],
			
			isRated: true,
			
			// tc stands for time control
			isTimed: false,
			tcMinutes: 10,
			tcSeconds: 0,
			tcBonus: 5,
			tcType: "delay",
			
			error: null,
		};
		
		this.handleInput = this.handleInput.bind(this);
		this.handleMultiInput = this.handleMultiInput.bind(this);
		window._test = this;
	}
	
	handleInput(event) {
		// Very much stolen from reactjs.org/docs/forms.html yet I typed it myself...
		const target = event.target;
		let value = (target.type === "checkbox" ? target.checked : target.value);
		const name = target.name;
		if (target.type === "number") {
			value = Number(value);
		}
		this.setState({
			[name]: value
		});
	}
	
	// requires special handler
	handleMultiInput(event) {
		const target = event.target;
		const values = [];
		for (let i = 0; i < target.selectedOptions.length; i++) {
			values.push(target.selectedOptions[i].value);
		}
		const name = target.name;
		this.setState({
			[name]: values
		});
	}
	
	handleSubmit() {
		// we have all the data in the React state
		// socket is a global variable
		socket.emit("createGame", this.state);
		console.log("Emitted createGame event");
		// and wait to see if it was successful
	}
	
	componentDidMount() {
		socket.on("createGameError", function(error) {
			this.setState({
				error: error.message,
			});
		}.bind(this));
	}
	componentWillUnmount() {
		socket.off("createGameError");
	}
	
	render() {
		const invitedPlayersOptions = [];
		for (let i = 0; i < this.props.activeUsers.length; i++) {
			const user = this.props.activeUsers[i];
			invitedPlayersOptions.push(<option value={user.username} key={user.username}>
				{user.username}
			</option>);
		}
		
		const formSubmitter = (function(event){
			console.log("Submitting form");
			this.handleSubmit();
			//socket.emit(...);
			event.preventDefault();
		}).bind(this);
		
		let errorMessage = null;
		if (this.state.error) {
			errorMessage = <h6 className="text-warning">{this.state.error}</h6>
		}
		
		return <form onSubmit={formSubmitter}>
			<div className="form-row">
				<div className="col-md">
					{/* 
						Left Side.
						Contains number of players, invitations, rated game option, and submit.
					*/}
					<div className="form-group">
						{errorMessage}
						<label htmlFor="selectNumPlayers">Number of Players</label>
						<select className="custom-select" id="selectNumPlayers" name="numPlayers"    value={this.state.numPlayers}
						        onChange={this.handleInput}>
							<option value={2}>2</option>
							{/* more coming... */}
						</select>
						<p className="form-text small">Currently only 2-player games are supported.</p>
					</div>
					
					{/* Is game rated? */}
					<div className="form-check">
						<input type="checkbox"
						       id="isRated"
						       name="isRated"
						       className="form-check-input"
						       checked={this.state.isRated}
						       onChange={this.handleInput} />
						<label htmlFor="isRated" className="form-check-label">Is Game Rated?</label>
					</div>
					
					{/* Invite Players */}
					<div className="form-group">
						<label htmlFor="selectInvitedPlayers">Invite Players (optional)</label>
						<select className="custom-select"
						        multiple={true}
						        id="selectInvitedPlayers"
						        name="invitedPlayers"
						        value={this.state.invitedPlayers}
						        onChange={this.handleMultiInput}
						        >
							{invitedPlayersOptions}
						</select>
						<p className="form-text small">You can select specific people to challenge. Any seats not reserved will be open to any player. <br/>
							Control+Click (Command on Mac) to select multiple or deselect.
						</p>
					</div>
					
					{/* If the display is 2 columns, it makes sense to put submit here */}
					<input type="submit"
					       className="btn btn-primary d-none d-md-inline-block" />
				</div>
				<div className="col-md">
					{/* 
						Right Side.
						Entirely devoted to time control right now.
					*/}
					<div className="form-check">
						<input type="checkbox"
						       id="isTimed"
						       name="isTimed"
						       className="form-check-input"
						       checked={this.state.isTimed}
						       onChange={this.handleInput} />
						<label htmlFor="isTimed" className="form-check-label">Use Time Control?</label>
					</div>
					<p className="form-text small">Time controls limit the amount of time that a player has to take their turn. Your clock runs during your turn and stops when you are finished.</p>
					{/* Enter starting time */}
					<div className="form-group">
						<label htmlFor="tcMinutes">Starting Time</label>
						{/* I wish Bootstrap had an easier way to put 2 inputs on a line */}
						<div className="form-row">
							<div className="col">
								{/* minutes */}
								<div className="input-group">
									<input id="tcMinutes"
									       name="tcMinutes"
									       type="number"
									       value={this.state.tcMinutes}
									       min="0" max="90"
									       className="form-control"
									       disabled={!this.state.isTimed}
									       onChange={this.handleInput} />
									<div className="input-group-append">
										<span className="input-group-text">min</span>
									</div>
								</div>
							</div>
							<div className="col">
								{/* seconds (optional) */}
								<div className="input-group">
									<input id="tcSeconds" name="tcSeconds"
										className="form-control"
										type="number" value={this.state.tcSeconds}
										min="0" max="55" step="5"
										disabled={!this.state.isTimed}
										onChange={this.handleInput} />
									<div className="input-group-append">
										<span className="input-group-text">sec</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* Enter delay or increment */}
					<div className="form-row">
						<div className="col form-group">
							<label htmlFor="tcType">Time Control Type</label>
							<select className="custom-select"
							        name="tcType" id="tcType"
							        value={this.state.tcType}
							        disabled={!this.state.isTimed}
							        onChange={this.handleInput}>
								<option value="delay">Delay</option>
								<option value="increment">Increment</option>
							</select>
						</div>
						<div className="col form-group">
							<label htmlFor="tcBonus">Delay/Increment</label>
							<input type="number" value={this.state.tcBonus}
							       id="tcBonus" name="tcBonus"
							       className="form-control"
							       disabled={!this.state.isTimed}
							       onChange={this.handleInput} />
						</div>
					</div>
					<p className="form-text small"><strong>Delay</strong> gives you the first {this.state.tcBonus} seconds of each turn free. <br/>
						<strong>Increment</strong> adds {this.state.tcBonus} seconds to your clock after each turn. <br/>
						Delay does NOT let you gain time if you finish within the allotted time, but Increment DOES. <br/>
						If you want neither, enter 0, but this is not recommended.
					</p>
					{/* If the display is 1 column, submit goes at the end */}
					<input type="submit"
					       className="btn btn-primary d-inline-block d-md-none" />
				</div>
			</div>
		</form>
	}
}

export default CreateGame;