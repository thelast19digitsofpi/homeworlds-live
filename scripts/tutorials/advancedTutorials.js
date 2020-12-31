// advancedTutorials.js
//
// Some more advanced tutorials.
// Here I include more advanced defenses and the "move two larges" direct assault strategy.
//
// Spoiler alert...

import React from 'react';
import Tutorial from './tutorialConstructor.js';


const tutorialList = [
	// Direct Assault version 2
	new Tutorial({
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
	new Tutorial({
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
	new Tutorial({
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
export default {
	title: "Advanced Tutorials",
	description: "Here you will learn some more advanced stuff. Right now I have more complicated versions of the Direct Assault and Star Demolition techniques.",
	list: tutorialList,
};