// gameHistory.js
//
// for navigating through a game

// import nothing from nothing...

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

export {moveToIndex, moveToBeginning, backTurn, backAction, forwardTurn, forwardAction, moveToEnd};
