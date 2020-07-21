// game-clock.js
//
// One player's game clock.

function GameClock(username, start, bonus, type) {
	this.username = username;
	this.turnStartValue = start; // how much time you had when your turn started
	this.bonus = bonus;
	this.type = type;
	this.running = false;
	this.started = 0;
	this.expired = false;
	
	// Functions to call when the timer ends
	this.events = [];
	this.timeoutID = null;
}
// Your turn begins.
// Note: this.turnStartValue is set during endTurn()
GameClock.prototype.beginTurn = function() {
	if (!this.running) {
		this.started = Date.now();
		this.running = true;
		
		// Run the timer...
		// delay happens before the turn, increment after
		const timeoutTime = this.turnStartValue + (this.type === "delay" ? this.bonus : 0);
		this.timeoutID = setTimeout(function() {
			this.expired = true;
			for (let i = 0; i < this.events.length; i++) {
				if (typeof this.events[i] === "function") {
					this.events[i]();
				} else {
					console.warn("[GameClock.beginTurn] How did THIS happen?");
				}
			}
		}.bind(this), 1000 * timeoutTime)
	}
}
GameClock.prototype.endTurn = function() {
	if (this.running) {
		// figure out how much time we used
		const timeUsed = (Date.now() - this.started) / 1000;
		// if increment, we would gain the bonus now; if delay, we already used the bonus
		let timeLoss = timeUsed - this.bonus;
		// With delay, you do not gain time
		if (this.type === "delay" && timeLoss < 0) {
			timeLoss = 0;
		}
		// timeLoss is in milliseconds
		this.turnStartValue -= timeLoss;
		this.turnStartValue = Math.max(this.turnStartValue, 0);
		// finally, turn the clock off for now
		this.running = false;
		clearTimeout(this.timeoutID);
	}
}
GameClock.prototype.getTimeLeft = function() {
	let timeLeft;
	if (this.running) {
		// time spent is (now - started) but those are in milliseconds
		// this gets the amount of time you would have on non-delay
		const base = this.turnStartValue - (Date.now() - this.started)/1000;
		if (this.type === "delay") {
			// Give back your bonus but do not exceed what you started the turn with
			timeLeft = Math.min(base + this.bonus, this.turnStartValue);
		} else {
			// Increment adds time at the end of your turn
			timeLeft = base;
		}
	} else {
		timeLeft = this.turnStartValue;
	}
	
	return Math.max(timeLeft, 0);
}
// Sometimes it is useful to know the delay
GameClock.prototype.getDelay = function() {
	if (this.type === "delay") {
		return Math.max(0, this.bonus - (Date.now() - this.started) / 1000);
	}
}
// Sends information in a format the client wants
GameClock.prototype.getClientData = function() {
	return {
		username: this.username,
		running: this.running,
		timeLeft: this.getTimeLeft(),
		delayLeft: this.getDelay(),
		
		type: this.type,
		bonus: this.bonus
	};
}
// Registers a function to call when the timer ends.
GameClock.prototype.addListener = function(fn) {
	if (typeof fn === "function") {
		this.events.push(fn);
	} else {
		throw new TypeError("[GameClock.addListener] Argument passed is not a function");
	}
}

module.exports = GameClock;