(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["/tutorial-set-[request]"],{

/***/ "./scripts/tutorials/advancedTutorials.js":
/*!************************************************!*\
  !*** ./scripts/tutorials/advancedTutorials.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tutorialConstructor.js */ "./scripts/tutorials/tutorialConstructor.js");
// advancedTutorials.js
//
// Some more advanced tutorials.
// Here I include more advanced defenses and the "move two larges" direct assault strategy.
//
// Spoiler alert...





const tutorialList = [
	// Direct Assault version 2
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "direct-assault-2",
		title: "Direct Assault 2.0",
		startMap: {
			"b1A": {"at": 6, "owner": "enemy"},
			"b1B": {"at": 1, "owner": null},
			"b1C": {"at": 5, "owner": "you"},
			"b2A": null,
			"b2B": null,
			"b2C": {"at": 6, "owner": null},
			"b3A": {"at": 5, "owner": "you"},
			"b3B": {"at": 3, "owner": null},
			"b3C": {"at": 2, "owner": "enemy"},

			"g1A": {"at": 3, "owner": "you"},
			"g1B": null,
			"g1C": {"at": 6, "owner": "enemy"},
			"g2A": {"at": 1, "owner": null},
			"g2B": {"at": 6, "owner": "enemy"},
			"g2C": {"at": 5, "owner": null},
			"g3A": {"at": 3, "owner": "you"},
			"g3B": {"at": 7, "owner": null},
			"g3C": {"at": 2, "owner": null},

			"r1A": {"at": 5, "owner": "you"},
			"r1B": null,
			"r1C": {"at": 2, "owner": "enemy"},
			"r2A": null,
			"r2B": {"at": 1, "owner": "you"},
			"r2C": {"at": 5, "owner": "you"},
			"r3A": null,
			"r3B": null,
			"r3C": null,

			"y1A": {"at": 3, "owner": "you"},
			"y1B": {"at": 1, "owner": "you"},
			"y1C": {"at": 2, "owner": null},
			"y2A": null,
			"y2B": {"at": 6, "owner": "enemy"},
			"y2C": {"at": 7, "owner": "enemy"},
			"y3A": null,
			"y3B": {"at": 1, "owner": "you"},
			"y3C": null,
		},
		steps: [
			{
				startMessages: [
					"I don't think my earlier Direct Assault tutorial did the concept justice.",
					"You may be thinking that if you just have a large and a red, you're safe from direct assaults. But there are more tricky versions of that tactic...",
					"Here, your opponent has a single small red. What would happen if you moved *two* large ships into their homeworld at once?",
					"(If you get stuck, there's still the Reset Turn button.)",
				],
				objective: "Get two large ships in the enemy homeworld at once",
				hint: "How many moves do you need? (The turn may look dangerous, but make it anyway.)",
				checkAction: function(action, oldState) {
					// for the advanced tutorials I just let anything happen and check in endTurn()
					return [true];
				},
				checkEndTurn: function(oldState) {
					const pieces = oldState.getAllPiecesAtSystem(2);
					let yourShips = 0;
					let yourLarges = 0;
					let shipToSteal = null;
					// count the number of larges and number of total ships (for feedback)
					for (let i = 0; i < pieces.length; i++) {
						if (pieces[i].owner === "you") {
							yourShips++;
							// and if it's a large, increment that tally as well
							if (pieces[i].serial[1] === "3") {
								yourLarges++;
								shipToSteal = pieces[i].serial;
							}
						}
					}
					
					if (yourLarges >= 2) {
						return [true, "Great. Now let's see what they do...", {
							type: "steal",
							oldPiece: shipToSteal,
						}];
					} else if (yourLarges === 1) {
						if (yourShips >= 2) {
							return [false, [
								"Hmmm... looks like you got two ships in, but only one of them is large.",
								"When your opponent attacks the first large, you won't be strong enough to strike back...",
								"How about you Reset Turn and try to get two *large* ships in?",
							]];
						} else {
							return [false, [
								"Hmmm... You haven't failed, you just found a way to only get one ship in. Can you get two large ships in?",
							]];
						}
					} else {
						return [false, "Hmmm... in order to take over the enemy homeworld, we need *large* ships (to defeat the large blue)."];
					}
				},
			},
			{
				startMessages: [
					"Notice they only have a small red, so they can only do one capture.",
					"But YOU have a medium red (actually two), so you can sacrifice it for 2 captures!",
				],
				hint: "You have to sacrifice a medium to get 2 actions.",
				checkAction: function(action, oldState) {
					return [true];
				},
				checkEndTurn: function(oldState) {
					// did you steal the red?
					if (oldState.map.r1C.owner === "you") {
						return [true, "Very clever! You've left them unable to fight back. Your opponent resigns!"];
					}
					
					// otherwise, count to see what you did
					const pieces = oldState.getAllPiecesAtSystem(2);
					let enemyLarges = 0;
					// count the number of larges and number of total ships (for feedback)
					for (let i = 0; i < pieces.length; i++) {
						if (pieces[i].owner === "enemy" && pieces[i].serial[1] === 3) {
							enemyLarges++;
						}
					}
					
					if (enemyLarges >= 2) {
						return [false, "Hmmm... they still have three ships, so don't end your turn yet! (Reset Turn if you need to)"];
					} else if (enemyLarges === 1) {
						return [false, "Hmmm... you stole one of their ships, but they're going to keep fighting. Try again, and see if you can capture BOTH large ships at once."];
					} else {
						return [true, "Great job! With only a small left, all they can do is delay. Your opponent resigns!"];
					}
				},
			}
		],
		endMessages: [
			"So yeah. I guess always have a medium red if you can (although a large is better, so they don't send 3 ships).",
			"And make sure that large red isn't the sole large defending your homeworld -- you can't have your ship and sacrifice it too!",
			"I guess the real lesson is: have as much red as you can store safely!",
			"(Yeah, I know. All colors are important. It's hard to get everything. Hey, it's a strategy game...)",
		],
	}),
	
	// Star Demolition version 2
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "star-catastrophe-2",
		title: "Star Demolition 2.0",
		subtitle: "Slow and steady",
		startMap: {
			"b1A": {"at": 2, "owner": "enemy"},
			"b1B": {"at": 8, "owner": "you"},
			"b1C": {"at": 2, "owner": null},
			"b2A": null,
			"b2B": {"at": 8, "owner": "you"},
			"b2C": null,
			"b3A": {"at": 11, "owner": "enemy"},
			"b3B": {"at": 7, "owner": null},
			"b3C": {"at": 1, "owner": null},

			"g1A": {"at": 9, "owner": null},
			"g1B": {"at": 10, "owner": "enemy"},
			"g1C": {"at": 10, "owner": "enemy"},
			"g2A": {"at": 1, "owner": null},
			"g2B": {"at": 7, "owner": "you"},
			"g2C": {"at": 14, "owner": null},
			"g3A": {"at": 8, "owner": null},
			"g3B": {"at": 12, "owner": "enemy"},
			"g3C": {"at": 2, "owner": "enemy"},

			"r1A": {"at": 11, "owner": "enemy"},
			"r1B": {"at": 10, "owner": "enemy"},
			"r1C": {"at": 11, "owner": "enemy"},
			"r2A": {"at": 14, "owner": "you"},
			"r2B": {"at": 14, "owner": "you"},
			"r2C": {"at": 10, "owner": "enemy"},
			"r3A": {"at": 2, "owner": "enemy"},
			"r3B": {"at": 8, "owner": "you"},
			"r3C": {"at": 1, "owner": "you"},

			"y1A": {"at": 8, "owner": "you"},
			"y1B": {"at": 9, "owner": "enemy"},
			"y1C": {"at": 12, "owner": null},
			"y2A": {"at": 7, "owner": "you"},
			"y2B": {"at": 11, "owner": null},
			"y2C": {"at": 2, "owner": null},
			"y3A": {"at": 7, "owner": "you"},
			"y3B": {"at": 10, "owner": null},
			"y3C": {"at": 9, "owner": "enemy"},
		},
		steps: [
			{
				startMessages: [
					"Sorry for the messy map...",
					"...and I know you can't see all of it because of this popup, but...",
					"OK, so it's a Star Demolition. But you only have two blues and three yellows!",
					"But wait... I spy a blue ship hanging out in their homeworld. If you could get two more, that would make 4 for a catastrophe!",
					"...oh wait. If you sacrifice yellow, you won't have enough yellows left for the other star...",
					"...You could try yellow first, but again, you only have three...",
					"...",
					"What if... you just moved your blue ships in one at a time?",
				],
				hint: "You don't want to sacrifice yellow (or anything, for that matter), because you'll need them.",
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice") {
						return [false, "You don't want to sacrifice anything here. You need all the ships you have!"];
					} else if (action.type === "build") {
						return [false, [
							"Ooh, interesting, trying to get more ammo?",
							"Sadly, that's not going to work here because you'll have 3 blue ships there...",
							"...and your opponent will just move their small blue in and cause a catastrophe!",
						]];
					} else if (action.type === "trade") {
						return [false, [
							"Hmmm... trying to get more ammo, eh?",
							"You have two blue ships at that system, though...",
							"Your opponent would probably sacrifice their large yellow and send their own two blues in. This will wipe out all your ships there.",
							"Including *your* large yellow.",
							"Let's try just moving one of your own blue ships into the enemy homeworld.",
						]];
					} else if (action.type === "move" && action.system === 2) {
						if (action.oldPiece[0] === "b") {
							// yay!
							return [true];
						} else {
							return [false, "Oh, almost! Can you move a *blue* ship? Then you'll be one away from a blue catastrophe in their homeworld."];
						}
					} else {
						// the only possibility left is a move or discovery that isn't into the homeworld
						return [false, "Where are you going with that? We want to invade the enemy's homeworld!"];
					}
				},
				checkEndTurn: function(oldState) {
					// since I verified it in checkAction
					if (oldState.actions.number > 0) {
						return [false, "Don't end your turn now, you still have work to do!"];
					}
					
					return [true, "Three isn't enough for a catastrophe, but you can move the other one in next turn, right?", {
						// this is a bad move but it's instructive
						type: "move",
						oldPiece: "b1A",
						system: 10, // moving to system 7 might actually stop the attack
					}];
				},
			},
			{
				startMessages: [
					"Oh, no! They moved their blue out! Now you don't have enough blues for the catastrophe...",
					"But wait. There are two blues in the bank. You could build some.",
					"In fact... you could even build th3mmm|$y^Q5}/...\n\n[SIGNAL LOST]",
					"",
					"",
					"Just so you know, your homeworld is a little vulnerable, so don't take *too* long.",
				],
				hint: "It's possible to destroy the blue star this turn. I'm not going to tell you how, though... seeing stuff on your own is an important skill!",
				checkAction: function(action, oldState) {
					if (action.type === "catastrophe") {
						return [true];
					} else if (action.type === "build") {
						if (action.system === 2) {
							return [true];
						} else {
							return [false, "That probably works, but building now and moving later uses up a lot of time. Can you blow up their blue star *this turn*?"];
						}
					} else if (action.type === "sacrifice") {
						if (action.oldPiece[0] === "g") {
							return [true];
						} else {
							return [false, "Oh, you don't want to sacrifice that, because you'll need it later! You only have three yellows!"];
						}
					} else if (action.type === "move") {
						if (action.oldPiece[0] === "g") {
							return [false, "Ooh, almost! That won't quite work because the ship would just be captured. But you're on the right track with that green..."];
						} else {
							return [false, "Hmmm... That could work, but it's rather slow. Can you blow up their blue star *this turn*?"];
						}
					} else if (action.type === "discover") {
						return [false, "Uhhh... where are you going with that? Did you mis-click?"];
					} else if (action.type === "trade") {
						return [false, "Interesting try, but your opponent still has enough moves to blow up system #7 if they sacrifice their large yellow."];
					} else {
						return [false, "I'm not entirely sure what you did... did you mis-click?"];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.isSystemOverpopulated('b', 2)) {
						return [false, "You have to trigger the catastrophe first!"];
					}
					
					if (oldState.actions.number > 0) {
						return [false, "You haven't completed all your actions yet, so don't end your turn!"];
					}
					
					if (oldState.map.b1C) { // b1C is the blue star
						return [false, "Hmmm... Time isn't on your side here. Can you think of a way to destroy their home star in one turn? (Reset Turn if you need to)"];
					}
					
					return [true, "There you go! Green sacrifice for the win! (But you're only halfway there.)", {
						type: "move",
						oldPiece: "r1A",
						system: 12,
					}];
				},
			},
			{
				startMessages: [
					"Uh oh, things are getting tense...",
					"So about that yellow star...",
					"You have three yellow ships, and one of them is large.",
					"But unfortunately, you can't have your ship and sacrifice it too!",
					"...",
					"I'll let you in on a little secret...",
					"With three ships, you CAN move them one at a time... but there's a trick.",
					"The *SECOND* ship has to be the large one.",
					"Wait... why? Well, move your small or medium yellow in now (or click the Hint if you really want to know now)...",
				],
				hint: [
					"You want to know the reason? Here you go.",
					"(1) You move your small (or medium) yellow in now. Opponent captures it.",
					"(2) You move your large yellow in. Opponent *wants* to move the first yellow out (like they did with the blue), but if they do, you sacrifice a red and capture all their ships.",
					"(2, cont.) So they steal your large yellow. This means both yellows are still inside.",
					"(3) Finally, you move your last yellow in. That's 4 (3 ships + 1 star). Call catastrophe. You win!",
					"Want to see that in action? Let's do it!",
				],
				checkAction: function(action, oldState) {
					if (action.type === "move") {
						if (action.system !== 2) {
							return [false, "You want to move into the enemy's homeworld. Did you mis-click?"];
						} else if (action.oldPiece[0] !== "y") {
							return [false, "You want to move YELLOW pieces into their homeworld, because yellow is their star color."];
						} else if (action.oldPiece[1] === "3") {
							return [false, "You don't want to move your large yet, for reasons you'll see next turn..."];
						} else {
							return [true];
						}
					} else if (action.type === "sacrifice") {
						return [false, "You don't want to sacrifice anything, because you need all three of your yellows!"];
					} else {
						return [false, "In order to win, you're going to have to move ships in to the enemy homeworld."];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "Don't end your turn yet. You still have work to do!"];
					}
					
					// get your yellow ship
					let yourShip = null;
					const pieces = oldState.getAllPiecesAtSystem(2);
					for (let i = 0; i < pieces.length; i++) {
						if (pieces[i].owner === "you") {
							yourShip = pieces[i].serial;
							break;
						}
					}
					
					return [true, "Hmmm... Let's see, will your opponent press their own attack or respond to your threat?", {
						type: "steal",
						oldPiece: yourShip,
					}];
				},
			},
			{
				startMessages: [
					"Hmmm... so they're playing defense.",
					"This is good, because now we learn why you need to move the large in second.",
					"You see, after you move, your opponent would like to move the first yellow out...",
					"...but if you invade with a large now, and they do that, you'll be able to sacrifice red and do a Direct Assault!",
					"Or, if they capture the large yellow, you just move your third and final ship in and call catastrophe!",
					"So... let's send in the large yellow!",
				],
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice") {
						return [false, "You don't need to sacrifice anything. Just move the large yellow in directly!"];
					} else if (action.type === "move") {
						if (action.oldPiece[0] !== "y") {
							return [false, "You need to move the large YELLOW ship, in order to cause a yellow catastrophe and destroy the star."];
						} else if (action.oldPiece[1] !== "3") {
							return [false, "You need to move the LARGE yellow ship, because that threatens to win by Direct Assault."];
						} else if (action.system !== 2) {
							return [false, "Where are you going? (did you mis-click?) You need to invade the enemy's homeworld... and do it soon..."];
						} else {
							return [true];
						}
					} else {
						return [false, "Now is not the time to " + action.type + "... you only have two yellow ships left and your homeworld is weak. Strike while the iron is hot!"]
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything yet, so it's not time to end your turn!"];
					}
					// find their yellow
					const pieces = oldState.getAllPiecesAtSystem(2);
					let theirYellow = null;
					for (let i = 0; i < pieces.length; i++) {
						// must be a yellow owned by the enemy
						if (pieces[i].serial[0] === 'y' && pieces[i].owner === "enemy") {
							theirYellow = pieces[i].serial;
						}
					}
					
					let response = [true, "Good. See the double threat? For example, if your opponent tries to leave now...", {
						type: "sacrifice",
						oldPiece: theirYellow,
					}, {
						type: "move",
						oldPiece: "r1B",
						system: 9,
					}];
					// is it a medium?
					if (theirYellow[1] === "2") {
						response.push({
							type: "move",
							oldPiece: "r1C",
							system: 12,
						});
					}
					return response;
				},
			},
			{
				startMessages: [
					"So... It looks like you don't get to do a Star Demolition after all!",
					"And your opponent is lining up more and more reds against your home...",
					"Fortunately, you can win this turn anyway.",
					"Just don't abandon your own homeworld!",
				],
				objective: "Win the game this turn.",
				hint: [
					"It does not involve a yellow catastrophe. What other ways are there to win?",
				],
				checkAction: function(action) {
					if (action.type === "sacrifice") {
						if (action.oldPiece === "r3C") {
							return [false, "If you abandon your homeworld AND destroy the enemy, it's a draw. Can you win?"];
						} else if (action.oldPiece[0] !== "r") {
							return [false, "Ah, you see, you need to sacrifice a *RED* ship here, in order to capture the enemy ships."];
						} else {
							return [true]; // you don't have small reds and a medium is enough
						}
					} else if (action.type === "move") {
						return [false, "With the other yellow gone, you don't have enough yellows for a catastrophe. Are there other ways to win?"];
					} else if (action.type === "steal") {
						return [true];
					} else if (action.type === "trade" && action.oldPiece === "r3C") {
						return [false, "Yes, that does neutralize the threat, but your Y3 will get captured and you will have six ships against 14. Can you win this turn?"]
					} else {
						return [false, "That's possible, but the situation is sort of urgent. Can you win this turn?"];
					}
				},
				checkEndTurn: function(oldState) {
					const enemySurvived = (
						(oldState.map.r3A && oldState.map.r3A.owner !== "you") ||
						(oldState.map.g3C && oldState.map.g3C.owner !== "you")
					);
					if (enemySurvived) {
						if (oldState.actions.number > 0) {
							return [false, "You're not quite done yet. Don't end your turn!"];
						} else {
							return [false, "Hmmm... looks like you ran out of ammo. Let's try again."];
						}
					} else {
						return [true];
					}
				},
			},
		],
		endMessages: [
			"Wow...",
			"That was a lot to take in.",
			"And it ended with you winning by direct assault instead!",
			"Of course, I had to program sub-optimal moves for instructive value, but the opponent could have definitely put up more resistance.",
			// I do a find-and-replace to change s-o-u-t-h into "you" when the maps come out of the sandbox
			"In fact, they maybe could have gotten you first with better play, so don't share this as \"sou" + "th to play and win in 5 turns\" because it likely isn't.",
			"The important thing is that you don't need 2 large yellows plus 6 more ships to win, IF you have the right set of circumstances.",
			"In fact, the very next tutorial shows how this can sometimes go wrong...",
		],
	}),
	
	// Sacrifice a red to attack to avert a red catastrophe
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "red-defense",
		title: "Star Demolition Defense",
		startMap: {
			"b1A": null,
			"b1B": {"at": 2, "owner": null},
			"b1C": null,
			"b2A": {"at": 3, "owner": "you"},
			"b2B": null,
			"b2C": null,
			"b3A": null,
			"b3B": {"at": 10, "owner": null},
			"b3C": null,

			"g1A": null,
			"g1B": {"at": 2, "owner": "enemy"},
			"g1C": {"at": 3, "owner": null},
			"g2A": {"at": 10, "owner": "enemy"},
			"g2B": null,
			"g2C": null,
			"g3A": {"at": 9, "owner": null},
			"g3B": {"at": 7, "owner": "enemy"},
			"g3C": null,

			"r1A": {"at": 1, "owner": "enemy"},
			"r1B": null,
			"r1C": {"at": 7, "owner": "enemy"},
			"r2A": {"at": 9, "owner": "you"},
			"r2B": null,
			"r2C": {"at": 1, "owner": null},
			"r3A": {"at": 10, "owner": "enemy"},
			"r3B": {"at": 3, "owner": "you"},
			"r3C": {"at": 2, "owner": "enemy"},

			"y1A": {"at": 1, "owner": "you"},
			"y1B": {"at": 10, "owner": "enemy"},
			"y1C": {"at": 7, "owner": null},
			"y2A": {"at": 9, "owner": "you"},
			"y2B": {"at": 3, "owner": "you"},
			"y2C": {"at": 2, "owner": null},
			"y3A": {"at": 1, "owner": "you"},
			"y3B": {"at": 3, "owner": "you"},
			"y3C": {"at": 9, "owner": "you"},
		},
		steps: [
			{
				startMessages: [
					"I hope you've played the Star Demolition 2.0 tutorial already -- there's several important themes there.",
					"So you're not always going to be on the offensive, of course.",
					"This situation you're about to see looks a little bleak. You've already lost half of your homeworld.",
					"Worse yet, your opponent has several reds ripe for invasion...",
					"Fortunately, you have all the medium and large yellows.",
					"If you remember the previous module, they're about to send their large ship into your homeworld.",
					"But there's one way you can survive. Can you find it?",
				],
				objective: "How do you survive this?",
				hint: [
					"Process of elimination might help here. What can you absolutely not afford to let happen?",
					"Keep in mind that your opponent is planning to move in the large red (from their blue star) next turn.",
				],
				checkAction: function(action, oldState) {
					// I don't want to have to deal with this
					if (action.type === "move" && action.system === 2) {
						return [false, [
							"Hmmm... Counter-attacking like that doesn't quite work here. Your opponent can just sacrifice their other large red and steal everything.",
							"(I'm only blocking this move to save myself some effort. You'll have to see what happens to other wrong moves...)",
						]];
					}
					return [true];
				},
				checkEndTurn: function(oldState) {
					// If there is a Y2 or Y3 for building...
					
					// If they still control the invader red and at least one red exists in the stash...
					if (oldState.map.r1A && oldState.map.r1A.owner === "enemy") {
						let redsInStash = [];
						for (let serial in oldState.map) {
							if (serial[0] === "r" && !oldState.map[serial]) {
								redsInStash.push(serial);
							}
						}
						
						redsInStash.sort(); // put them in order of size
						if (redsInStash.length >= 2) {
							// you lose
							return [true, "Hmmm... There seems to be a slight problem with that...",
								{
									type: "sacrifice",
									oldPiece: "g2A",
								},
								{
									type: "build",
									newPiece: redsInStash[0],
									system: 1,
								},
								{
									type: "build",
									newPiece: redsInStash[1],
									system: 1,
								},
								{
									type: "catastrophe",
									color: "r",
									system: 1,
								},
							];
						}
						// else fall through to below
					}
					
					return [true, "All right, let's see if that worked...", {
						type: "move",
						oldPiece: "r3A",
						system: 1,
					}];
					
				},
				nextStep: function(newState) {
					if (newState.map.r2C === null) {
						return "loss";
					} else {
						return 1;
					}
				},
			},
			{
				startMessages: [
					"OK...",
					"Let's see if that worked...",
					"If you planned correctly, you should be able to survive...",
					"I'm not going to tell you if your previous turn was correct...",
					"You can Restart if you think you failed (it's above the map)...",
					"And maybe I'll stop ending my sentences with three dots?"
				],
				objective: "Survive, if you can.",
				hint: [
					"",
					"If you need to, you can click the orange Restart button (upper left, above the map) to start over.",
				],
				checkAction: function(action, oldState) {
					return [true];
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					// can they win by catastrophe?
					let enemyActions = [];
					let yellowCatastrophe = false;
					if (oldState.isSystemOverpopulated('y', 1)) {
						yellowCatastrophe = true;
						enemyActions.push({
							type: "catastrophe",
							color: "y",
							system: 1
						});
					}
					if (oldState.map.r3A && oldState.map.r3A.owner === "enemy") {
						enemyActions.push({
							type: "sacrifice",
							oldPiece: "r3A",
						});
						
						// it's possible that you have more than 3 ships at home
						let captures = 0;
						for (let serial in oldState.map) {
							const data = oldState.map[serial];
							// if it exists, is yours, at your HW, and it's not yellow if there was a catastrophe
							if (data && data.owner === "you" && data.system === 1 && !(yellowCatastrophe && serial[0] === 'y')) {
								// it's in your homeworld so steal it
								enemyActions.push({
									type: "steal",
									oldPiece: serial,
								});
								captures++;
							}
							
							// don't capture 4 ships
							if (captures >= 3) {
								break;
							}
						}
					} else if (oldState.map.r1C && oldState.map.r1C.owner === "enemy") {
						// spoiler alert: in the correct solution, the catastrophe doesn't happen
						enemyActions.push({
							type: "move",
							oldPiece: "r1C",
							system: 1,
						});
						if (oldState.map.r1A && oldState.map.r1A.at === 1) {
							enemyActions.push({
								type: "catastrophe",
								system: 1,
								color: 'r',
							});
						}
					} else {
						// the enemy is confused!
						return [true, [
							"The enemy is confused!",
							"This is a bug in the tutorial. I'm not sure if you defended correctly or not, but this message shouldn't be possible."
						]];
					}
					
					// no messages!
					return [true, []].concat(enemyActions);
				},
				nextStep: function(newState) {
					// if they sacrificed the R3 or you lost your home star, you lost
					if (!newState.map.r3C || !newState.map.r2C) {
						return "loss";
					} else {
						return 1;
					}
				},
			},
			
			{
				startMessages: [
					"If you got here, then you almost certainly survived...",
					"Maybe take care of that other invader ship while you're at it.",
				],
				objective: "Thwart the opponent's last threat",
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice" && action.oldPiece === "r3A") {
						return [false, "You don't need to do that this time. The only other enemy red left isn't connected to your homeworld. Keep your material advantage!"];
					}
					return [true];
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					if (oldState.map.r1C && oldState.map.r1C.owner === "enemy") {
						return [false, "Hmmm... If you leave that ship there, your opponent can still sacrifice a green! (Reset Turn if needed)"];
					}
					if (!oldState.map.r2C || oldState.isSystemOverpopulated('r', 1)) {
						return [false, "Not sure how you almost managed to self-destruct... Maybe try again. (Reset Turn if needed)"];
					}
					return [true];
				},
				nextStep: function() {
					// skip over the loss phase
					return Infinity;
				},
			},
			
			
			// if you fail
			{
				id: "loss",
				startMessages: [
					"It looks like you've found one (more?) way not to win this.",
					"Good job, that's one less possibility for the real solution...",
					"You can examine what happened and then click Restart above the map to try again.",
				],
				objective: "Click Restart ^^",
				checkAction: function() {
					return [false];
				},
				checkEndTurn: function() {
					return [false];
				},
			}
		],
		endMessages: [
			"Well done. You have survived and have superior mobility! If you can prevent the opponent from building red, you'll probably win.",
			"Some people have called this trick the \"red ram\", imagining the sacrificed red as a battering ram against the invaders...",
		],
	}),
	
	/*
	// Sacrifice a yellow to come back home
	new Tutorial({
		title: "Sacrifice Defense 2: Yellow",
		subtitle: "...or not?",
		startMap: {},
		steps: [
			{
				startMessages: [
					"So you're not always going to be on the offensive, of course.",
					"Four of the five offensive modules have been crushing wins for you with no "
				],
			}
		],
		endMessages: [
			
		],
	}),
	
	
	*/
];
/* harmony default export */ __webpack_exports__["default"] = ({
	title: "Advanced Tutorials",
	description: "Here you will learn some more advanced stuff. Right now I have more complicated versions of the Direct Assault and Star Demolition techniques.",
	list: tutorialList,
});

/***/ }),

/***/ "./scripts/tutorials/basicTutorials.js":
/*!*********************************************!*\
  !*** ./scripts/tutorials/basicTutorials.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tutorialConstructor.js */ "./scripts/tutorials/tutorialConstructor.js");
// basicTutorials.js
//
// the hope is that we don't load the entire thing at once
// but only load the modules the user actually might play




/*
const template = {
			b1A: null,
			b1B: null,
			b1C: null,
			b2A: null,
			b2B: null,
			b2C: null,
			b3A: null,
			b3B: null,
			b3C: null,
			
			g1A: null,
			g1B: null,
			g1C: null,
			g2A: null,
			g2B: null,
			g2C: null,
			g3A: null,
			g3B: null,
			g3C: null,
			
			r1A: null,
			r1B: null,
			r1C: null,
			r2A: null,
			r2B: null,
			r2C: null,
			r3A: null,
			r3B: null,
			r3C: null,
			
			y1A: null,
			y1B: null,
			y1C: null,
			y2A: null,
			y2B: null,
			y2C: null,
			y3A: null,
			y3B: null,
			y3C: null,
};
*/

const tutorialList = [
	// Building
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "build",
		title: "Building Ships",
		disableWarnings: true,
		startMap: {
			"b1A": null,
			"b1B": null,
			"b1C": null,
			"b2A": null,
			"b2B": null,
			"b2C": null,
			"b3A": null,
			"b3B": null,
			"b3C": {"at": 5, "owner": null},

			"g1A": {"at": 3, "owner": "you"},
			"g1B": {"at": 5, "owner": "enemy"},
			"g1C": null,
			"g2A": null,
			"g2B": {"at": 4, "owner": null},
			"g2C": {"at": 2, "owner": null},
			"g3A": null,
			"g3B": null,
			"g3C": {"at": 1, "owner": "you"},

			"r1A": {"at": 4, "owner": "you"},
			"r1B": null,
			"r1C": null,
			"r2A": null,
			"r2B": null,
			"r2C": {"at": 3, "owner": null},
			"r3A": null,
			"r3B": {"at": 2, "owner": "enemy"},
			"r3C": {"at": 1, "owner": null},

			"y1A": null,
			"y1B": null,
			"y1C": null,
			"y2A": null,
			"y2B": null,
			"y2C": null,
			"y3A": null,
			"y3B": null,
			"y3C": null,
		},
		steps: [
			{
				startMessages: [
					"Welcome to the Homeworlds Tutorial! Here I will walk you through the fundamentals of gameplay. Please note you will have to learn by *doing*, so pay attention.",
					"Homeworlds is typically played on a tabletop with colorful pyramids which represent stars (when vertical) or starships (when lying down, pointing away from the owner).",
					"On this web version, ships are triangles and stars are squares.",
					"Your ships are pointing \"away from you\", which here means upward. Enemy ships point down. (Color has meaning, but it's something different.)",
					"The star and all ships next to it are called a star system. Systems are separated by empty space, so there are 5 star systems in this scenario (you probably can't see them all yet).",
					"The goal of the game is to destroy or conquer your opponent's homeworld. You do this by building starships and colonizing new systems until you can destroy their stars or ships.",
					"Let's begin with building. Click one of the ships pointing upwards, and then click the \"Build XX here\" button to create a new ship.",
					"If you get stuck, there is Show Intro (which displays these messages again) and Show Hint in the upper right.",
				],
				objective: "Build a ship (you should have four total afterward)",
				hint: [
					"Your ships are the three triangles on the bottom half of the screen.",
					"If you have four, you have already built; just click End Turn.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice") {
						return [false, "I'll get to sacrificing later. For now let's concentrate on building ships."];
					}
					const abbr = action.newPiece[0].toUpperCase();
					const color = (abbr === "R" ? "red" : "green");
					return [true, [
						"Good job. Did you notice how it automatically gave you a small " + color + " ship at the same star?",
						"You may have also noticed the " + abbr + "1 thing on the button. The " + abbr + " part is for " + color + ", and the 1 is for small (they come in 3 sizes). Similarly, B2 would be a medium blue, and so on.",
						"Anyway, your turn is over now. Click the green End Turn button on the lower right to continue. (You can also Reset Turn, if you want to change your mind.)",
					]];
				},
				checkEndTurn: function(oldState) {
					// make sure you used your build action
					if (oldState.actions.number > 0) {
						return [false, "Don't end your turn yet! Build a new ship first!"];
					} else {
						return [true, "All right. Now it's your opponent's turn. They are probably going to build something too...", {
							type: "build",
							// get an available R1
							newPiece: oldState.getPieceInStashByType("r1"),
							system: 2,
						}]
					}
				},
			},
			// introduce Bank
			{
				startMessages: [
					"They built a small red ship of their own!\nThis is actually interesting...",
					"If you look at the Bank on the right, you will see that there are three of each piece total (some are on the board).",
					"This actually means that there is a limited supply of pieces. Homeworlds may be a war, but it's a very *economic* war, complete with supply and investments and exchanges. (We'll get to most of that later.)",
					"Anyway, when you build, there are two main rules:\n" +
						"(1) You can only build a ship of the *same color* as a ship you already have at that star, and\n" +
						"(2) You can only build the smallest *available* piece (i.e. in the Bank) of any given color.",
					"It's important to note that you do NOT \"grow\" a ship. You only get bigger ones by building them directly, when the Bank is out of smaller pieces of that color.",
					"Given this, your challenge is to build a medium ship (two pips)!\n(Again, hint button is on the top right)",
				],
				hint: [
					"Look at the Bank. Which color does not have smalls available?",
					"Remember you have to click an existing ship of yours first to build.",
				],
				checkAction: function(action, oldState) {
					if (action.type !== "build") {
						return [false, "I'll get to sacrificing in a later module."];
					}
					if (action.newPiece[1] !== "2") {
						return [false, "Unfortunately, building that color only gives you a small ship, because there is one in the Bank. See if you can build a medium (size-2) ship."];
					}
					return [true, "Remember to end your turn every time..."];
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "Don't end your turn yet!"];
					} else {
						return [true, "Good job. Let's see now what your opponent does...", {
							type: "trade",
							oldPiece: "g1B",
							newPiece: "y1C",
						}];
					}
				}
			}
		],
		endMessages: [
			"What was that? Their ship just changed color!",
			"That's a subject for another module. Click the green \"Next Module\" button at the top to continue!",
		],
	}),
	
	// Trading
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "trade",
		title: "Trading Ships",
		disableWarnings: true,
		startMap: {
			"b1A": {"at": 6, "owner": "you"},
			"b1B": {"at": 3, "owner": null},
			"b1C": {"at": 2, "owner": null},
			"b2A": null,
			"b2B": null,
			"b2C": {"at": 6, "owner": "you"},
			"b3A": null,
			"b3B": {"at": 5, "owner": null},
			"b3C": {"at": 1, "owner": null},

			"g1A": {"at": 3, "owner": "you"},
			"g1B": {"at": 6, "owner": null},
			"g1C": {"at": 5, "owner": "enemy"},
			"g2A": {"at": 9, "owner": "enemy"},
			"g2B": {"at": 1, "owner": "you"},
			"g2C": {"at": 2, "owner": null},
			"g3A": {"at": 9, "owner": "enemy"},
			"g3B": {"at": 4, "owner": null},
			"g3C": {"at": 1, "owner": "you"},

			"r1A": {"at": 2, "owner": "enemy"},
			"r1B": {"at": 9, "owner": null},
			"r1C": {"at": 8, "owner": "enemy"},
			"r2A": null,
			"r2B": null,
			"r2C": {"at": 1, "owner": null},
			"r3A": null,
			"r3B": null,
			"r3C": null,

			"y1A": {"at": 4, "owner": "enemy"},
			"y1B": {"at": 2, "owner": "enemy"},
			"y1C": {"at": 5, "owner": "enemy"},
			"y2A": {"at": 5, "owner": "enemy"},
			"y2B": {"at": 4, "owner": "enemy"},
			"y2C": {"at": 7, "owner": "enemy"},
			"y3A": {"at": 8, "owner": null},
			"y3B": {"at": 7, "owner": null},
			"y3C": {"at": 2, "owner": "enemy"},
		},
		steps: [
			{
				startMessages: [
					"Building ships is important, but you can only build colors you already have. The next ability, trading, allows you to change colors of your ships.",
					"When you trade, you first click on one of your ships, then click a piece from the Bank *of the same size*.",
					"This is nice because once you build medium and large ships of one color, you can change them into other colors!",
					"But remember, the piece has to be available in the Bank! Your options will be highlighted when you are deciding.",
					"All right. Your goal this turn is to use a trade to get a red ship. Again, use the hint button (top) for help!",
				],
				hint: [
					"You can only trade equal sizes (small for small, medium for medium, or large for large).",
					"So what red sizes are available?",
				],
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						return [false, "That's ok, but this lesson is about trading. Can you trade to get a red ship?"];
					}
					if (action.type === "sacrifice") {
						return [false, "I will get to the sacrifice action! Let's focus on trading for now..."];
					}
					if (action.type === "trade") {
						if (action.newPiece[0] === "r") {
							return [true, "Great job! Remember to end your turn!"];
						} else {
							return [false, "Good trade. However, I would like you to see if you can get a RED ship."];
						}
					}
					return [false, "I'm not entirely sure what you did, but it doesn't look like a trade to me."];
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "Don't end your turn yet!"];
					}
					return [true, [
						"All right, you're doing great! Let's see what your opponent does..."
					], {
						type: "trade",
						oldPiece: "y2A",
						newPiece: oldState.getPieceInStashByType('r2'),
					}];
				},
			},
			{
				startMessages: [
					"It looks like they also traded for a red.",
					"Now that you have one red ship, you *could* build more.",
					"But notice something else. The opponent just traded away a yellow, so there is one in the Bank. Which means YOU can trade for it!",
					"Your challenge this turn: Obtain a yellow, but keep your red ship.",
				],
				objective: "Obtain a yellow ship (and also keep your red one)",
				hint: [
					"What size is the yellow in the Bank?\nYou want to trade something of that size.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "trade") {
						if (action.newPiece[0] === "y") {
							// you traded for a yellow
							// but did you give up your only red?
							if (action.oldPiece[0] === "r") {
								return [false, "That's great, except you just traded away your only red ship!\nCan you get a yellow WITHOUT losing your red?"];
							} else {
								return [true, "Good. From now on you won't always see a message after every single action. Just end your turn."];
							}
						} else {
							return [false, "Hmmm. Looks like you did a successful trade, but can you please specifically trade for a *yellow* ship?"]
						}
					} else if (action.type === "sacrifice") {
						return [false, "Patience! Sacrifices are a little tricky and I'll cover them later."];
					} else {
						return [false, "That's legal, but we're focusing on trading right now. Specifically, can you trade for a yellow ship?"]
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "Don't end your turn yet, because you haven't done anything!"];
					}
					// no message because this is the last slide
					return [true];
				}
			}
		],
		endMessages: [
			"There you go. You have ships of all four colors!",
			"That's great because then you can in theory build any color (although other factors may get in the way, like access to green for the build ability).",
			"Oh, did you notice two of the star systems had 2 stars instead of 1? Those are your homeworld and your opponent's homeworld! We'll see more about that in a bit.",
			"But first, we need to learn how to explore other stars!",
		],
	}),
	
	// Movement (and discovery)
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "move-discover",
		title: "Movement",
		disableWarnings: true,
		startMap: {
			"b1A": null,
			"b1B": null,
			"b1C": {"at": 1, "owner": null},
			"b2A": null,
			"b2B": null,
			"b2C": null,
			"b3A": null,
			"b3B": null,
			"b3C": {"at": 2, "owner": null},

			"g1A": null,
			"g1B": null,
			"g1C": {"at": 2, "owner": null},
			"g2A": null,
			"g2B": null,
			"g2C": null,
			"g3A": null,
			"g3B": {"at": 3, "owner": null},
			"g3C": {"at": 1, "owner": "you"},

			"r1A": null,
			"r1B": null,
			"r1C": null,
			"r2A": null,
			"r2B": null,
			"r2C": {"at": 1, "owner": null},
			"r3A": null,
			"r3B": null,
			"r3C": {"at": 2, "owner": "enemy"},

			"y1A": {"at": 2, "owner": "enemy"},
			"y1B": {"at": 2, "owner": "enemy"},
			"y1C": {"at": 3, "owner": "you"},
			"y2A": {"at": 3, "owner": "you"},
			"y2B": {"at": 2, "owner": "enemy"},
			"y2C": null,
			"y3A": null,
			"y3B": null,
			"y3C": null,
		},
		steps: [
			{
				startMessages: [
					"Ah, yellow. Probably the trickiest color in the game to get used to.",
					"Yellow is the color of movement. Now, the stars have sizes just like ships (they actually use the same pool of pieces). There's a simple, but perhaps unnatural, rule on how you can move between stars.",
					"You can move between two star systems if they have NO SIZES in common.",
					"For example, if your ships is at a Large system, you can move to any Small or Medium system, or a Small+Medium homeworld.",
					"But you can *NOT* move from a Large to another Large, nor to any homeworld that has a Large star.",
					"Now, this website tries to smartly arrange the stars in rows, to help you visualize the connections. Legal moves will also be highlighted. However, this is *only* a visual aid.",
					"Anyway, to do a move, click the ship, then click the \"move\" button, then click the system you want to move to.",
					"How about we get started with a simple move: Move one of your yellow ships to your homeworld (the system with two stars).",
				],
				bannedActions: {
					"discover": [
						"Moving and discovering are related, but different.",
						"We'll cover discovery next, but first let's do movement.",
					],
				},
				objective: "Move one of the yellow ships into your homeworld",
				hint: [
					"Your homeworld is the system that has 2 stars. (Actually, it's possible to lose a star, but that's a topic for much later.)",
				],
				checkAction: function(action, oldState) {
					if (action.type === "move") {
						return [true];
					} else if (action.type === "discover") {
						return [false, "You're getting ahead of me here! Can you first make sure you can move between two existing systems?"];
					} else {
						return [false, "That's all well and good, but we're doing movement now. Can you try moving to your homeworld?"];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "Whoops. Don't end your turn before you do anything..."];
					}
					return [true, [
						"By the way, if you click the wrong piece, just click the flashing ship again to cancel.",
						"Or use the Reset Turn at right to undo your whole turn. Both of those work in real games.",
						"Now, how do you find new stars? It's pretty simple...",
					], {
						type: "discover",
						oldPiece: "y1B",
						newPiece: "g2A",
					}];
				},
			},
			{
				startMessages: [
					"Oh neat, a new star just appeared on the map!",
					"In fact, you can \"discover\" a star when you move, instead of moving to an existing one. You may have figured this out already.",
					"To do this, click a piece in the Bank. Just like with normal movement, it must be a different size to the star you started in. (The STAR, not the ship.)",
					"Just like trades, the available pieces are highlighted when you are deciding and you can cancel by clicking the original ship again.",
					"(Note: Homeworld systems always start out with two stars. All other systems are single stars.)",
					"Now, your task is to discover a new system. You can use either yellow, but keep the large green home.",
				],
				objective: "Discover a new system",
				hint: [
					"First click the ship, then Move/Discover, then click a star in the Bank.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "discover") {
						if (action.oldPiece[1] === "3") {
							return [false, "Yep, that's it! However, as we'll see later, it's a good habit to keep your largest ship at your homeworld for defense.\n\nTry moving one of the yellow ships."];
						}
						return [true, "Good job. End your turn..."];
					} else {
						return [false, "That's legal, but I'd like you to discover a new star system instead."];
					}
				},
				checkEndTurn: function(oldState) {
					// oh dear
					// they may have discovered any kind of star...
					let newStar = null;
					for (let serial in oldState.map) {
						const data = oldState.map[serial];
						// the new system should be number 5
						if (data && data.owner === null && data.at === 5) {
							newStar = serial;
						}
					}
					
					if (newStar) {
						// If you discovered a medium, move move from the homeworld (which is y1A), otherwise move the existing y1B
						const message = newStar[1] === "2" ? [
							"Notice how the system is closer to your opponent's homeworld?",
							"That's because they are connected! Their home is a Small+Large, so it's connected to Medium systems (the only other size).",
							"(Note: The actual position of stars is ONLY a visual aid. The different-size rule is what matters.)",
						] : null;
						return [true, message, {
							type: "move",
							oldPiece: (newStar[1] === "2") ? "y1A" : "y1B",
							system: 5
						}];
					} else {
						return [false, "You forgot to discover a system, or else there is a bug. Please try again."];
					}
				}
			}
		],
		endMessages: [
			"There you go. If you find that unintuitive, the last module in the Basic collection is a \"playground\" where you can practice moving around.",
			"By the way, if you ever played chess, you probably used the terms \"move\" and \"turn\" interchangeably. In Homeworlds, however, \"move\" refers to specifically moving a ship to another system.",
			"Anyway, did you notice how the star system disappeared when it was abandoned? Stars get added to the map via discovery, and go back to the Bank when the last ship leaves.",
			"It may seem weird at first, but it's actually a very crucial part of how the game works.",
			"It can be used to manipulate the Bank. That's important enough to emphasize in another module...",
		],
	}),

	// Economic Intermission
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "economy",
		title: "It's the Economy, Captain!",
		disableWarnings: true,
		startMap: {
			"b1A": {"at": 3, "owner": "enemy"},
			"b1B": null,
			"b1C": {"at": 5, "owner": "enemy"},
			"b2A": {"at": 4, "owner": "you"},
			"b2B": {"at": 6, "owner": null},
			"b2C": {"at": 2, "owner": null},
			"b3A": null,
			"b3B": {"at": 7, "owner": null},
			"b3C": {"at": 1, "owner": null},

			"g1A": {"at": 5, "owner": "enemy"},
			"g1B": {"at": 6, "owner": "you"},
			"g1C": {"at": 7, "owner": "enemy"},
			"g2A": {"at": 4, "owner": null},
			"g2B": {"at": 6, "owner": "you"},
			"g2C": null,
			"g3A": {"at": 3, "owner": null},
			"g3B": {"at": 2, "owner": "enemy"},
			"g3C": {"at": 1, "owner": "you"},

			"r1A": null,
			"r1B": {"at": 4, "owner": "you"},
			"r1C": {"at": 1, "owner": null},
			"r2A": null,
			"r2B": null,
			"r2C": null,
			"r3A": null,
			"r3B": null,
			"r3C": null,

			"y1A": null,
			"y1B": {"at": 1, "owner": "you"},
			"y1C": {"at": 2, "owner": null},
			"y2A": null,
			"y2B": null,
			"y2C": null,
			"y3A": null,
			"y3B": null,
			"y3C": {"at": 5, "owner": null},
		},
		steps: [
			{
				startMessages: [
					"Before we get to the last ability, I want to emphasize something I glossed over a while back.",
					"You see, Homeworlds is a war, but it's a very *economic* war.",
					"This is partially because of the limited supply of pieces in the Bank.",
					"A large part of success is about manipulating the available pieces to obtain more and bigger ships than your opponent.",
					"Here's a simple example of that. Build the small blue, and let's see what happens. (Or maybe you can predict...)",
				],
				objective: "Build the last small blue OR pass your turn",
				hint: [
					"If you're wondering how to \"pass your turn\": Just click End Turn before doing anything.",
					"This is usually disabled in tutorials but is perfectly legal and you can do it in this one.",
				],
				checkAction: function(action, oldState) {
					// originally this was an opening situation where you only had green
					// but... I'll allow any build as a pass move
					if (action.type !== "build") {
						return [false, "Not falling for it, eh? Or did you just mis-click? If you want, you can build the medium green instead and the opponent will take the small blue."];
					}
					return [true];
				},
				checkEndTurn: function(oldState) {
					if (oldState.map.b1B === null) {
						return [true, "You know... let's do this from the other perspective. I'll have the opponent build the blue...", {
							type: "build",
							newPiece: "b1B", // the only blue left
							system: 5,
						}];
					} else {
						return [true, [
							"So there's no more small blues in the Bank.",
							"The smallest blue piece is now a large...",
							"...and it's your opponent's turn...",
						], {
							type: "build",
							newPiece: "b3A",
							system: 3,
						}];
					}
				},
				nextStep: function(oldState) {
					// If they build the B3, move to the end, otherwise move to the next step
					return oldState.map.b3A ? 2 : 1;
				},
			},
			{
				startMessages: [
					"See, there are no more small (or medium) blues in the Bank.",
					"So what does that mean about your build options?",
				],
				objective: "Build a large blue",
				hint: "OK, you're just obsessively clicking Hint. If you're curious, you can read the source code on GitHub (link on the homepage). The files are in the /scripts/tutorials folder.",
				checkAction: function(action, oldState) {
					// I assume that if you know sacrifices you also know catastrophes
					if (action.type !== "build" || action.newPiece !== "b3A") {
						return [false, "Come on, there's a large blue waiting for you!"];
					}
					return [true];
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "This time, let's actually get that medium green."];
					}
					// Either trade for red or build a green
					const action = (oldState.map.r1A ? {
						type: "build",
						newPiece: "g2C",
						system: 2,
					} : {
						type: "trade",
						oldPiece: "b1B",
						newPiece: "r1A",
					});
					
					return [true, [
						"Great. You're now in the lead on large ships!",
						"You now would have a solid advantage. The enemy still has only their initial large ship.",
					], {
						type: "trade",
						oldPiece: "b1B",
						newPiece: "r1A",
					}];
				}
			}
		],
		endMessages: [
			"Yep! One side got a small ship, the other got a large. That's just one example of how tricky the economy can be in Homeworlds.",
			"It's important to watch the Bank. If you're taking the last ship of a size, that often opens up the next size to your opponent.",
			"The extreme example is being \"frozen out\" of a color, unable to build OR trade for it, because your enemy has all the pieces.",
			"So as you play, keep thinking: am I giving the opponent more opportunities to get bigger ships than mine?",
			"Now, what's all this fuss about colors? See you in the next module!",
		],
	}),

	// What "color power" really means
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "color-powers",
		title: "Colors are Powerful",
		disableWarnings: true,
		startMap: {
			"b1A": {"at": 5, "owner": "you"},
			"b1B": {"at": 3, "owner": "you"},
			"b1C": {"at": 2, "owner": null},
			"b2A": null,
			"b2B": null,
			"b2C": {"at": 4, "owner": null},
			"b3A": null,
			"b3B": null,
			"b3C": {"at": 1, "owner": null},

			"g1A": {"at": 4, "owner": "you"},
			"g1B": {"at": 3, "owner": "you"},
			"g1C": null,
			"g2A": null,
			"g2B": {"at": 5, "owner": null},
			"g2C": {"at": 2, "owner": null},
			"g3A": null,
			"g3B": null,
			"g3C": {"at": 1, "owner": "you"},

			"r1A": null,
			"r1B": null,
			"r1C": {"at": 1, "owner": null},
			"r2A": null,
			"r2B": null,
			"r2C": null,
			"r3A": null,
			"r3B": null,
			"r3C": {"at": 2, "owner": "enemy"},

			"y1A": {"at": 1, "owner": "you"},
			"y1B": null,
			"y1C": {"at": 5, "owner": "you"},
			"y2A": null,
			"y2B": null,
			"y2C": {"at": 3, "owner": null},
			"y3A": {"at": 4, "owner": "enemy"},
			"y3B": null,
			"y3C": null,
		},
		steps: [
			{
				startMessages: [
					"Now that we've learned three of the four abilities, I wanted to explain how they relate to colors.",
					"I mentioned that green is connected to building, and blue to trading, but I didn't properly explain what that meant.",
					"Each star and each ship has a color. And that color corresponds to an ability.",
					"At a star system, you can do an action if either (1) the star is the matching color, or (2) you have a ship of that color at the system.",
					"You cannot, however, use technology from enemy ships, nor from ships at a different star.",
					"That's what that \"Trade Build Steal Move\" thing above the map is. (We'll cover stealing next module.)",
					"This tutorial is open-ended. Try moving pieces around and see how your abilities change.",
				],
				objective: "Experiment with what abilities you can and cannot do",
				hint: [
					"Notice how you can't move one of your ships?",
					"You can't use technology from enemy ships.",
					"If you wanted to move it, you have to get your OWN yellow there.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice") {
						return [false, "The sacrifice action is... tricky, and I don't want to overwhelm you. Stick to the basic ones for now."];
					}
					if ((action.type === "move" || action.type === "discover") && action.oldPiece === "g3C") {
						return [true, "I'll allow that move, but it's generally not a good idea to leave your homeworld without a large ship defending it."];
					}
					return [true];
				},
				checkEndTurn: function() {
					// it has to be valid here
					// the enemy does nothing here
					return [true];
				},
			},
			{
				startMessages: [
					"Just so you know...",
					"Sometimes, a button won't appear even if you have the ability.",
					"This is just because the action is impossible for another reason.",
					"For example, you click a small ship and have trade power, but there are no smalls in the stash.",
					"Then you won't see the trade button.",
					"And the popup won't show up at all if it's not your turn!",
					"Anyway, try discovering new systems and see how the action buttons change. (You have to end your turn to see the difference.)",
				],
				objective: "Keep experimenting!",
				hint: [
					"Here's one thing to try...",
					"Discover a new system (or trade a ship), then end your turn. What happens to the ships left behind? What actions can they do?",
				],
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice") {
						return [false, "The sacrifice action is... tricky, and I don't want to overwhelm you. Stick to the basic ones."];
					}
					
					return [true];
				},
				checkEndTurn: function(oldState) {
					const pieces = oldState.getAllPiecesAtSystem(1);
					if (pieces.length <= 2) {
						return [false, "Ack! Don't abandon your homeworld! That's the one thing I can't allow... (well, there's more than one thing)"];
					}
					
					return [true, [
						"Well...",
						"I'll leave you to whatever you want to do.",
						"When you're done, click the End Turn button *twice in a row*.",
						"It's in the Hint if you forget.",
					]];
				},
				nextStep: function(oldState) {
					console.log("old state is ", oldState);
					if (oldState.actions.number === 0) {
						return 2;
					} else {
						return "loop";
					}
				}
			},
			{
				id: 'loop',
				startMessages: [],
				hint: "When you're done, click the End Turn button *twice in a row*.",
				objective: "Experiment. When done, click End Turn twice.",
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice") {
						return [false, "Nope. Patience!"];
					}
					if (action.type === "steal" || action.type === "catastrophe") {
						return [true, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
							"span",
							{},
							"I see you're finding stuff out... You know you can read the rules (scroll up) and play around in the ",
							react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {href: "/sandbox"}, "sandbox?")
						)];
					}
					return [true];
				},
				checkEndTurn: function(oldState) {
					const pieces = oldState.getAllPiecesAtSystem(1);
					if (pieces.length <= 2) {
						return [false, "No! Don't abandon your homeworld! That's one thing I can't allow... (In the real game you get a warning, assuming you haven't disabled them)"];
					}
					
					// the r3C is the enemy's homeworld, make sure they still have it before sacrificing
					if (oldState.actions.number === 1 && oldState.map.r3C && oldState.map.r3C.owner === "enemy") {
						return [true, [], {
							type: "sacrifice",
							oldPiece: "r3C",
						}];
					}
					return [true];
				},
				nextStep: function(oldState) {
					console.log("old state is\n", oldState);
					console.log("old state actions\n", oldState.actions);
					if (oldState.actions.number === 0 || oldState.phase === "end") {
						return 1;
					} else {
						return 'loop';
					}
				},
			}
		],
		endMessages: [
			"There you go.",
			"(If you want, you can go back to this tutorial from the menu to try it again.)",
			"Now, maybe you already figured out what the red ability is, or maybe you haven't.",
			"The interesting thing about red is that it is rarely used, yet still extremely important...",
		],
	}),

	// Capturing
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "steal",
		title: "Offense and Defense",
		disableWarnings: true,
		startMap: {
			"b1A": {"at": 5, "owner": "enemy"},
			"b1B": {"at": 4, "owner": "you"},
			"b1C": {"at": 2, "owner": null},
			"b2A": null,
			"b2B": {"at": 5, "owner": "enemy"},
			"b2C": {"at": 1, "owner": null},
			"b3A": null,
			"b3B": null,
			"b3C": null,

			"g1A": null,
			"g1B": null,
			"g1C": null,
			"g2A": {"at": 1, "owner": "you"},
			"g2B": {"at": 5, "owner": null},
			"g2C": {"at": 3, "owner": null},
			"g3A": {"at": 4, "owner": null},
			"g3B": {"at": 2, "owner": null},
			"g3C": {"at": 1, "owner": "you"},

			"r1A": {"at": 5, "owner": "enemy"},
			"r1B": {"at": 4, "owner": "you"},
			"r1C": {"at": 1, "owner": null},
			"r2A": {"at": 4, "owner": "enemy"},
			"r2B": null,
			"r2C": null,
			"r3A": null,
			"r3B": {"at": 7, "owner": "you"},
			"r3C": {"at": 2, "owner": "enemy"},

			"y1A": null,
			"y1B": {"at": 2, "owner": "enemy"},
			"y1C": {"at": 1, "owner": "you"},
			"y2A": {"at": 5, "owner": "enemy"},
			"y2B": {"at": 4, "owner": "you"},
			"y2C": {"at": 3, "owner": "enemy"},
			"y3A": null,
			"y3B": null,
			"y3C": {"at": 7, "owner": null},
		},
		steps: [
			{
				startMessages: [
					"OK, time for the last ability.",
					"Capturing is probably the least commonly used action in the game, but it's just as important as the other three.",
					"Capturing lets you take control of (i.e. steal) enemy ships. But it only works at short range (i.e. in the same system).",
					"To use it, you click on an enemy ship. If you have an equal or larger ship at the same system, you can capture it, and it becomes yours.",
					"Note that on this website I've arranged the ships and stars so yours are on the right side, almost like cars on a highway (in the US).",
					"So if you notice things move around a bit, that is why.",
					"Here, your opponent has moved a ship to one of your colonies. It seems they forgot that their turn is now over, so YOU get to strike first! Steal that invader ship!",
				],
				hint: [
					"There's a lot more going on here, so don't panic. Which ship doesn't belong? That's the one you want to capture.",
					"Click on it, then click \"Capture this ship\".",
				],
				checkAction: function(action, oldState) {
					if (action.type === "steal") {
						return [true, [
							"There you go. That'll teach them to be smarter about invasions...",
						]];
					} else {
						return [false, "That's fine, but there's an invader in one of your colonies. You need to capture them before they steal your ships!"]
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "Don't end your turn yet, you haven't done anything!"];
					}
					
					return [true, null, {
						type: "build",
						newPiece: "r2C",
						system: 2,
					}];
				}
			},
			{
				startMessages: [
					"So maybe that was dumb on their part to invade like that.",
					"That's why in real games captures are the rarest action. No one would really send their own ship into hostile territory like that.",
					"But if you move a ship in that is BIGGER than all the enemy ships, they can't fight back!",
					"See those four ships at the one system? Let's invade with a stronger ship...",
				],
				hint: [
					"You have five ships that can move to two different enemy colonies. But only one of your ships is stronger than the enemy fleet...",
				],
				checkAction: function(action, oldState) {
					if (action.type === "move") {
						if (action.system === 3) {
							// 3 only has a yellow
							return [false, "If you move there, the Y2 (i.e. medium yellow) can just move away. Move somewhere with more ships."];
						} else if (action.system !== 5) {
							// where are you going?
							return [false, "Where are you going? Invade the enemy now!"];
						} else if (action.oldPiece !== "r3B") {
							// ok at this point we are going to system 5
							return [false, "That ship isn't strong enough! They'll just capture you right away..."];
						} else {
							return [true, "Their ships are smaller, so they can't capture you. Resistance Is Futile!\n\n...right?"];
						}
					} else {
						// not a move action
						return [false, "That doesn't look like a move to me..."];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything yet."];
					}
					
					return [
						true,
						"It's their turn now, but they can't fight you. They can only move out one ship... right?",
						// first action
						{
							type: "sacrifice",
							oldPiece: "y2A",
						},
						{
							type: "discover",
							oldPiece: "b2B",
							newPiece: "g1A",
						},
						{
							type: "move",
							oldPiece: "r1A",
							system: 8, // the newly discovered one
						},
					];
				}
			},
			{
				startMessages: [
					"What in the galaxy was THAT? They just moved two ships and a third disappeared!",
					"That's something for a new module... BUT, I wanted to give you the chance to capture that last ship first, if you want to.",
					"(You can also experiment with sacrificing, but if you're confused, we will cover it next module.)",
					"Do whatever you want (or nothing) this turn, then we'll start the next module after you End Turn.",
				],
				hint: [
					"Did you sacrifice and get stuck?",
					"There's always Reset Turn, or you can End Turn and learn about sacrifices next module.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "catastrophe") {
						return [true, "I see you've found out about the catastrophe action... that's two modules from now."];
					}
					return [true];
				},
				checkEndTurn: function() {
					return [true];
				}
			},
		],
		endMessages: [
			"Now let's learn about what they just did to you...",
			"It's that pesky sacrifice action that I've been stopping you from doing all this time.",
		],
	}),
	
	// Sacrifices
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "sacrifice",
		title: "Sometimes You Have to Make Sacrifices",
		disableWarnings: true,
		startMap: {
			"b1A": null,
			"b1B": null,
			"b1C": {"at": 6, "owner": null},
			"b2A": null,
			"b2B": null,
			"b2C": {"at": 1, "owner": null},
			"b3A": null,
			"b3B": {"at": 5, "owner": null},
			"b3C": {"at": 2, "owner": null},

			"g1A": null,
			"g1B": null,
			"g1C": {"at": 4, "owner": null},
			"g2A": null,
			"g2B": null,
			"g2C": null,
			"g3A": {"at": 3, "owner": null},
			"g3B": {"at": 2, "owner": "enemy"},
			"g3C": {"at": 1, "owner": "you"},

			"r1A": null,
			"r1B": null,
			"r1C": {"at": 1, "owner": null},
			"r2A": null,
			"r2B": null,
			"r2C": {"at": 2, "owner": null},
			"r3A": null,
			"r3B": null,
			"r3C": null,

			"y1A": {"at": 5, "owner": "you"},
			"y1B": {"at": 4, "owner": "enemy"},
			"y1C": {"at": 3, "owner": "you"},
			"y2A": {"at": 6, "owner": "enemy"},
			"y2B": {"at": 1, "owner": "you"},
			"y2C": {"at": 2, "owner": "enemy"},
			"y3A": null,
			"y3B": null,
			"y3C": null,
		},
		steps: [
			{
				startMessages: [
					"So normally, you can only do one action per turn, and you need access to a color to do any action (e.g. to build, you must have a green ship there or be at a green star).",
					"But there's another option: You can sacrifice any one of your ships. You then get several actions of the ship's type, with the number depending on the size, that you can use ANYWHERE you still have a ship.",
					"What? OK: If you sacrifice a Small, you get 1 action; a Medium, 2; and a Large, 3.\n(This is the explanation for those pips you've seen on the ships.)",
					"The type of actions correspond to the ship's color: sacrificing a yellow gives you move/discover actions, a green gives builds, etc.",
					"And you can do those actions ANYWHERE you still have a ship, even if you otherwise don't have technology there.\nIt's like a long-range signal booster that gives you technology, but is so powerful it destroys the ship.",
					"Here's a rather common opening situation. Goal: Build all three large yellows at once!",
				],
				hint: [
					"Normally, you can only build one ship per turn. How do you build 3 things in one turn?",
					"(There's also the Show Intro button if you want to refresh your memory.)",
				],
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice") {
						if (action.oldPiece === "g3C") {
							return [true, [
								"Good. Now you can do 3 build actions: 3 because it was a large, and build actions because it was green.",
								"You can do them at any of the three systems where you still have ships.",
								"They don't even have to all be in one place!",
							]];
						} else {
							return [false, "Nice try, but sacrificing a yellow gives you *move* actions. What color gives you build actions?"];
						}
					} else if (action.type === "build") {
						if (oldState.actions.sacrifice) {
							// sacrifice then build
							
							// give some helpful notices if they look like they have a misconception
							const at1 = oldState.getAllPiecesAtSystem(1).length;
							const at3 = oldState.getAllPiecesAtSystem(3).length;
							console.log(at1, at3);
							// these include the star(s)
							if (at1 === 4 && action.system === 1) {
								// you're building twice at the homeworld
								return [true, "Just saying, you don't *have* to build all your new ships where you sacrificed. You have build power EVERYWHERE you have a ship. That's the power of sacrifices!"];
							} else if (at3 === 3 && action.system === 3) {
								return [true, "Just saying, you don't *have* to build at green systems when you sacrifice. The sacrifice gives you build power EVERYWHERE you have a ship!"];
							} else {
								// no comment
								return [true];
							}
							return [true];
						} else {
							return [false, "If you just build now, you only get one ship. Sacrifice something first!"];
						}
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						if (oldState.actions.sacrifice) {
							return [false, "Remember, you got *three* build actions from the sacrifice. Use them all before you End Turn!"];
						} else {
							return [false, "You haven't done anything yet, so don't end your turn!"];
						}
					}
					
					// enemy move
					// see if they can exploit catastrophes
					let systemsToCheck = [1, 3, 5];
					for (let i = 0; i < systemsToCheck.length; i++) {
						const system = systemsToCheck[i];
						// only one system can have 3+ ships
						// system #1 is the homeworld, which has 2 stars
						const ships = oldState.getAllPiecesAtSystem(system).length - (system === 1 ? 2 : 1);
						if (ships === 4) {
							return [true, [
								"I see you've built all your ships at the same system. You don't have to do that; in fact, you could have built one ship in every system if you wanted.",
								"Anyway, though, you now have 3 large ships! What could *possibly* go wrong?!"
							], {
								// you have 4 ships, just immediately catastrophe
								type: "catastrophe",
								color: "y",
								system: system,
							}];
						} else if (ships === 3) {
							const enemyActions = (system === 1) ? [
								// sacrifice y2A for two moves
								{
									type: "sacrifice",
									oldPiece: "y2A",
								},
								// move to your homeworld
								{
									type: "move",
									oldPiece: "y1B",
									system: 5,
								},
								{
									type: "move",
									oldPiece: "y1B",
									system: 1,
								},
								// now blow up your 3 yellows
								{
									type: "catastrophe",
									system: 1,
									color: 'y'
								},
							] : [
								// not at your homeworld so do a simple move
								{
									type: "move",
									oldPiece: "y1B",
									system: system,
								},
								{
									type: "catastrophe",
									system: system,
									color: 'y',
								},
							];
							return [true, "Yay! You now have 3 large ships, and there's no more yellow for your opponent to build! What could *possibly* go wrong?"].concat(enemyActions);
						}
					} // end for
					// No system has 3+ pieces.
					// Do a catastrophe anyway!
					return [
						true,
						[
							"That's actually what I would have done in the game, building one piece at each system.",
							"You now have 3 large ships to the opponent's 1, and they can't build any more yellow! What could *possibly* go wrong?",
						], 
						// sacrifice Y2 for 2 moves
						{
							type: "sacrifice",
							oldPiece: "y2C",
						},
						{
							type: "move",
							oldPiece: "y2A",
							system: 3,
						},
						{
							type: "move",
							oldPiece: "y1B",
							system: 3,
						},
						{
							type: "catastrophe",
							system: 3,
							color: 'y'
						}
					];
				}, // end checkEndTurn
			} // end step
		], // end steps array
		endMessages: [
			"What? How did they destroy your ships?",
			"Something about concentrations of color, apparently... well, time for the next module!",
			"By the way, I just wanted to clarify something before we go: You can only sacrifice one piece per turn.",
			"That piece might give you multiple actions, but they would all be the same type; you can NOT, for example, build and also move in the same turn.",
			"Also, you can sacrifice ANY piece you have; it does NOT require any specific color like the other four actions do.",
			"All right, let's learn about catastrophes! I promise, we're done with these surprises.",
		],
	}),
	
	// Catastrophes
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "catastrophe",
		title: "Catastrophe!",
		disableWarnings: true,
		startMap: {
			"b1A": null,
			"b1B": {"at": 3, "owner": "you"},
			"b1C": {"at": 4, "owner": null},
			"b2A": {"at": 6, "owner": "enemy"},
			"b2B": {"at": 9, "owner": "you"},
			"b2C": {"at": 2, "owner": null},
			"b3A": null,
			"b3B": {"at": 6, "owner": null},
			"b3C": {"at": 1, "owner": null},

			"g1A": {"at": 4, "owner": "you"},
			"g1B": {"at": 6, "owner": "enemy"},
			"g1C": {"at": 3, "owner": null},
			"g2A": null,
			"g2B": {"at": 4, "owner": "you"},
			"g2C": null,
			"g3A": null,
			"g3B": {"at": 2, "owner": "enemy"},
			"g3C": {"at": 1, "owner": "you"},

			"r1A": {"at": 1, "owner": "you"},
			"r1B": {"at": 6, "owner": "enemy"},
			"r1C": {"at": 3, "owner": "you"},
			"r2A": {"at": 2, "owner": "enemy"},
			"r2B": {"at": 3, "owner": "you"},
			"r2C": null,
			"r3A": {"at": 3, "owner": "enemy"},
			"r3B": null,
			"r3C": {"at": 6, "owner": "enemy"},

			"y1A": {"at": 9, "owner": null},
			"y1B": {"at": 2, "owner": "enemy"},
			"y1C": {"at": 2, "owner": null},
			"y2A": null,
			"y2B": {"at": 4, "owner": "you"},
			"y2C": {"at": 1, "owner": null},
			"y3A": null,
			"y3B": null,
			"y3C": null,
		},
		steps: [
			{
				startMessages: [
					"So what I didn't tell you about these four technologies was that they are somewhat unstable.",
					"In fact, if you ever have 4 pieces (ships or stars) of the *same color* in the same system, that is called an Overpopulation.",
					"And, on your turn, if there is an Overpopulated system, you have the option to invoke a Catastrophe, destroying all pieces of the Overpopulated color!",
					"Let's see this in action. Your opponent just invaded one of your colonies (lower left), and you can't fight back. But there are 3 red pieces there. If you just got one more red there...",
				],
				hint: [
					"You need 4 pieces of the same color (here, red) to make a catastrophe.",
					"There are 3 reds at one of your systems. You'll need to figure out how to add a 4th.",
				],
				checkAction: function(action, oldState) {
					// there are several promising tries
					if (action.type === "sacrifice") {
						if (action.oldPiece[0] === "y") {
							return [false, "Trying to escape, eh? Interesting strategy, but here you can actually destroy the invader if you can create a catastrophe."];
						} else if (action.oldPiece === "b1B") {
							return [false, "Were you hoping to trade that small blue (and clicked sacrifice by mistake)? If so, good thinking, but I don't see a small red in the Bank..."];
						} else if (action.oldPiece === "b2B") {
							return [false, [
								"Oh neat! Are you trying to trade out your red (in your homeworld), then trade the small blue for it?",
								"That's really clever. Unfortunately, I can't let you do that here because you need those blue ships for the next turn...",
								"But there *is* another clever way to make a nice profit off of this turn.",
							]];
						} else if (action.oldPiece === "g3C" || action.oldPiece === "g2B") {
							return [true]; // hold our breath
						} else {
							return [false, "Hmmm... I'm not sure what sacrificing *that* piece would do. Perhaps you mis-clicked?"]
						}
					} else if (action.type === "build") {
						// Build.
						// Give no message unless they cause an overpopulation
						if (action.newPiece[0] === 'r' && action.system === 3) {
							return [true, "Now that there are 4 reds, you still have to manually declare the catastrophe. Click any one of the four red ships, then click the catastrophe button (it's the last one)."];
						} else {
							return [true]; // no comment
						}
					} else if (action.type === "trade") {
						return [false, "I'm not sure how that helps you... Try again."];
					} else if (action.type === "move") {
						if (action.oldPiece === "r1A") {
							if (action.system === 3) {
								return [true, [
									"I'll let that go, but notice that when you do the catastrophe you will be totally out of red.",
									"Now that there are 4 reds, you still have to manually declare the catastrophe. Click any one of the four red ships, then click the catastrophe button (it's the last one).",
								]];
							} else {
								return [true, "Whoops, looks like you clicked the wrong system by mistake. Why don't you try out that Reset Turn button? That is designed to save you from these mistakes in a real game."];
							}
						} else if (action.type === "catastrophe") {
							return [true, [
								"There. Notice how your blue is still there? In a ship catastrophe, only the involved ships are destroyed.",
								"(The star would, of course, disappear if those were the ONLY ships there and the star became abandoned.)",
							]];
						}
					} else {
						return [true];
					}
				},
				checkEndTurn: function(oldState) {
					// what I care about is that you destroyed the r3
					if (oldState.map["r3A"]) {
						if (oldState.isSystemOverpopulated('r', 3)) {
							return [false, "Oh right. You actually have to invoke the catastrophe for it to happen. Click one of the overpopulated red ships, then click the catastrophe button."];
						} else if (oldState.actions.number > 0) {
							return [false, "Hmmm... It looks like you aren't quite finished. Don't end your turn just yet. (Perhaps you meant to reset?)"];
						} else {
							return [false, "Hmmm... It looks like you had a plan, but it didn't quite work out. That's why we have a Reset Turn button!"];
						}
					} else {
						const action = {
							type: "build",
							newPiece: oldState.getPieceInStashByType("g2"),
							system: 6,
						};
						if (oldState.map["r3B"]) {
							// you managed to build the other red
							return [true, "Great! You even managed to build the large before declaring the catastrophe!", action];
						} else if (oldState.map["r1A"]) {
							return [true, "Good. (Just so you know, there's a clever way to make a nice profit out of this situation...)\n\nLet's see what the opponent does...", action];
						}
					}
				},
			},
			{
				startMessages: [
					"Well, you took out a large enemy ship!",
					"But unfortunately you had to lose three ships of your own.",
					"Sometimes you can devastate your opponent for a relatively small price.",
					"Here, your opponent foolishly built another green at that one blue star.",
					"You see, if the star itself is part of the overpopulation, then ALL ships there are destroyed and returned to the Bank. (The star explodes!)",
					"Let's see if we can do that and take out five enemy ships!",
				],
				objective: "Cause a blue catastrophe",
				hint: [
					"How many blue pieces are in that system (#6)? You need there to be 4 total.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice") {
						if (action.oldPiece === "y2B") {
							return [true]; // no comment
						} else if (action.oldPiece === "g1A") {
							return [false, "Did you mis-click? You sacrificed the small green."];
						} else {
							const type = {
								'b': "trade",
								'g': "build",
								'r': "capture",
							}[action.oldPiece[0]];
							return [false, "Sacrificing that ship would get you " + type + " actions. But how is that going to move ships into an enemy system?"];
						}
					} else if (action.type === "move") {
						if (oldState.actions.sacrifice) {
							// make sure they move a blue to #6
							if (action.oldPiece[0] === "r") {
								return [false, "Are you trying to cause a red catastrophe? You don't have enough moves for that. Let's blow up the star itself!"];
							} else if (action.oldPiece[0] !== "b") {
								return [false, "What color is the star? Move *that* color in..."];
							} else if (action.system !== 6) {
								return [false, "Where are you going? Let's move directly into the blue star!"];
							} else {
								return [true];
							}
						} else {
							return [false, "Hmmm... You're on the right track! But if you just do the one move, it won't be enough. How can you move multiple ships at once?"];
						}
					} else if (action.type === "catastrophe") {
						return [true, [
							"There you go! BOOM, the whole thing explodes!",
							"They only have 3 ships left! At the beginning you were well behind, with only 1 large ship against 3. Now you've set them way back.",
						]];
					} else {
						return [false, "Hmmm... that doesn't look like an invasion to me."];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.map.b3B) {
						if (oldState.isSystemOverpopulated('b', 6)) {
							return [false, "Again, you have to remember to actually trigger the catastrophe!"];
						} else if (oldState.actions.number > 0) {
							return [false, "Whoops, looks like you tried to end your turn. You aren't done yet!"];
						} else {
							return [false, "It looks like you had a plan that didn't work. That's what the Reset Turn is for!"]
						}
					} else {
						return [true];
					}
				},
			},
		],
		endMessages: [
			"Well done. You've decimated the enemy fleet, reducing them to just three ships.",
			"Of course, you did take a fair amount of losses yourself... that's war sometimes.",
			"Anyway, congratulations! You've gotten through all the basic actions... except the very beginning of the game.",
			"There's one last thing left to learn: setting up your homeworld.",
		],
	}),
	
	// Homeworld Setup
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "homeworld",
		title: "Your Homeworld",
		disableWarnings: true,
		startMap: {
			// yep, all empty
			b1A: null,
			b1B: null,
			b1C: null,
			b2A: null,
			b2B: null,
			b2C: null,
			b3A: null,
			b3B: null,
			b3C: null,
			
			g1A: null,
			g1B: null,
			g1C: null,
			g2A: null,
			g2B: null,
			g2C: null,
			g3A: null,
			g3B: null,
			g3C: null,
			
			r1A: null,
			r1B: null,
			r1C: null,
			r2A: null,
			r2B: null,
			r2C: null,
			r3A: null,
			r3B: null,
			r3C: null,
			
			y1A: null,
			y1B: null,
			y1C: null,
			y2A: null,
			y2B: null,
			y2C: null,
			y3A: null,
			y3B: null,
			y3C: null,
		},
		steps: [
			{
				startMessages: [
					"I've saved the first decision of the game for last, because it's the most important.",
					"At the *very beginning* of the game, you need to pick two stars and one ship for your homeworld.",
					"There are a lot of factors involved. Which sizes do you pick for your stars? Which colors?",
					"So instead of a big lecture right at the start, I'll let you set up any homeworld you want. Click your two stars first, then your ship.",
					"Then I'll give feedback. You can use Reset Turn to try another homeworld or End Turn to finish this module.",
				],
				hint: [
					"Just experiment. Pick something random, reset turn, pick something else, etc until you are comfortable.",
				],
				// hmmm oldState is kind of useless
				checkAction: function(action, oldState) {
					let techFeedback = ["Your choice of abilities:"],
					    shipFeedback = ["Your choice of ship:"],
					    starFeedback = ["Your choice of stars:"];
					
					const pieces = [action.star1, action.star2, action.ship];
					const colorUse = {'b': 0, 'g': 0, 'r': 0, 'y': 0};
					let duplicate = null;
					let success = true;
					for (let i = 0; i < pieces.length; i++) {
						// increment the bin for its first character i.e. color
						const color = pieces[i][0];
						colorUse[color]++;
						if (colorUse[color] >= 2) {
							duplicate = color;
						}
					}
					// General feedback (about your technologies)
					if (duplicate) {
						techFeedback.push("You have picked a duplicate color. This means you have fewer abilities, so the opening will probably be a bit harder.");
					}
					
					if (colorUse['g'] === 0) {
						techFeedback.push("You didn't pick any green! Now you won't be able to build any new ships.");
						if (colorUse['b'] === 0) {
							techFeedback.push("You don't have blue either! Now you can't even trade for green. Your only hope is the Reset Turn button.");
						}
					} else if (colorUse['b'] === 0) {
						techFeedback.push("You didn't pick any blue! You'll have a harder time getting the other three colors.");
						if (colorUse['y'] === 0) {
							techFeedback.push("...and no yellow either! You won't be able to trade for yellow, so you can't escape your homeworld. You are stuck!");
						}
					} else if (colorUse['y'] > 0) {
						// you DO have yellow
						techFeedback.push("You picked G+B+Y. Good, solid opening. You can move out of your homeworld quickly. You will have to eventually get red, and probably keep one at your homeworld.");
					} else if (colorUse['r'] > 0) {
						// you must have green+blue+red
						techFeedback.push("You picked G+B+R. Good, solid opening. You don't have yellow, but you can trade for it after you build a ship. Your homeworld has built-in defenses against enemy invasions.");
					}
					// else you picked a duplicate and there is no more need for comment
					
					// Feedback about your ship
					if (action.ship[1] !== "3") {
						shipFeedback.push("You didn't take a large ship. If you don't have a large, and your opponent gets their own large in, you won't be able to fight back!");
					}
					
					if (action.ship[0] === "g") {
						shipFeedback.push("You picked a green ship. This is what most of the experienced players do. If the situation is right you may be able to sacrifice it later to build several mediums and larges. Of course, be careful of catastrophes.");
					} else if (action.ship[0] === "y") {
						shipFeedback.push("You picked a yellow ship. This is okay, and you often need a large yellow to sacrifice to wipe out a star. But if it's the only large at your homeworld, using it this way becomes risky.");
					} else if (action.ship[0] === "r") {
						shipFeedback.push("You picked a red ship. Having a large red is good (see the Advanced Direct Assault module for why), but it's less effective if it is the only large at your homeworld.");
					} else {
						shipFeedback.push("You picked a blue ship. Blue is good because you can trade for anything even after you leave your homeworld. However, most players use a blue star instead.");
					}
					
					// Feedback about your stars
					let sizesConnected = [];
					for (let s = 1; s <= 3; s++) {
						// [1] is the size in b2C
						// if it's not equal to s, add it to the array
						if (action.star1[1] !== String(s) && action.star2[1] !== String(s)) {
							sizesConnected.push(s);
						}
					}
					
					if (sizesConnected.length === 1) {
						const missingSize = sizesConnected[0];
						if (missingSize === 1) {
							starFeedback.push("You picked a Medium+Large homeworld, also known as a Fortress. This is because Small pieces tend to get used up quickly as ships, so they are not as available for stars to invade your homeworld.");
						} else if (missingSize === 2) {
							starFeedback.push("You picked a Small+Large homeworld, also known as a Goldilocks. In the opening there are usually more Mediums available than any other size, so you can often get 2 or even 3 green-star colonies.");
						} else if (missingSize === 3) {
							starFeedback.push("You picked a Small+Medium homeworld, also known as a Banker. This makes it slightly easier to pull off the Investment strategy (see intermediate modules). Some people say this is the strongest homeworld.");
						} else {
							starFeedback.push("...something weird happened. This is almost certainly a bug.");
						}
					} else {
						// convert numbers into words
						const sizeNames = sizesConnected.map((size) => ["", "Small", "Medium", "Large"][size]);
						starFeedback.push("You picked a homeworld with two same-size stars. This is called a Gemini. Now, you are connected to both " + sizeNames.join(" and ") + " systems. This can make it easier for your opponent to invade you.");
					}
					
					return [
						true,
						[
							techFeedback.join("\n\n"),
							shipFeedback.join("\n\n"),
							starFeedback.join("\n\n"),
							"Note that all of this depends on your play style. Apart from the clearly losing setups, any of these can win games, and you should experiment to find which is best for you.",
							"All right. End Turn to finish this module or Reset Turn to try another setup!",
						],
					]
				},
				checkEndTurn: function() {
					return [true];
				},
			}
		],
		endMessages: [
			"Oh wait. I forgot to cover how to win and lose!",
			"Well, you may have encountered my stern warnings against abandoning your homeworld...",
			"If, at the end of any turn (yours or your opponent's), you have no ships at your homeworld, you LOSE.",
			"(You CAN safely abandon it mid-turn, like with a yellow sacrifice, IF you get a ship back home before your turn ends.)",
			"Conversely, if you can make your opponent abandon their homeworld, you win...",
		],
	}),

	// Winning the Game
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "winning",
		title: "Winning the Game",
		disableWarnings: true,
		startMap: {
			"b1A": null,
			"b1B": null,
			"b1C": null,
			"b2A": null,
			"b2B": null,
			"b2C": {"at": 1, "owner": null},
			"b3A": null,
			"b3B": null,
			"b3C": {"at": 2, "owner": null},

			"g1A": {"at": 1, "owner": "you"},
			"g1B": null,
			"g1C": null,
			"g2A": null,
			"g2B": null,
			"g2C": null,
			"g3A": null,
			"g3B": {"at": 2, "owner": "enemy"},
			"g3C": null,

			"r1A": null,
			"r1B": null,
			"r1C": {"at": 1, "owner": "you"},
			"r2A": null,
			"r2B": null,
			"r2C": null,
			"r3A": null,
			"r3B": null,
			"r3C": {"at": 2, "owner": "you"},

			"y1A": null,
			"y1B": {"at": 2, "owner": "enemy"},
			"y1C": {"at": 1, "owner": null},
			"y2A": null,
			"y2B": null,
			"y2C": null,
			"y3A": null,
			"y3B": null,
			"y3C": null,
		},
		steps: [
			{
				startMessages: [
					"I don't want to spend too much time on this here; there are Intermediate tutorials that cover how to actually plan for victory.",
					"But for now I'll keep things simple. You win if your opponent's homeworld is destroyed or abandoned.",
					"You also win if your opponent has no ships there.",
					"Here, you're all set for a simple win by capturing the two ships. You can only steal one per turn, but that's fine because they can't fight back."
				],
				hint: [
					"Your opponent really can't do anything. Just capture their ships one by one!",
				],
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice") {
						if (action.oldPiece === "r3C") {
							return [false, [
								"You can't have your ship and sacrifice it too...",
								"You don't even need to sacrifice, your red ship lets you capture ships right away.",
							]];
						} else {
							return [false, "You don't need to sacrifice here; your red ship already lets you capture."];
						}
					} else if (action.type !== "steal") {
						return [false, "That's possible, but why not capture one of the enemy ships? You're two turns away from winning..."];
					} else {
						// the large can't do anything so we dont care what the user plays
						return [true];
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					return [true];
				},
			},
			{
				startMessages: [
					"So they passed... It's not like the enemy really had anything worth doing...",
					"Anyway... One down, one to go!",
				],
				checkAction: function(action, oldState) {
					if (action.type !== "steal") {
						return [false, "That's possible, but you can just capture the last enemy ship right away and win!"];
					} else {
						return [true, "Good. Now just end your turn..."];
					}
				},
				requireAction: true,
				checkEndTurn: function() {
					return [true];
				},
			},
		],
		endMessages: [
			"Well done, you won!",
			"Of course, it's usually more complicated than that...",
			"I mean, normally your opponent would have red of their own, and they would have captured your invader first.",
			"The Intermediate and Advanced tutorials have more realistic scenarios of getting to victory.",
			// somehow I don't feel like using JSX
			react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", {}, 
				"Well, I think that about covers everything you need to know. I do have some more information on this site itself ",
				react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {href: "/howThisWorks"}, "here"),
				", and Looney Labs has the official rules for Homeworlds ",
				react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {href: "https://www.looneylabs.com/sites/default/files/literature/Homeworlds%20Rules13.pdf"}, "here"),
				"."
			),
			"The last Basic module is there in case you found the movement rule confusing. It lets you move all around many different stars.\n\nFurther modules will cover basic and more advanced strategies. Good luck!",
		],
	}),
	
	// Star Connection Playground
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "move-playground",
		title: "Star Connections Playground",
		startMap: {
			/*
			2 (enemy): enemy has b3,g3,r3; stars r1,y3
			
			7: enemy has b3,r2; stars y2
			6: enemy has b2,r1; stars y2
			
			8: enemy has b2,r2; stars y3
			
			3 (foreign HW): enemy has b3; stars y1,g2
			
			5: enemy has b1,b1; stars y1
			4: enemy has b1,r1; stars y1
			
			1 (you): stars y2,y3; you have r2,b2
			*/
			
			b1A: {at: 4, owner: "enemy"},
			b1B: {at: 5, owner: "enemy"},
			b1C: {at: 5, owner: "enemy"},
			b2A: {at: 1, owner: "you"},
			b2B: {at: 8, owner: "enemy"},
			b2C: {at: 6, owner: "enemy"},
			b3A: {at: 2, owner: "enemy"},
			b3B: {at: 7, owner: "enemy"},
			b3C: {at: 3, owner: "enemy"},
			
			g1A: null,
			g1B: null,
			g1C: null,
			g2A: {at: 3, owner: null},
			g2B: null,
			g2C: null,
			g3A: null,
			g3B: {at: 2, owner: "enemy"},
			g3C: null,
			
			r1A: {at: 4, owner: "enemy"},
			r1B: {at: 6, owner: "enemy"},
			r1C: {at: 2, owner: null},
			r2A: {at: 1, owner: "you"},
			r2B: {at: 8, owner: "enemy"},
			r2C: {at: 7, owner: "enemy"},
			r3A: null,
			r3B: null,
			r3C: {at: 2, owner: "enemy"},
			
			y1A: {at: 5, owner: null},
			y1B: {at: 4, owner: null},
			y1C: {at: 3, owner: null},
			y2A: {at: 1, owner: null},
			y2B: {at: 6, owner: null},
			y2C: {at: 7, owner: null},
			y3A: {at: 1, owner: null},
			y3B: {at: 2, owner: null},
			y3C: {at: 8, owner: null},
		},
		bannedActions: ["trade", "sacrifice", "catastrophe"],
		steps: [
			{
				startMessages: [
					"In Homeworlds, two star systems are connected if and only if they do not share any size stars.",
					"Examples: A Small is connected to a Medium, but not another Small. A Small+Large two-star system is only connected to Mediums, and not to Medium+Large or Small+Medium homeworlds.",
					"If you find that a bit confusing, here is a scenario where you can move between lots of star systems.",
					"The enemy will NOT act in this scenario (but you still have to end your turn), and I have disabled the trade, sacrifice, and catastrophe actions.\n\nCan you capture all the ships?",
				],
				hint: "Just move your red ship out.",
				checkAction: function(action) {
					if (action.type !== "move") {
						return [false, "I'd prefer you stick to movement and capturing for now."];
					}
					if (action.oldPiece !== "r2A") {
						return [false, "I'd prefer you move the red ship, so you can directly capture other ships."];
					}
					return [true, "All right. Now, capture all the ships (but end your turn first)!"];
				},
				checkEndTurn: function() {
					return [true, [
						"You might have noticed the star map is arranged neatly to show the system connections.",
						"However, *always* remember that the actual position of stars on the map is entirely irrevelant and is only done as a visual aid.",
						"The sizes are all that matters.\nCapture those ships!",
						"(Oh, and the Show Intro won't work anymore. Use Show Hint from now on if you need a refresher.)",
					]];
				}
			},
			{
				id: "loop",
				startMessages: [], // no annoying message every single turn
				hint: [
					"Systems are connected if they have NO sizes in common. It may take you two or three moves to get where you want to go...",
					"You need a large ship to capture other larges. Where can you build one?",
				],
				
				checkAction: function(action) {
					if (action.type === "trade" || action.type === "catastrophe") {
						return [false, "I've turned off those actions for this module, because the focus is on movement."]
					}
					return [true];
				},
				checkEndTurn: function(oldState) {
					// check if you have anything at home
					const pieces = oldState.getPiecesAtHomeworlds();
					if (!pieces["you"] || pieces["you"].ships.length <= 0) {
						// oh no, you abandoned your homeworld!
						// (this almost should be standard...)
						return [false, "No! NEVER abandon your homeworld! You will lose! Click Reset Turn to undo that."];
					}
					
					return [true];
				},
				
				// undefined/null => go to next
				// number => offset (e.g. 2 = go ahead 2 steps), can be negative, if overflows then we finish
				// "end" => finish tutorial (Infinity also works)
				// other string => step with matching "id" property
				nextStep: function(gameState) {
					return gameState.phase === "end" ? 1 : 0;
				},
			}
		],
		endMessages: [
			"Well done! I'll admit system number 3, the green/yellow binary, may have been a bit confusing. (It tripped me up when I was testing this!)",
			"My algorithm places stars in rows based on proximity to homeworlds.",
			"The rows, top down:\n(1) Enemy homeworld.\n(2) Systems connected to enemy homeworld (but not yours).\n(3) Systems connected to neither (or both) homeworlds.\n(4) Systems connected to your homeworld.\n(5) Your homeworld.",
			"Of course, since both 3 and 8 were in the \"neither\" category, they ended up in the same row...",
			"By the way, when one player loses half their homeworld, the systems move around a bit to reflect the new connections, so don't be caught off guard.",
			"OK! You are now ready to begin playing or check out the Intermediate level tutorials for more gameplay tips!",
		],
	}),
];

// I don't trust a raw {} to not have strange meanings
/* harmony default export */ __webpack_exports__["default"] = ({
	title: "Basic Tutorials",
	description: "These cover the basics of gameplay. Start here if you don't already know how Homeworlds works!",
	list: tutorialList,
});

/***/ }),

/***/ "./scripts/tutorials/intermediateTutorials.js":
/*!****************************************************!*\
  !*** ./scripts/tutorials/intermediateTutorials.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tutorialConstructor.js */ "./scripts/tutorials/tutorialConstructor.js");
// intermediateTutorials.js
//
// Some intermediate-level tutorials. They cover basic openings, freeze-outs, and the 3 main ways to win.





const tutorialList = [
	// Openings 1
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "opening-strategy",
		title: "Basic Opening Strategy",
		disableWarnings: true,
		startMap: {
			"b1A": null,
			"b1B": {"at": 1, "owner": null},
			"b1C": null,
			"b2A": null,
			"b2B": null,
			"b2C": null,
			"b3A": null,
			"b3B": null,
			"b3C": {"at": 2, "owner": null},

			"g1A": null,
			"g1B": null,
			"g1C": null,
			"g2A": null,
			"g2B": null,
			"g2C": null,
			"g3A": null,
			"g3B": {"at": 2, "owner": "enemy"},
			"g3C": {"at": 1, "owner": "you"},

			"r1A": null,
			"r1B": {"at": 2, "owner": null},
			"r1C": null,
			"r2A": null,
			"r2B": null,
			"r2C": null,
			"r3A": null,
			"r3B": null,
			"r3C": null,

			"y1A": null,
			"y1B": null,
			"y1C": null,
			"y2A": {"at": 1, "owner": null},
			"y2B": null,
			"y2C": null,
			"y3A": null,
			"y3B": null,
			"y3C": null,
		},
		steps: [
			{
				disableWarnings: true,
				startMessages: [
					"Welcome to the strategy guide modules! Here I'll shift from explaining rules to giving advice on various situations.",
					"The first question is, what do you do once you have made your homeworld? Well, it depends in part on what you picked.",
					"I've given you a B1+Y2 homeworld against an R1+B3, but a lot of these ideas apply to any setup situation.",
					"Your second turn will almost always be to build a second ship. (You can't capture anything, moving abandons your homeworld, and trading just wastes a turn because you could have picked the new ship to begin with.)",
					"So let's build another ship!",
				],
				objective: "Build a second ship",
				hint: "If you've forgotten how the build action works: you click the existing ship of the same color, then click the Build button.",
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						return [true];
					} else if (action.type === "sacrifice") {
						return [false, "That actually won't work. You would not have any ships left, so you could no longer build."];
					} else if (action.type === "discover") {
						return [false, "That would abandon your homeworld! You can't do that or you will lose!"];
					} else if (action.type === "trade") {
						return [false, "You don't want to trade quite yet! Then you would not have any green to build new ships!"];
					} else {
						return [false, "I'm not sure what you did..."];
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything yet!"];
					}
					return [true, "That's the easiest turn of the game. Next turn you'll have to make a decision...", {
						type: "build",
						newPiece: oldState.getPieceInStashByType('g1'),
						system: 2,
					}];
				},
			},
			{
				startMessages: [
					"With that out of the way, what should you do next?",
					"Well, you probably don't want to build the last small green and open up mediums. (You already have green and it would be your third green all in one system.)",
					"You do have movement, so you can discover a new system.",
					"Alternatively, you can trade for some other color.",
					"I'll let you pick which one you want to try. (This tutorial has 3 different branches; you can come back and try a different route.)",
				],
				disableWarnings: true,
				hint: [
					"Having trouble discovering? Look at your homeworld. Which size do you NOT have? That's the size you can move to.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						return [false, "You're building the last small green... which lets your opponent get a medium."];
					} else if (action.type === "trade") {
						if (action.oldPiece[1] === "3") {
							return [false, "Trading your large is possible, but it's usually better to trade small ships."];
						} else {
							return [true, "Diversifying right away, eh?"];
						}
					} else if (action.type === "discover") {
						if (action.newPiece[0] !== "b") {
							return [false, [
								"I see you're being adventurous!",
								"But remember you only have the color powers at your system, which means you can't trade at this new system.",
								"I would recommend discovering a BLUE system.",
							]];
						} else if (action.oldPiece[1] === "3") {
							return [false, [
								"I see you're being adventurous!",
								"I'm not sure you want to move your large ship away from your homeworld, though...",
								"You're not in danger of invasion now, but you don't want to forget and suddenly find an enemy R3 in your homeworld...",
								"How about discovering with the small ship?",
							]];
						} else {
							return [true, "I see you're being adventurous. Keep it up!"];
						}
					} else if (action.type === "sacrifice") {
						if (action.oldPiece[1] === "1") {
							// sacrificed the small
							return [false, [
								"Sacrificing a small green... would get you 1 build. That can be useful sometimes (it lets you build where you don't have green). But does that help you *here*?",
							]];
						} else if (action.oldPiece[1] === "3") {
							// sacrificed the large
							return [false, [
								"Trying to sacrifice the large, eh?",
								"I'm afraid that's a bit premature. Even if you did 3 builds, they would have to all be in your homeworld.",
								"Which would mean you would have 4 greens in one system. 4 isn't a good number, if you catch my drift...",
							]];
						}
					}
					
					return [false, "I'm not entirely sure what you just did..."];
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything yet..."];
					}
					
					// get which g1 is owned by the enemy
					let enemyG1 = null;
					for (let i = 0; i < 3; i++) {
						// A = 65
						const serial = 'g1' + String.fromCharCode(i + 65);
						if (oldState.map[serial] && oldState.map[serial].owner === "enemy") {
							enemyG1 = serial;
							break;
						}
					}
					
					if (oldState.nextSystemID === 4) {
						return [true, "Now, although you have yellow (movement ability) in your homeworld, your opponent does not, so they're going to trade for it now.", {
							type: "trade",
							oldPiece: enemyG1,
							newPiece: oldState.getPieceInStashByType('y1'),
						}];
					} else {
						// they should trade for what you traded for
						const pieces = oldState.getAllPiecesAtSystem(1);
						let yourSmall = null;
						for (let i = 0; i < pieces.length; i++) {
							const pieceData = pieces[i];
							if (pieceData.serial[1] === "1" && pieceData.owner === "you") {
								yourSmall = pieceData.serial;
							}
						}
						if (yourSmall[0] === "r") {
							return [true, [
								"Ah, you've armed yourself with a weapon!",
								"Conventional wisdom says that whenever your opponent gets a red ship, you should as well.",
								"The Bank is also short on reds, so your opponent is going to trade for red now.",
							], {
								type: "trade",
								oldPiece: enemyG1,
								newPiece: oldState.getPieceInStashByType('r1'),
							}];
						} else {
							return [true, "Good. Let's see what they do...", {
								type: "trade",
								oldPiece: enemyG1,
								newPiece: oldState.getPieceInStashByType(yourSmall[0] + "1"),
							}];
						}
					}
				},
				nextStep: function(oldState) {
					// Did you discover or trade?
					// (the enemy never discovers anything)
					if (oldState.nextSystemID === 4) {
						return "discovery-branch";
					} else {
						// detect which ship you traded for
						const pieces = oldState.getAllPiecesAtSystem(1);
						let smallShip = null;
						for (let i = 0; i < pieces.length; i++) {
							// it must be a small and owned by you (i.e. not a star)
							if (pieces[i].serial[1] === "1" && pieces[i].owner === "you") {
								smallShip = pieces[i].serial;
							}
						}
						
						if (smallShip[0] === "y") {
							// because yellow is the color of discovery AND there is still a Y1 in the bank
							return "trade-yellow-branch";
						} else {
							// because you can build mediums after the enemy copies you
							return "trade-medium-branch";
						}
					}
				},
			},
			
			// Branch 1: Discovery
			{
				id: "discovery-branch",
				startMessages: [
					"Now you have a second colony!",
					"However, you only have one ship at each of your systems. Let's get more ships!",
				],
				objective: "Build another ship",
				hint: "Just build a new ship. Either system is fine.",
				checkAction: function(action, oldState) {
					if (action.type === "trade") {
						return [false, "Hmmm... If you trade that, you'll no longer have green at that system, making it difficult to build more ships. It's better to trade when you have TWO ships."];
					} else if (action.type === "move" || action.type === "discover") {
						return [false, "No! Don't abandon your homeworld!"];
					} else if (action.type === "sacrifice") {
						return [false, "Sacrificing now doesn't really help. The small only gets you 1 build and losing your large now abandons your homeworld."];
					} else {
						return [true];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything yet! Don't end your turn yet."];
					} else {
						return [true, "Good. Three ships already! You're on a roll!", {
							type: "build",
							newPiece: oldState.getPieceInStashByType('y1'),
							system: 2,
						}];
					}
				},
			},
			{
				startMessages: [
					"So there's one small yellow left in the bank.",
					"Let's get it while we can!...",
					"Wait a second... didn't I say NOT to do that sort of thing?",
					"Well, for one, you don't have any yellow, so if you don't get it now you may never get a chance.",
					"The other reason has to do with catastrophes. Here, if your opponent gets a medium, you can get one safely.",
					"That's not the case if you have 3 greens in one system; you'd just create a catastrophe if you built a 4th.",
					"So you have to keep an eye not just on the Bank but also the population of your systems.",
					"Anyway, let's trade for yellow.",
				],
				hint: "It's usually good to trade where you have two ships.",
				checkAction: function(action, oldState) {
					if (action.type === "trade") {
						if (action.newPiece[0] !== "y") {
							return [false, "That's fine, but let's trade for the small YELLOW ship. It's in short supply!"];
						} else if (action.newPiece[1] !== "1") {
							return [false, [
								"That's fine, but it's usually better to trade your small pieces, if you can.",
								"Besides, in this case you don't want your large to be blue or yellow, because that is a catastrophe danger (it only takes 2 more of that color).",
							]];
						} else {
							// check if you have another ship there
							const system = oldState.map[action.oldPiece].at;
							const pieces = oldState.getAllPiecesAtSystem(system);
							let foundOtherShip = false;
							for (let i = 0; i < pieces.length; i++) {
								// it must be yours and different from the trading piece
								if (pieces[i].owner === "you" && pieces[i].serial !== action.oldPiece) {
									foundOtherShip = true;
									break;
								}
							}
							
							if (foundOtherShip) {
								return [true];
							} else {
								return [false, "You could trade that, but then you would no longer have green at that system.\nIt's better to trade when you already have 2 ships there."];
							}
						}
					} else if (action.type === "move" || action.type === "discover") {
						return [false, "No! Don't abandon your homeworld or you lose!"];
					} else {
						return [false, "That's possible, but you probably want to grab that small yellow while you can."]
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything yet! Don't end your turn now."];
					}
					
					return [true, "Now medium yellows are available. This game is heating up fast!", {
						type: "build",
						newPiece: "y2B",
						system: 2,
					}];
				},
			},
			{
				startMessages: [
					"As expected, your opponent just got a medium yellow. Let's get one of our own!",
				],
				hint: "Come on... you don't need a hint...",
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						if (action.newPiece[0] !== "y") {
							return [false, "You could build green, but that only gives you a small. Let's get a medium ship!"];
						} else {
							return [true];
						}
					} else if (action.type === "sacrifice") {
						if (action.oldPiece[1] === "3") {
							return [false, "That's still a *bit* premature, but I like that you're thinking of that sacrifice."];
						} else {
							return [false, "Sacrificing a small *is* useful when you don't have power to do an action somewhere. But right now, that doesn't really apply."];
						}
					} else {
						return [false, "There's no real need to " + action.type + " anything right now. Let's get a medium-size ship!"];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything yet, so don't waste your turn!"];
					}
					
					return [true, "Look, larges are available... but your opponent can't build more without a catastrophe. What will they do instead?", {
						type: "trade",
						oldPiece: "y2B",
						newPiece: "r2C",
					}];
				},
			},
			{
				startMessages: [
					"Your opponent just traded and got a red ship.",
					"(Notice how by trading their existing medium, they were able to get a medium red without getting small reds first. This can be useful sometimes.)",
					"Right now you are totally defenseless if they were to attack (i.e. send ships into your colonies).",
					"It may take a few turns for them to reach you, but it's generally better to be prepared.",
					"Let's get a red ship of our own.",
				],
				hint: "In this case you probably want to trade one of the yellows.",
				checkAction: function(action, oldState) {
					if (action.type === "trade") {
						if (action.newPiece[0] === "r") {
							if (action.oldPiece[0] === "y") {
								return [true]; // per-action messages are a bit annoying and I want to encourage end-turn
							} else {
								return [false, [
									"You probably don't want to trade your green away. If you do, you no longer have build power there.",
									"It's better to trade when you have a second ship of the old color, if you can. Can you do that?",
								]];
							}
						} else {
							// didn't take a red
							return [false, "Right now it would be better to trade for a red piece, as a deterrent against invasions."];
						}
					} else if (action.type === "sacrifice") {
						return [false, [
							"Hmmmm... Sacrifices don't really help you here. You already have all the color abilities you need.",
						]];
					} else {
						// didn't trade
						return [false, [
							"While there's no pressing need to trade right now, you don't want to put it off TOO long.",
							"It's better to be safe and trade now, and besides, you get to build more red next turn!",
						]];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything yet... don't end your turn yet!"];
					}
					
					return [true, [
						"There you go! You have a weapon that you can use (or sacrifice, if needed) to capture invaders!",
						"Also, it's just often good to diversify your fleet so you have more options.",
						"Anyway, the next goal would be to build even more ships, maybe discover another system, maybe get some blue ships.",
					], {
						type: "discover",
						oldPiece: "r2C",
						newPiece: "g2B",
					}];
				},
				// automatically go to the end
				nextStep: function() {
					return 999;
				},
			},
			
			// Branch 2: Trade for Yellow
			{
				id: "trade-yellow-branch",
				startMessages: [
					"I see you have a yellow ship. Good choice, actually.",
					"It may look redundant, but it's actually good to have yellow ships, particularly Y2s (i.e. medium yellows) and Y3s (larges), so you can later sacrifice for several moves at once.",
					"It looks like your opponent also traded for yellow. They couldn't move, anyway.",
					"There's one Y1 (small yellow) ship left. You probably shouldn't take it, because (1) you already have yellow and (2) it lets your opponent get mediums.",
					"So what else can you do?",
					"There's not much going on, so how about just building a small green?",
				],
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						if (action.newPiece[0] === "y") {
							return [false, [
								"Hmmmm... If you take the last Y1 (small yellow), then your opponent can build a medium right away.",
								"Additionally, you would have 3 yellows at home (2 ships and 1 star). You couldn't build your own Y2 (medium yellow) without a catastrophe.",
								"So it's probably better to build a small green.",
							]];
						} else {
							return [true];
						}
					} else if (action.type === "discover") {
						if (action.oldPiece === "g3C") {
							return [false, [
								"Oh, you don't want to move your large. It's usually not good to leave your homeworld without a large defender.",
								"Also, you would be leaving your homeworld without green, so you wouldn't even be able to build there!",
							]];
						} else {
							// you move out the yellow
							// it's not 
							if (action.newPiece[0] === "g") {
								return [false, [
									"Hmmmm... That might actually be a good move. I'm not sure about this myself.",
									"The only problem I see is that you can't trade there. Unless you're in a race to get larges or something, it's usually good to have both green and blue at your colonies.",
									"That's why I would recommend you just build a G1 (small green) now.",
								]];
							} else if (action.newPiece[0] === "b") {
								return [false, [
									"Hmmm... That star isn't green, so you won't be able to build there.",
									"You could build a green and then move it there, but that takes time. What if you just build the green now?",
								]];
							} else {
								return [false, [
									"I wouldn't advise that, because you won't have the ability to build OR trade there.",
									"It's usually good to have both abilities. How about you build a green ship, and then maybe next turn discover a blue system with it?",
								]];
							}
						}
					} else if (action.type === "sacrifice") {
						return [false, "It's still a bit too early for sacrifices."];
					} else {
						return [false, "I think it would be better to focus on building more ships now."]
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything; don't end your turn yet!"];
					}
					
					return [true, [], {
						type: "build",
						newPiece: oldState.getPieceInStashByType("y1"),
						system: 2,
					}];
				},
			},
			{
				startMessages: [
					"Hey, they just grabbed the last small yellow! Didn't I say that was a bad idea?",
					"Well, let's see! Build that medium yellow that's now available!",
				],
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						if (action.newPiece[0] === "g") {
							return [false, "You could build green, but there's something even better you can build!"];
						} else {
							return [true];
						}
					} else if (action.type === "sacrifice") {
						return [false, "Sacrificing doesn't really get you anything here, because you already have build power. What about just building a medium yellow?"]
					} else {
						return [false, "That's possible, but there's a medium yellow available. How about building one?"];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything, so don't end your turn!"];
					}
					
					return [true, [], {
						type: "build",
						newPiece: oldState.getPieceInStashByType("y2"),
						system: 2
					}];
				},
			},
			{
				startMessages: [
					"...and then they got a medium of their own, of course.",
					"Notice how that was actually safe, because they only have 3, and you can't get a fourth in.",
					"In general, if you open up the mediums, make sure you can get one of your own safely (or your opponent can't)...",
					"So now you are at another decision point. Your homeworld is getting crowded with yellow.",
					"This might be a case where you discover a green system with yellow, so you don't fall behind getting larges.",
					"But that has the downside that you won't have trade ability there.",
					"Alternatively, you can trade one of your yellows for blue or red.",
					"It's your choice between those three options: discover a green star, trade for blue, or trade for red.",
				],
				hint: [
					"Option 1: Discover a green star with one of the yellows.",
					"Option 2: Trade one of the yellows for a blue.",
					"Option 3: Trade one of the yellows for a red.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "trade") {
						if (action.oldPiece[0] !== "y") {
							return [false, [
								"That's possible, but your homeworld is a little crowded with yellow.",
								"I would advise trading out yellow so you're not so close to a catastrophe.",
							]];
						} else if (action.newPiece[0] === "g") {
							return [false, [
								"Trading for green is possible, but it's usually better in the opening to trade for a color you DON'T already have.",
								"Or at least one you don't have at the system.",
								"How about getting blue or red?",
							]];
						} else if (action.newPiece[0] === "r") {
							return [true, [
								"Ah, you picked red!",
								"Red is a good color to have because it deters invasions from enemy ships.",
								"In fact, many players recommend that when your opponent gets red, you should as well.",
								"And in general, it's good to diversify your fleet so you have more options.",
							]];
						} else if (action.newPiece[0] === "b") {
							return [true, [
								"Ah, you picked blue!",
								"Blue is good for exploring. You can discover a green system and then start building AND trading!",
								"And in general, it's good to diversify your fleet so you have more options.",
							]];
						}
						// you can't trade yellow for yellow so there is no else
					} else if (action.type === "discover") {
						if (action.oldPiece[0] === "g") {
							return [false, [
								"You know, normally I would actually advise using a green to discover.",
								"But here, you are so cramped in yellow that you probably want to get one of them out of your homeworld.",
							]];
						} else {
							return [true, [
								"So you were adventurous...",
								"I mean, it's not perfect, but hey, you're one turn away from getting a Y3 (large yellow)...",
								"...unless your opponent does something else, of course.",
							]];
						}
					} else if (action.type === "build") {
						return [false, "That's possible, but I really don't like holding two ships that match one of my home stars. You don't want to forget and find half your homeworld destroyed by a catastrophe..."];
					} else {
						return [false, "I don't think sacrificing really helps you right now. You don't need to do multiple moves and you already have green and yellow power anyway."];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "It's a little too early to end your turn... you haven't yet done anything."];
					}
					// check if the y1A is owned by the enemy so they can trade it
					const tradeY1A = (oldState.map.y1A && oldState.map.y1A.owner === "enemy");
					return [true, [], {
						type: "trade",
						// we know the opponent controls two of the Y1s but we do not know which
						oldPiece: tradeY1A ? "y1A" : "y1B",
						newPiece: oldState.getPieceInStashByType("r1"),
					}];
				},
				nextStep: function(oldState) {
					// Your homeworld
					const pieces = oldState.getAllPiecesAtSystem(1);
					// check for red in your homeworld
					for (let i = 0; i < pieces.length; i++) {
						// ignore stars
						if (pieces[i].owner !== "you") {
							continue;
						}
						const serial = pieces[i].serial;
						if (serial[0] === "r") {
							// you traded for red
							// move to the "please discover a system" if you did not already do so
							// (6 = 4 ships + 2 stars)
							return pieces.length < 6 ? Infinity : 2;
						}
					}
					
					// no red found, so move to the next slide
					return 1;
				},
			},
			// optional step if they don't trade for red in the above branch
			{
				startMessages: [
					"Oh, looks like your opponent got a red ship! They're ready to fight!",
					"Since you don't have a red ship, you probably should get one.",
					"Now, you have four ships, so which one should you trade?",
					"I would suggest you trade out ships when you have a second ship of the same color (as the OLD ship), preferably in the same star system.",
				],
				objective: "Trade for red",
				hint: [
					"You only have one yellow at home, but two greens. How about trading a green?",
				],
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice" && action.oldPiece[0] === "g") {
						return [false, "I like what you're thinking, but I'm afraid it's a bit premature.\nYou don't have very much room to safely store all the ships you would be building."];
					} else if (action.type !== "trade") {
						return [false, "That's possible, but you are going to want to get red at some point. Why not get it now?"];
					} else if (action.newPiece[0] !== "r") {
						return [false, "I would recommend you trade for *red*, because you can defend yourself better."];
					} else if (action.oldPiece[0] !== "g") {
						// note: this means they traded their only ship of that color in the homeworld
						const fullColor = {
							b: "blue",
							r: "red",
							y: "yellow",
						}[action.oldPiece[0]];
						return [false, "Hmmmm... You only have one " + fullColor + " ship at your homeworld. Do you really want to trade it away? You have two green ships..."];
					} else if (action.oldPiece[1] !== "1") {
						// this means they traded the G3, not the G1
						return [false, [
							"Ooh, that's interesting... But I don't know that you really want to trade away your large green.",
							"If you keep the large green, you can later sacrifice it for 3 build actions, and hopefully get one or two large ships in the process.",
							"(Besides, having an R3 as your large homeworld defender can create a false sense of security -- see Direct Assault 2.0 in Advanced for why.)",
						]];
					} else {
						return [true, "There you go! Your opponent won't be able to cause trouble without a lot more preparation..."];
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					return [true, [], {
						type: "build",
						newPiece: oldState.getSmallestPieceInStash("g"),
						system: 2,
					}];
				},
				nextStep: function(oldState) {
					if (oldState.nextSystemID === 3) {
						// No systems have been discovered.
						return 1;
					} else {
						return Infinity;
					}
				},
			},
			// optional step if they have never discovered any systems
			// this is only possible if you either have green or blue
			// ...at least I think so...
			{
				startMessages: [
					"Well... it looks like you have not yet discovered any systems!",
					"At some point you'll have to do that, so let's do so.",
					"If possible, your ship should be green or blue, and the star blue or green respectively.",
					"Of course that's not always convenient or even possible, but at the very least, make sure you at least have one colony with green there.",
					"Here I really don't care what you discover, as long as you have build power there (and you keep your large at home)."
				],
				objective: "Discover a new star; the ship or star (but not both!) should be green",
				checkAction: function(action, endTurn) {
					if (action.type === "discover") {
						const shipGreen = (action.oldPiece[0] === "g");
						const starGreen = (action.newPiece[0] === "g");
						if (shipGreen && starGreen) {
							return [false, [
								"Oh, no, you don't want BOTH the ship and star to be green. That's wasted potential and it is also a catastrophe risk.",
								"Try discovering a blue system instead!",
							]];
						} else if (shipGreen || starGreen) {
							if (action.oldPiece[1] === "3") {
								return [false, [
									"It's not a good idea to move out your large ship. It leaves you vulnerable if your opponent gets one in.",
									"I know the opponent isn't really in position to attack you, but you don't want to forget and lose to a yellow sacrifice later...",
								]];
							} else {
								return [true];
							}
						} else {
							return [false, "Hmmmm... I think you would be better off having green there, so that you can build new ships if a good opportunity arises."]
						}
					} else {
						return [false, [
							"That's possible, but you really should discover new systems. It gives you more space to expand your fleet.",
						]];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "Don't end your turn yet, you still have discoveries to make!"];
					}
					
					return [true];
				},
				nextStep: function() {
					return Infinity; // branch concluded
				},
			},
			
			// Branch 3: Trade for a blue or red.
			// This lets you build a medium. It quickly branches further...
			{
				id: "trade-medium-branch",
				startMessages: [
					"So about grabbing the last available small of a color...",
					"...I told you not to, and then your opponent did it!",
					"They've opened up the medium ships for building. Let's build one!",
				],
				objective: "Build a medium ship",
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						if (action.newPiece[1] !== "2") {
							return [false, "That's possible, but you can get a medium ship!"];
						} else {
							return [true];
						}
					} else if (action.type === "sacrifice") {
						return [false, "Sacrifices don't really help you right now, because you already have the ability to build and trade in your homeworld."];
					} else {
						return [false, "That's possible, but if you do a build now, you can actually get a medium ship!"];
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					const smallestRed = oldState.getSmallestPieceInStash("r");
					// if reds aren't available then we can build blues instead
					const buildType = (smallestRed[1] === "2") ? "r2" : "b2";
					return [true, [], {
						type: "build",
						newPiece: oldState.getPieceInStashByType(buildType),
						system: 2,
					}];
				},
				nextStep: function(oldState) {
					// either red or blue has no smalls left
					const smallestRed = oldState.getSmallestPieceInStash("r");
					if (smallestRed[1] === "1") {
						// there are small reds left so you got blue ships
						return "medium-blue-branch";
					} else {
						// no small reds are available so you took them all
						return "medium-red-branch";
					}
				},
			},
			
			// Branch 3a: You already have red
			{
				id: "medium-red-branch",
				startMessages: [
					"...and then they built their own medium red.",
					"Both you and your opponent have red, so neither side can really get aggressive for a while. (It's good to have red if your opponent does too.)",
					"So what should you do next? You could build *another* medium red...",
					"Or you could trade the one you have for a different color, like blue or yellow.",
					"Blue might actually be good, so that you can still trade when you discover new stars...",
					"Either that, or just get another red.",
				],
				objective: "Build another red or trade for a new color",
				checkAction: function(action, oldState) {
					// homeworld should be G3, R1, R2
					if (action.type === "trade") {
						if (action.oldPiece[0] === "g") {
							return [false, "You don't want to trade away your only green ship, because then you won't be able to build!"];
						} else if (action.newPiece[0] === "g") {
							return [false, [
								"Hmmm... Do you really want to trade for a green? You already have it.",
								"If you're going to trade, why not get a new color, like blue or yellow?",
							]];
						} else {
							// you traded for not green
							return [true];
						}
					} else if (action.type === "build") {
						if (action.newPiece[0] === "r") {
							// you built a red
							return [true];
						} else {
							return [false, "You could build green, sure, but why not build a medium red instead? You would only be at 3 reds..."]
						}
					} else if (action.type === "discover") {
						if (action.oldPiece[0] === "g") {
							// discovering with a green i.e. your G3
							return [false, [
								"Hmmm... You don't want to leave your homeworld without a large ship, because you risk being invaded, unable to fight back.",
								"(You aren't at risk now, but you don't want to forget.)"
							]];
						} else if (action.newPiece[0] === "g") {
							// discovering a green star
							return [false, "That's possible, but I don't agree with discovering with a red ship (unless you really need to). You could build more red there, but you won't be able to trade them or even move away."];
						} else {
							// discovering a non-green star
							return [false, "Hmmm... in the opening you almost always want to have build power (and ideally, trade power) at any system you discover."];
						}
					} else {
						return [false, "Hmmm... I'm not sure that sacrificing really helps here because you already have all 4 color powers."];
					}
				},
				requireAction: true,
				// allowed actions: trade red for not green OR build another red
				checkEndTurn: function(oldState) {
					// opponent built a medium last turn and wants to trade for a Y2
					let enemyMedium = null;
					const pieces = oldState.getAllPiecesAtSystem(2);
					for (let i = 0; i < pieces.length; i++) {
						if (pieces[i].serial[1] === "2") {
							enemyMedium = pieces[i].serial;
						}
					}
					console.log(enemyMedium, oldState.getPieceInStashByType("y2"));
					return [true, "There you go. Let's see what happens now...", {
						type: "trade",
						oldPiece: enemyMedium,
						newPiece: oldState.getPieceInStashByType("y2"),
					}];
				},
				nextStep: function(oldState) {
					// if you have two R2s, go to the trade phase, otherwise go to the build phase
					let r2sAt1 = 0;
					const pieces = oldState.getAllPiecesAtSystem(1);
					for (let i = 0; i < pieces.length; i++) {
						if (pieces[i].serial.substring(0, 2) === "r2") {
							r2sAt1++;
						}
					}
					
					if (r2sAt1 === 2) {
						return "medium-red-2";
					} else {
						return "medium-red-1";
					}
				}
			},
			{
				id: "medium-red-2", // because you have 2 medium reds
				startMessages: [
					"Getting greedy, huh?",
					"Of course, your opponent just got a Y2, so you need to start being careful of catastrophes.",
					"So what's next? You *could* try to continue with the red economy by discovering a green system.",
					"But then you won't be able to do anything when you do get the ships (like trade them). That's not really comfortable...",
					"Probably a good thing now would be to trade one of the R2s for a different color.",
				],
				objective: "Trade away one of the medium reds",
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						if (action.newPiece[0] === "r") {
							return [false, "You don't want to build a fourth red at the same star system. That would cause a catastrophe!"]
						} else {
							return [false, "Building green is possible, but I don't like the look of 3 reds in one system when your opponent has movement abilities."];
						}
					} else if (action.type === "trade") {
						if (action.oldPiece[0] === "g") {
							return [false, "You don't want to trade away your green! Then you won't be able to build at your homeworld anymore."];
						} else if (action.newPiece[0] === "g") {
							return [false, "You could trade for green, but there are still two colors you don't have yet.\nWhy not get into blue or yellow? You'll need them at some point."];
						} else {
							// The only good option: trade a non-green (thus red) for a non-green (thus blue or yellow)
							return [true];
						}
					} else if (action.type === "discover") {
						if (action.oldPiece[0] === "g") {
							return [false, "You don't want to move your large green out. You won't be able to build at your homeworld! (And leaving your home without a large makes you vulnerable to invasions...)"];
						} else if (action.newPiece[0] === "g") {
							return [false, [
								"That's tempting. But you won't have blue power there, so you won't be able to trade (or move!) the ships once you build them.",
								"For now I would advise you consider trading for blue or yellow.",
								]];
						} else {
							return [false, "That's possible, but you don't have the ability to build there. Unless you know what you are doing, you'll find it difficult to advance."];
						}
					} else {
						return [false, "I don't think a sacrifice really helps you here. (Did you mis-click?)"];
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					return [true, "Good. You are diversifying! That's usually a good thing because you get more options.", {
						type: "build",
						oldPiece: oldState.getSmallestPieceInStash("y"), // which is a y1
					}];
				},
			},
			{
				id: "please-discover",
				// NOTE: The next branch also uses this
				startMessages: [
					"Hmmm... It looks like you've played the whole game from inside your homeworld!",
					"That will only get you so far. Let's discover a new star system.",
					"Now, which ship should lead the way?",
					"I would recommend sending the one you traded.",
					"Why? Partly because your homeworld is blue+yellow, so holding blue and yellow ships becomes a catastrophe risk later on (when your opponent is more mobile).",
					"Additionally, sending red ships to green systems means you won't be able to move OR trade the ships you build.",
					"So let's discover a new star!",
				],
				objective: "Discover a new star system",
				hint: "You want to make sure you have green power there.",
				checkAction: function(action, oldState) {
					if (action.type === "discover") {
						if (action.oldPiece[1] === "3") {
							return [false, "Hmmm... I don't think you want to leave your homeworld without a large ship defender! You aren't in danger now, but it is easy to forget."];
						} else if (action.oldPiece[0] !== "g" && action.newPiece[0] !== "g") {
							// no green
							return [false, "You're getting there! That system isn't green, so you won't be able to build there. Can you try a green system?"]
						} else if (action.oldPiece[0] === "r" || action.newPiece[0] === "r") {
							// must be a green/red combo, probably the worst
							return [false, "Almost... but you can neither move nor trade there, which isn't comfortable. How about using a different color?"];
						} else if (action.oldPiece[0] === "g" && action.newPiece[0] !== "b") {
							// green ships should go to blue systems
							return [false, "Hmmm... if you have a green ship, why not discover a BLUE star? Then you'll be able to trade, too!"];
						} else {
							return [true];
						}
					} else if (action.type === "build") {
						// 5 = 2 stars + 3 ships
						if (oldState.getAllPiecesAtSystem(1).length <= 5) {
							// translation: all right, have it YOUR way...
							return [true, "Eh, I can see why you might want another ship before you venture out."];
						} else {
							// you already have 4 ships
							return [false, "Hmmm... it's getting crowded in there. You really should expand to new colonies..."];
						}
					} else {
						return [false, "That's possible, but let's discover a new system now before we forget."];
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					if (oldState.nextSystemID === 3) {
						return [true, [], {
							type: "build",
							newPiece: oldState.getPieceInStashByType("g1"),
							system: 2,
						}];
					}
					return [true];
				},
				// always go to the end
				nextStep: function() {
					if (oldState.nextSystemID === 3) {
						return 0; // do it again if they don't discover
					}
					return Infinity;
				},
			}, // discover a system
			
			// Branch 3a but where you trade away a red instead of building
			{
				// Here you don't build an R2 but instead trade a red for something
				// I don't know if you traded the medium or the small red
				id: "medium-red-1",
				startMessages: [
					"You have three colors now!",
					"You'll probably want to discover a new system at some point, but you don't have to do it right now.",
					"Personally I would probably just build, but you can also discover with the ship you just traded.",
				],
				checkAction: function(action, oldState) {
					const canBuildR2 = (oldState.getPieceInStashByType('r1') === null);
					if (action.type === "build") {
						if (canBuildR2 && action.newPiece[0] !== "r") {
							// if you can build R2, allow only that build
							return [false, "You could build that small, but there's a medium red for the taking!"];
						} else {
							// either they built an R2, or else they can't and so any build is perfectly fine
							return [true];
						}
					} else if (action.type === "discover") {
						if (action.oldPiece[1] === "3") {
							return [false, "I like what you're thinking, but you don't want to leave your homeworld without a large! Try using the ship you just traded."];
						}
						
						// at this point you have a G3, a red, and a traded piece (blue or yellow)
						if (action.newPiece[0] !== "g") {
							return [false, "Ah, you're being adventurous! You might not want *that* particular piece as your star, because you will not be able to build there. Try a green star!"];
						} else if (action.oldPiece[0] === "r") {
							return [false, "Ah, you're being adventurous! While you can build there, you won't be able to trade or move the ships once you do. Try using your other ship instead!"];
						} else {
							// message because they are going to end the module
							return [true, "Yay, you are exploring strange new worlds! Good job!"];
						}
					} else if (action.type === "trade") {
						return [false, "Hmmm... Trading doesn't look useful right now because you would no longer have the color you traded out. It's usually better to build a second ship of a color before trading."];
					} else {
						return [false, "I'm not really sure what sacrificing does for you... (did you mis-click?)"]
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					return true;
				},
				nextStep: function(oldState) {
					if (oldState.nextSystemID === 3) {
						return "please-discover";
					}
					
					return Infinity;
				},
			}, // (sometimes feeds back to the "please discover")
			
			// Branch 3b: Traded for a blue instead.
			// Are we *done* yet?
			{
				id: "medium-blue-branch",
				startMessages: [
					"...of course, because THEY can also safely build a medium blue.",
					"I mean, three of a color is \"safe\", because here neither one of you has enough movement yet to get a 4th blue into the other's homeworld...",
					"This might be a good time to discover a new system, so you can safely store more blue ships.",
				],
				objective: "Discover a new system (other actions are not supported)",
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						if (action.newPiece[0] === "b") {
							return [false, "You don't want to build any more blue! You would have 4 blues at the same system, which makes a catastrophe!"];
						} else {
							// must be green
							return [false, [
								"Hmmm... Building a small green is possible here, but it's kind of passive.",
								"If you discover a new star with one of the blues, you would have room to build mediums and maybe even larges."
							]];
						}
					} else if (action.type === "trade") {
						// this isn't great User Experience, but a broken tutorial is even worse and never finishing is still worse
						return [false, [
							"[searches for an excuse not to allow that, even though the real reason is my laziness]",
							"I mean, if you do discover now, you can start getting more ships faster.",
						]];
					} else if (action.type === "discover") {
						if (action.oldPiece[1] === "3") {
							return [false, "You always want to keep a large ship at home. You don't want to forget and get invaded later!"];
						} else if (action.newPiece[0] !== "g") {
							return [false, "Almost there! You won't have the ability to build new ships, though. What if you try a green star?"];
						} else {
							return [true];
						}
					} else {
						return [false, "I'm not really sure how that would help you..."]
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					// TODO: If statement that checks branches
					if (true) {
						return [true, "Of course, you're not going to be the only one grabbing all the blue...", {
							type: "trade",
							oldPiece: oldState.getPieceInSystemByType("b2", 2),
							newPiece: oldState.getPieceInStashByType("y2"),
						}];
					} else {}
				},
				nextStep: function(oldState) {
					if (true) {
						return "medium-blue-discover";
					}
				},
			},
			
			// branch 3b1 (currently the only 3b sub-branch)
			{
				id: "medium-blue-discover",
				startMessages: [
					"Well, it seems your opponent realized they couldn't leave their home...",
					"They probably *should* have traded the small, because right now you can grab another medium blue...",
				],
				objective: "Build a medium blue",
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						if (action.newPiece[0] === "g") {
							return [false, "That's possible, but why build a small green when you can build a medium blue?"];
						} else if (action.system === 1) {
							// don't build in your homeworld (wasted move)
							return [false, [
								"Hmmm... That's interesting, but where is that ship going to go?",
								"There are no more G3s in the Bank for stars, so you'd probably just move it to the star system that's already on the board.",
								"So why not save a turn, and build there directly?",
							]];
						} else {
							return [true];
						}
					} else {
						return [false, "That's possible, but there's a medium blue for the taking right now. How about building it?"];
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					// they just discover a star
					return [true, [], {
						type: "discover",
						oldPiece: oldState.getPieceInSystemByType("b1", 2),
						newPiece: "g2A",
					}];
				},
			},
			{
				startMessages: [
					"OK, they moved out. Now you have to be careful.",
					"Can you see what bad thing would happen if you built another blue in your homeworld?",
					"(Maybe you can't because I'm covering it.)",
					"Probably at this point I would trade one of the blues at system 3 (\"your\" green star) for another color, like yellow or red.",
				],
				objective: "Trade one of the blue ships",
				checkAction: function(action, oldState) {
					if (action.type === "trade") {
						if (action.oldPiece[0] === "g") {
							// trading OUT a green
							return [false, "Hmmm... You don't really want to trade away your only green. You would not be able to build more ships in your homeworld!"];
						} else if (action.newPiece[0] === "g") {
							// trading FOR green
							return [false, "Hmmm... Trading for green is possible, but you haven't gotten red OR yellow yet. Why not get a new color going?"];
						} else if (oldState.map[action.oldPiece].at === 1) {
							// i.e. are you trading at your homeworld?
							return [false, [
								"Hmmm... I like how you're thinking about getting blue out of your homeworld.",
								"But I think you might find that blue helpful later, for example, if you were discovering a second star system.",
								"You have two blues at the green star -- how about trading one of them, so you have more build options?",
							]];
						} else {
							// it's good
							return [true];
						}
					} else if (action.type === "build") {
						if (action.newPiece[0] === "b") {
							return [false, "You don't want to do that! Your opponent could then build a large blue, and you have nowhere safe to build your own!"];
						} else {
							return [false, "That's possible, but it's a bit passive. How about trading one of your ships for a yellow or a red?"]
						}
					} else {
						return [false, "That's possible, but I'm not really sure what that does for you. How about trading to get yellow or red?"];
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					const buildBlue = oldState.getSmallestPieceInStash('b');
					if (buildBlue[1] === "2") {
						// they can build a medium
						return [true, "Good. Looks like you left your opponent a B2, but that's okay...", {
							type: "build",
							newPiece: buildBlue,
							system: 4, // their colony
						}];
					} else {
						return [true, "Good. I like how you traded away your small to stop your opponent from getting medium blue!", {
							type: "build",
							// they don't want to build a B1 that would open B2s for you
							newPiece: oldState.getPieceInStashByType('y1'),
							system: 2, // their homeworld
						}];
					}
				},
			},
			{
				startMessages: [
					"I'll let you figure out this one on your own.",
					"But here's a good rule of thumb for the opening...",
					"You usually don't want to trade out, or move out, the only ship of a color in some system.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "trade" || action.type === "move" || action.type === "discover") {
						// interestingly enough, in this board state you definitely have no repeat colors in any systems (not counting stars)
						const oldColor = {
							g: "green",
							b: "blue",
							y: "yellow",
							r: "red",
						}[action.oldPiece[0]];
						// "move" makes more sense in the sentence than "discover"
						const verb = (action.type === "discover" ? "move" : action.type);
						return [false, [
							"Hmmm... That's your only " + oldColor + " ship at that system. Do you really want to " + action.type + " it away?",
						]];
					} else if (action.type === "build") {
						const smallestBlue = oldState.getSmallestPieceInStash('b');
						if (action.system === 1) {
							return [false, "Hmmm... Building at your homeworld seems rather passive right now. You have a colony that's closer to the action; how about building there?"];
						} else if (smallestBlue[1] === "2" && action.newPiece[0] !== "b") {
							return [false, "Hmmm... That's possible, but there's a medium blue for the taking. How about you build it?"];
						} else {
							return [true];
						}
					} else {
						return [false, "Hmmm... Sacrificing is just a bit too risky right now. The only sacrifice maybe worth taking is your G3, but you wouldn't really have that much space to store your new ships..."];
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					// They move their Y2 to their colony, to ward off invasions
					return [true, [], {
						type: "move",
						oldPiece: oldState.getPieceInSystemByType("y2", 2),
						system: 4,
					}];
				},
				/*nextStep: function(gameState) {
					// Tell them to trade for either red or yellow
					for (let serial in gameState.map) {
						const data = gameState.map[serial];
						if (data && data.owner === "you") {
							if (serial[0] === "y") {
								// You have a yellow ship
								return "medium-blue-with-yellow";
							}
							if (serial[0] === "r") {
								return "medium-blue-with-red";
							}
						}
					}
					// you HAVE to have yellow or red, right?
					alert("Hmmm... This is a bug. I was expecting you to have a yellow or a red ship.");
					return Infinity;
				},*/
			},
			
			// *sigh* MORE branching... or maybe not?
			{
				id: "medium-blue-with-red",
				startMessages: [
					"You're doing really well here!",
					"There's still, however, one color you don't yet have...",
				],
				objective: "Trade to unlock the last color!",
				checkAction: function(action, oldState) {
					// ok
					// make sure that after you do the trade you have the right colors
					if (action.type === "trade") {
						// block homeworld trades
						if (action.system === 1) {
							return [false, [
								"Hmmm... That's possible, but it's a bit passive. You've got a lot of potential at your green star colony. How about trading there?",
								"If you trade at the green star, you'll be ready to build ANY of the three colors next turn!",
							]];
						}
						
						// this was used so rarely
						// but I need it here
						// yay for immutable GameStates!
						const newState = oldState.doTrade("you", action.oldPiece, action.newPiece);
						const newPowers = newState.getPowersAtSystem("you", 1);
						// annoyingly difficult routine to get the color you DONT have
						let missingColor = null;
						const checkColors = ["b", "r", "y"];
						for (let i = 0; i < checkColors.length; i++) {
							const color = checkColors[i];
							if (!newPowers[color]) {
								// you don't have that power
								missingColor = color;
							}
						}
						// all right
						// if you didn't miss any, you're good
						if (!missingColor) {
							// success
							// let's personalize the message
							const lastMessage = "Your empire is growing quickly. I think you've picked the best branch out of all of them!";
							if (action.newPiece[0] === "r") {
								return [true, [
									"Great! You have a weapon now, so you're protected from enemy invasions!",
									lastMessage,
								]];
							} else if (action.newPiece[0] === "y") {
								return [true, [
									"Great! Now you have movement, so you can discover even more systems!",
									lastMessage,
								]];
							}
							return [true];
						} else {
							// how did this happen?
							if (newPowers[action.oldPiece[0]]) {
								// you still have what you traded out.
								// Must be something like BBY -> BYY.
								return [false, [
									"Hmmm... Did you mis-click? It looks like you traded for a color you already have there.",
								]];
							} else {
								// you traded your last blue/red/yellow, noooo!
								return [false, [
									"Almost there! You don't want to trade that piece -- you won't have that color anymore! Try trading a different piece.",
								]];
							}
						}
					} else if (action.type === "build") {
						if (action.newPiece[0] === "b") {
							// that's always going to be 3 blues
							// I think...
							if (action.system === 3) {
								return [false, "Oh... that's not safe... your opponent can move in and cause a catastrophe!"];
							} else {
								return [false, "Oh... that's three blue pieces in your homeworld... your opponent could sacrifice their Y2 and knock out half your homeworld!"];
							}
						} else {
							return [false, "That's a fine option, but why not trade and get access to the last color? You'll need all four and you'll have more options."];
						}
					} else if (action.type === "discover" || action.type === "move") {
						return [false, "Hmmm... That's possible, but why not get the last color BEFORE you spread your fleet out? Then you'll have more build options!"]
					}
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					return [true, [
						"Just a bit of trivia...",
						"Some people call a system like that a \"Happy System\". You have one piece of each color, including stars.",
						"It's good because you have lots of options and are not even close to catastrophe danger.",
					], {
						type: "trade",
						oldPiece: oldState.getPieceInSystemByType("b2", 4),
						newPiece: oldState.getPieceInStashByType("r2"),
					}];
				},
				nextStep: function() {
					return Infinity;
				},
			},
			
			// wow
			
			// it's REALLY THE END (and neat, it's on line 1280)
		],
		endMessages: [
			"Well, there you are. You have a solid position. Good job!",
			"I'm sorry to cut this off here, but you have to play the real game for more!",
			"This module actually has a LOT of different branches. You're welcome to try to find all of them!",
			"Anyway, I know there's a lot to keep track of, and you won't have my constant pestering every single move in a real game.",
			"The two important things are practice and vigilance. Always watch the Bank for opportunities.",
			"The next tutorial covers a particularly powerful opening trick you should watch out for.",
		],
	}),
	
	// Openings 2
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "freeze-out",
		title: "Opening Tricks: The Freeze-Out",
		startMap: {
			"b1A": null,
			"b1B": null,
			"b1C": null,
			"b2A": null,
			"b2B": null,
			"b2C": {"at": 2, "owner": null},
			"b3A": null,
			"b3B": null,
			"b3C": {"at": 1, "owner": null},

			"g1A": {"at": 1, "owner": "you"},
			"g1B": {"at": 2, "owner": "enemy"},
			"g1C": null,
			"g2A": null,
			"g2B": null,
			"g2C": null,
			"g3A": null,
			"g3B": {"at": 2, "owner": "enemy"},
			"g3C": {"at": 1, "owner": "you"},

			"r1A": {"at": 2, "owner": "enemy"},
			"r1B": {"at": 1, "owner": null},
			"r1C": null,
			"r2A": null,
			"r2B": null,
			"r2C": null,
			"r3A": null,
			"r3B": null,
			"r3C": null,

			"y1A": {"at": 1, "owner": "you"},
			"y1B": null,
			"y1C": {"at": 2, "owner": null},
			"y2A": null,
			"y2B": null,
			"y2C": null,
			"y3A": null,
			"y3B": null,
			"y3C": null,
		},
		steps: [
			{
				startMessages: [
					"So as we've seen, it is important to keep a close eye on the Bank.",
					"It's especially devastating if you manage to grab all the smalls of a particular color early on.",
					"This is known as a \"freeze-out\" because your opponent cannot trade for that color.",
					"Here's a concrete example. There is only one Y1 (i.e. small yellow) left in the Bank.",
					"Which means if you build it, the opponent won't be able to trade for it!",
				],
				hint: "Just read the intro again.",
				objective: "Build the last small yellow ship.",
				checkAction: function(action, oldState) {
					if (action.type !== "build") {
						return [false, "That's possible, but can we focus on building for now? You have a really strong choice here."];
					} else if (action.newPiece !== "y1B") {
						return [false, "That's possible, but if you build the Y1 (small yellow) then your opponent can't get any yellow..."];
					} else {
						return [true];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "Uhhh... did you click End Turn by mistake? You haven't done anything."];
					}
					return [true, "There you go. Let's see if your opponent is doing something...", {
						type: "trade",
						oldPiece: "g1B",
						newPiece: "b1A",
					}];
				},
			},
			{
				startMessages: [
					"All right. Now that you have control of the yellow economy, you can start rapidly building more ships.",
					"In fact, as long as your opponent continues to not have yellow, you can safely store 3 in one system.",
					"Although, be careful if you do this, because if you ever trade away a yellow your opponent can take it...",
					"Anyway, let's keep building. You have two colors available to build, but one gives you a medium ship...",
				],
				hint: "You can build a medium yellow now.",
				objective: "Build a medium-size ship",
				checkAction: function(action, oldState) {
					if (action.type !== "build") {
						return [false, "That's certainly possible, but why do that when you have a medium yellow waiting to be built?"];
					} else if (action.newPiece[1] === "1") {
						return [false, "That's certainly possible, but if you build in yellow, you get a bigger ship. Bigger is better!"];
					} else {
						return [true];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "I wouldn't end my turn before doing anything..."];
					}
					return [true, [], {
						type: "discover",
						oldPiece: "b1A",
						newPiece: "g3A",
					}];
				},
			}
		],
		endMessages: [
			"Well, you're on a roll now!",
			"You're already getting medium ships while your opponent is still getting smalls.",
			"Just... make sure YOU never get frozen out of a color...",
			"(at least not without a retaliatory freeze-out of a different colo...)",
			"If nothing else you can trade your initial large, although that can be awkward depending on the circumstances.",
			"Anyway, in the next module we will cover an interesting strategy that is a side-effect of the star abandonment rule!",
		],
	}),
	
	// Investment
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "investment",
		title: "Keep-Away and Investments",
		startMap: {
			"b1A": null,
			"b1B": null,
			"b1C": {"at": 5, "owner": null},
			"b2A": null,
			"b2B": {"at": 1, "owner": "you"},
			"b2C": {"at": 1, "owner": null},
			"b3A": null,
			"b3B": null,
			"b3C": {"at": 2, "owner": null},

			"g1A": {"at": 1, "owner": "you"},
			"g1B": {"at": 2, "owner": "enemy"},
			"g1C": {"at": 3, "owner": null},
			"g2A": null,
			"g2B": null,
			"g2C": null,
			"g3A": {"at": 4, "owner": null},
			"g3B": {"at": 2, "owner": "enemy"},
			"g3C": null,

			"r1A": null,
			"r1B": {"at": 1, "owner": null},
			"r1C": null,
			"r2A": null,
			"r2B": null,
			"r2C": {"at": 2, "owner": null},
			"r3A": null,
			"r3B": null,
			"r3C": null,

			"y1A": {"at": 4, "owner": "you"},
			"y1B": {"at": 3, "owner": "enemy"},
			"y1C": {"at": 1, "owner": "you"},
			"y2A": {"at": 5, "owner": "enemy"},
			"y2B": null,
			"y2C": {"at": 2, "owner": "enemy"},
			"y3A": null,
			"y3B": null,
			"y3C": {"at": 1, "owner": "you"},
		},
		steps: [
			{
				startMessages: [
					"In Homeworlds, there is a Bank, supply and demand, exchanges...",
					"In such a heavily economic game, certainly there should be investments, right?",
					"Investment is a special case of a strategy called the Keep Away, where you turn a piece into a star to stop the enemy from building it as a ship.",
					"Yeah, Homeworlds is weird: stars and ships come from the same limited supply.",
					"Here, your opponent wants to sacrifice their large green to build all 3 yellows in the bank.",
					"But it's your turn. Let's thwart them by discovering one of the large yellows as a star!",
					"(And use the green ship -- you'll need that for the next step. You might be able to guess why...)",
				],
				objective: "Discover a large yellow star with your small green",
				hint: [
					"Why the green? Well, because when a star is abandoned it immediately goes back to the Bank.",
					"Which means you can sacrifice the green and immediately build the star as a ship...",
					"...assuming, of course, no smaller pieces are available in that color.",
					"That's why this is called an Investment.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "discover") {
						if (action.oldPiece === "g1A") {
							// you can only discover size 3 stars anyway
							if (action.newPiece[0] === "y") {
								return [true, "Great! Now there are only two yellows in the bank."];
							} else {
								return [false, "Oh... you want to discover "]
							}
						} else {
							return [false, "For this module, would you mind using the *green* ship? That will be important on your next turn. Thanks."];
						}
					} else if (action.type === "move") {
						return [false, "You want to discover a *new* system, not move to an existing one."];
					} else if (action.type === "sacrifice") {
						return [false, "You don't really need to sacrifice a ship here; it would mostly just waste a ship."]
					} else {
						return [false, "Would you mind doing the discovery, though? It'll give you a powerful option next turn..."];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "Whoops, you don't want to end your turn before you do anything!"];
					}
					return [true, "Good. Now they only have two yellow ships available...", {
						type: "sacrifice",
						oldPiece: "g3B",
					}, {
						type: "build",
						newPiece: "y2B",
						system: 5
					}, {
						type: "build",
						newPiece: oldState.getPieceInStashByType("y3"),
						system: 2,
					}, {
						type: "build",
						newPiece: "g2A",
						system: 2
					}];
				},
			},
			{
				startMessages: [
					"OK, so they did grab *two* yellows... and a G2 (i.e. medium green) as the third build...",
					"So here's where the Investment part comes in.",
					"When you discover a large star with a green ship, you can wait until the Bank runs out of smaller pieces of that color.",
					"Then you sacrifice the green. This abandons the system, returning the star to the Bank...",
					"...which means it is immediately available to build!",
					"Can you do that?",
				],
				hint: [
					"Where do you have a green ship at a yellow system? Start with a sacrifice...",
				],
				checkAction: function(action, oldState) {
					// this is the first of those "check at the end" modules
					// edit: nope
					if (action.type === "discover" || action.type === "trade" || action.type === "move") {
						return [false, "That's possible, but you can build a large yellow if you make a sacrifice first!"];
					}
					return [true];
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					if (oldState.map.y3B && oldState.map.y3B.owner === "you") {
						// it's on the board and in your possession
						return [true];
					}
					return [false, "Looks like you didn't build the Y3. Click Reset Turn and try again (there's also the hint button above the map)..."];
				},
			}
		],
		endMessages: [
			"That's a powerful strategy...",
			"And that's part of why people think the Small+Medium homeworld is best, because you can invest right from your homeworld.",
			"Of course, investing is not without risk. Your opponent might send their own ship into the system, and then sacrificing yours no longer abandons the system.",
			"If you're worried about that, you can invest with a G2 (i.e. medium green) instead of a G1 to get some extra protection.",
			"And as always, you have to make sure you have somewhere legal and safe to build!",
			"All right! The next three modules will cover how to win the game!",
		],
	}),
	
	// Direct Assault
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "direct-assault",
		title: "Direct Assault",
		subtitle: "Basic Paths to Victory, 1/3",
		startMap: {
			/*
			2 (enemy): enemy has g2,g1,y1; stars b2,r3; 
			
			3: enemy has b2,y2,r2; stars g1
			4: stars b1, you have r3,y2
			
			5: enemy has y3, stars g3, you have b2,r1
			
			1 (you): stars b1,r2; you have y3,g1,g2
			*/
			
			b1A: {at: 1, owner: null},
			b1B: {at: 4, owner: null},
			b1C: null,
			b2A: {at: 5, owner: "you"},
			b2B: {at: 2, owner: null},
			b2C: {at: 3, owner: "enemy"},
			b3A: null,
			b3B: null,
			b3C: null,
			
			g1A: {at: 1, owner: "you"},
			g1B: {at: 3, owner: null},
			g1C: {at: 2, owner: "enemy"},
			g2A: {at: 1, owner: "you"},
			g2B: {at: 2, owner: "enemy"},
			g2C: null,
			g3A: {at: 5, owner: "you"},
			g3B: {at: 5, owner: null},
			g3C: null,
			
			r1A: {at: 5, owner: "you"},
			r1B: {at: 3, owner: "enemy"},
			r1C: null,
			r2A: {at: 1, owner: null},
			r2B: null,
			r2C: null,
			r3A: {at: 4, owner: "you"},
			r3B: null,
			r3C: {at: 2, owner: null},
			
			y1A: {at: 2, owner: "enemy"},
			y1B: null,
			y1C: null,
			y2A: {at: 4, owner: "you"},
			y2B: {at: 3, owner: "enemy"},
			y2C: null,
			y3A: {at: 1, owner: "you"},
			y3B: {at: 5, owner: "enemy"},
			y3C: null,
		},
		steps: [
			{
				startMessages: [
					// dunno if the \n's will do anything
					"So you may know that you lose the game if you ever have zero ships at your homeworld.",
					"But maybe you're wondering how you actually go about pulling off a win? That's the subject of the next three modules.",
					"There are three main paths to victory. Each one has its own requirements and defenses.",
					"One way to win is to use the red (steal) ability to capture all your opponent's ships. Of course, you have to ensure they don't capture you first...",
					"Here is an example. Can you invade the opponent's homeworld?"
				],
				hint: "There's a nice big ship you have right next to their homeworld...",
				checkAction: function(action, oldState) {
					console.log(action);
					if (action.type === "sacrifice") {
						return [false, "You don't need to sacrifice anything. A simple movement will do."];
					}
					if (action.type === "discover") {
						return [false, "You don't need to discover a *new* system, just invade their homeworld!"];
					}
					if (action.type !== "move") {
						return [false, "You need to move a ship to invade!"];
					}
					// 2 is the enemy's homeworld
					if (action.system !== 2) {
						return [false, "Let's try moving a ship directly into their homeworld."];
					}
					// r3A is the red you have to invade with
					if (action.oldPiece !== "r3A") {
						return [false, "Almost there! A medium won't do, because your opponent has a medium as well and can just capture yours. But do you have something stronger?"];
					}
					return [true, "You got it! Remember to end your turn..."];
				},
				checkEndTurn: function(oldState) {
					return [true, "Great! Now, let's see what your opponent does...", {
						// opponent response(s)
						type: "discover",
						oldPiece: "b2C",
						newPiece: "g2C",
					}];
				}
			},
			{
				startMessages: [
					"Fortunately for you, they don't have any large ships and can't attack you first!",
					"Let's raid their homeworld! To capture a ship, click on the enemy's ship first.",
				],
				hint: "All you need to do is capture one of their ships.",
				checkAction: function(action, oldState) {
					if (action.type !== "steal") {
						return [false, "You need to capture ships at the enemy's homeworld to win (at least in this situation)!"];
					}
					return [true, null];
				},
				checkEndTurn: function(oldState) {
					return [true, "One down, two to go... wait, what's this?!", {
						type: "build",
						newPiece: "g3C",
						system: 2,
					}];
				}
			},
			{
				title: "Problem... or not?",
				startMessages: [
					"Looks like your opponent has built a large ship now! But it's your turn...",
				],
				hint: "The biggest obstacle should be dealt with first.",
				checkAction: function(action, oldState) {
					// sacrifice green to cause catastrophe or sacrifice yellow to move G3 in
					if (action.type === "sacrifice") {
						if (action.oldPiece[0] === "g" || action.oldPiece[0] === "y") {
							return [true]; // if they have an idea let them use it
						} else if (action.oldPiece[0] === "r3A") {
							return [false, "Trying to be efficient, eh?\nYou can't have your ship and sacrifice it too...\n\n(you can't capture the large green if you don't have a large anymore)"];
						}
					}
					if (action.type === "build" && action.oldPiece[0] === "g" && action.system === 2) {
						return [true]; // clever, make an overpopulation
					}
					if (action.type === "steal") {
						return [true]; // let them make the mistake if it's not the G3
					}
					
					return [false, "You need to capture ALL of the ships at the enemy's homeworld to win!"]
				},
				checkEndTurn: function(oldState) {
					// did you find a way to destroy the g3?
					if (oldState.map.g3C === null) {
						return [true, "Clever! You could have also just attacked the large green, but it's good to think creatively on things like this!"]
					} else if (oldState.map.g3C.owner === "you") {
						return [true, "Good. As soon as they build anything, you just take it."];
					}
				}
			}
		],
		endMessages: [
			"Nice work. Keep in mind this only worked because your opponent did not have a large ship at their home.",
			"If they had, they could have attacked you when you came in...",
			"In the next two modules we will look at a few other ways to win. There's also more complicated Direct Assaults in the Advanced section."
		],
	}),
	
	// Fleet Catastrophe
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "fleet-catastrophe",
		title: "Fleet Catastrophe",
		subtitle: "Basic Paths to Victory, 2/3",
		startMap: {
			"b1A": null,
			"b1B": {"at": 7, "owner": null},
			"b1C": {"at": 3, "owner": null},
			"b2A": null,
			"b2B": {"at": 4, "owner": "enemy"},
			"b2C": {"at": 2, "owner": null},
			"b3A": null,
			"b3B": null,
			"b3C": {"at": 1, "owner": null},

			"g1A": {"at": 3, "owner": "you"},
			"g1B": {"at": 2, "owner": "enemy"},
			"g1C": {"at": 1, "owner": "you"},
			"g2A": {"at": 5, "owner": "you"},
			"g2B": {"at": 8, "owner": null},
			"g2C": {"at": 6, "owner": null},
			"g3A": {"at": 4, "owner": null},
			"g3B": {"at": 2, "owner": "enemy"},
			"g3C": {"at": 1, "owner": "you"},

			"r1A": {"at": 8, "owner": "you"},
			"r1B": {"at": 4, "owner": "enemy"},
			"r1C": {"at": 2, "owner": null},
			"r2A": null,
			"r2B": {"at": 3, "owner": "you"},
			"r2C": {"at": 1, "owner": null},
			"r3A": null,
			"r3B": null,
			"r3C": null,

			"y1A": {"at": 6, "owner": "enemy"},
			"y1B": {"at": 3, "owner": "you"},
			"y1C": null,
			"y2A": {"at": 4, "owner": "enemy"},
			"y2B": {"at": 7, "owner": "you"},
			"y2C": {"at": 6, "owner": "enemy"},
			"y3A": {"at": 1, "owner": "you"},
			"y3B": {"at": 4, "owner": "enemy"},
			"y3C": {"at": 5, "owner": null},
		},
		steps: [
			{
				startMessages: [
					"Direct assault is straightforward, but it's also rather easy to defend against by keeping a large ship at home.",
					"But sometimes you can destroy that large ship using a catastrophe.",
					"In fact, if all your opponent's ships are the same color and you have enough movement, you can win right there!",
					"Can you win in one turn?",
					"Oh, and I'm going to start being less helpful. There's still a hint and you always have the Reset Turn. Good luck!",
				],
				objective: "Destroy all the ships in the enemy's homeworld.",
				hint: [
					"Are systems 6 and 8 throwing you off?",
					"Remember star systems are connected if they have no star sizes in common.",
					"6 and 8 are displayed in the middle because they aren't connected to either homeworld. But you can, for instance, move directly from 7 to 4 because those stars are still different sizes.",
					"You *do* have enough moves here if you plan correctly.",
				],
				checkAction: function(action, oldState) {
					// I'm just going to let them figure this out on their own.
					return [true];
				},
				checkEndTurn: function(oldState) {
					if (oldState.isSystemOverpopulated('g', 2)) {
						return [false, "You have to manually invoke the catastrophe! Click one of the ships, then click the catastrophe button."];
					} else if (oldState.map.g3B) {
						// the lead ship is intact, you failed
						return [false, "Hmmm... It looks like you've found 1 way not to destroy a homeworld. Reset your turn, and try again!"];
					} else {
						return [true, "There you go!"];
					}
				}
			}
		],
		endMessages: [
			"You did it!",
			"The opponent, by keeping only one color at their homeworld, committed what is known as the Bluebird Mistake.",
			"Apparently there was this one real-life game played at some coffee shop called the Bluebird where this mistake won a game.",
			"This is why you should usually have two colors at your homeworld.",
			"However, even then, sometimes a combination of Fleet Catastrophe and Direct Assault can work, where you move in a large after destroying theirs.",
			"Anyway, the last path to victory is definitely the hardest to pull off, but it's also the most surefire way.",
		],
	}),
	
	// Star Demolition
	new _tutorialConstructor_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
		id: "star-catastrophe",
		title: "Star Demolition",
		subtitle: "Basic Paths to Victory, 3/3",
		startMap: {
			"b1A": {"at": 4, "owner": "you"},
			"b1B": {"at": 6, "owner": "you"},
			"b1C": {"at": 11, "owner": null},
			"b2A": {"at": 4, "owner": "you"},
			"b2B": {"at": 7, "owner": null},
			"b2C": {"at": 2, "owner": null},
			"b3A": {"at": 8, "owner": "enemy"},
			"b3B": {"at": 10, "owner": null},
			"b3C": {"at": 1, "owner": null},

			"g1A": {"at": 4, "owner": null},
			"g1B": {"at": 10, "owner": "you"},
			"g1C": {"at": 2, "owner": null},
			"g2A": {"at": 9, "owner": "you"},
			"g2B": {"at": 3, "owner": null},
			"g2C": {"at": 10, "owner": "you"},
			"g3A": {"at": 8, "owner": null},
			"g3B": {"at": 5, "owner": null},
			"g3C": {"at": 1, "owner": "you"},

			"r1A": {"at": 2, "owner": "enemy"},
			"r1B": {"at": 6, "owner": null},
			"r1C": null,
			"r2A": null,
			"r2B": null,
			"r2C": null,
			"r3A": null,
			"r3B": {"at": 9, "owner": null},
			"r3C": {"at": 2, "owner": "enemy"},

			"y1A": null,
			"y1B": {"at": 8, "owner": "enemy"},
			"y1C": {"at": 1, "owner": null},
			"y2A": {"at": 11, "owner": "enemy"},
			"y2B": {"at": 5, "owner": "enemy"},
			"y2C": {"at": 7, "owner": "enemy"},
			"y3A": {"at": 2, "owner": "enemy"},
			"y3B": {"at": 3, "owner": "you"},
			"y3C": {"at": 6, "owner": "you"},
		},
		steps: [
			{
				startMessages: [
					"There's a lot going on here, and that is because Star Demolition, the last main path to victory, takes the most work.",
					"You see, you can cause catastrophes to destroy the opponent's homeworld stars. But you need 2 catastrophes, which takes at least 6 ships if the opponent doesn't help you.",
					"Plus, moving one at a time is usually too slow (it gives the enemy time to counter-attack or just capture the ships), so you need yellow to sacrifice.",
					"Here's a situation where you can obliterate the enemy homeworld in just two turns. Can you see what to do?",
				],
				objective: "Destroy the enemy homeworld in 2 turns",
				hint: [
					"Can you destroy *one* of the stars this turn? Which one?",
				],
				checkAction: function(action, oldState) {
					if (oldState.actions.sacrifice) {
						if (action.type === "move") {
							if (action.oldPiece[0] === "b") {
								return [false, [
									"Hmmm...",
									"Sometimes with Star Demolition you *can* get away with moving, say, 2 greens and a blue (for a green-blue homeworld).",
									"But as for this one... how many moves can you make through yellow sacrifices? And how many ships do you need in order to blow up two stars?",
									"...",
								]];
							} else if (action.oldPiece.substring(0, 2) === "g3") {
								return [false, "No! Don't abandon your homeworld!!"];
							} else if (action.oldPiece[0] !== "g") {
								return [false, "What colors are the enemy's homeworld? You want to be moving those colors in to cause catastrophes."];
							} else {
								return [true];
							}
						} else if (action.type === "catastrophe") {
							return [true, [
								"One down, one to go!",
								"Hey, notice the map re-arranged a bit...",
								"Your enemy's homeworld lost its small green, so it is connected to small AND large systems now!",
								"Small and large...",
								"...",
								"...",
								"(remember end turn)",
							]];
						}
					} else {
						if (action.type === "sacrifice") {
							if (action.oldPiece[0] === "y") {
								return [true]; // you only have Y3s
							} else {
								return [false, "You have to *move* ships in to cause a catastrophe..."];
							}
						} else {
							return [false, "Hmmm... a regular move won't cut it, I'm afraid."]
						}
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.isSystemOverpopulated('g', 2)) {
						return [false, "Whoops. You have to actually invoke the catastrophe. Click one of the green ships, then click the catastrophe button."];
					} else if (oldState.map.g1C) {
						// star is intact
						return [false, "Hmmm... It turns out you actually can't win this particular situation without blowing up the green star."];
					} else {
						return [true, [], {
							type: "move",
							oldPiece: "r3C",
							system: 1, // revenge invasion!
						}];
					}
				}
			},
			{
				startMessages: [
					"Gaah! Where'd that guy come from?",
					"And... Eek! We don't have any red at all!",
					"Don't panic...",
					"...",
					"Right... Your homeworld is a Small+Large binary (binary just means 2 stars)...",
					"...and your enemy's is just a Medium, so they have no sizes in common, so they are connected!",
					"...",
					"Well...",
					"I guess you just have to win before they get a turn!",
					"(this time I'm not going to stop you until you end your turn)",
				],
				objective: "Destroy the enemy's homeworld this turn.",
				hint: "Their homeworld is connected to small systems now.",
				checkAction: function() {
					// lazy
					return [true];
				},
				checkEndTurn: function(oldState) {
					if (oldState.isSystemOverpopulated('b', 2)) {
						return [false, "Still gotta remember to hit that catastrophe button!"];
					} else if (oldState.map.b2C) {
						return [false, "You haven't failed, you just found one way not to destroy a star!"];
					} else {
						return [true, "Whew. That was close."];
					}
				},
			}
		],
		endMessages: [
			"Yep.",
			"That particular setup is called a Doomsday Machine.",
			"It's powerful because it often can't be stopped, but there are other ways.",
			"You don't need to have everything set up at once; you can even destroy one star and then destroy the other 15 turns later!",
			"BUT...",
			"The longer you wait, the greater the chance of an enemy counter-attack.",
			"And you normally have to give up at least 4 ships for the first star, so you'll be down in material.",
			"Many experts suggest you NOT blow up one star unless you have a plan to get the other.",
			"However, you don't *always* need two Y3s. See the advanced version of this tutorial.",
			"Well... this is message 10... But that's the last main way to win.",
			"If you need a break you've earned it.",
		],
	}),
];

/* harmony default export */ __webpack_exports__["default"] = ({
	title: "Intermediate Tutorials",
	description: "These tutorials discuss some opening strategy and the main ways to win the game.",
	list: tutorialList,
});

/***/ }),

/***/ "./scripts/tutorials/tutorialConstructor.js":
/*!**************************************************!*\
  !*** ./scripts/tutorials/tutorialConstructor.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// tutorialConstructor.js
//
// I'm not really sure why I used this instead of a standard object
// I guess it just looked better
function Tutorial(data) {
	this.id = data.id;
	this.title = data.title;
	this.disableWarnings = data.disableWarnings;
	// the second "t" is important!
	this.startMap = data.startMap;
	this.steps = data.steps;
	this.endMessages = data.endMessages;
}

/* harmony default export */ __webpack_exports__["default"] = (Tutorial);

/***/ })

}]);