// advancedTutorials.js
//
// Some more advanced tutorials.
// Here I include more advanced defenses and the "move two larges" direct assault strategy.

import React from 'react';
import Tutorial from './tutorialConstructor.js';


const tutorialList = [
	new Tutorial({
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

	new Tutorial({
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
					"But wait... I spy a blue ship hanging out in their homeworld. You could sac(rifice) a yellow to blow up their blues!",
					"...oh wait. Then you won't have enough yellows for the second part...",
					"...",
					"What if you just moved your blue ships in one at a time?",
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
						system: 10, // if they move to 7, you sac an r2 at 14 and steal it
					}];
				},
			},
			{
				startMessages: [
					"Oh, no! They moved their blue out! Now you don't have enough blues for the catastrophe...",
					"But wait. There are two blues in the bank. You could build some.",
					"In fact... you could even build th3mmin|$y^Q5}/...\n\n[SIGNAL LOST]",
					"",
					"",
					"...and by the way, I intercepted enemy plans to attack your homeworld in about 4 turns. You may want to strike sooner rather than later.",
				],
				hint: "What if you built blue directly in the enemy's homeworld? (You can, if you do something else first.)",
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
						return [false, "Hmmm... That could work, but it's rather slow. Can you blow up their blue star *this turn*?"]
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
					"With three ships, you have to do it in a certain way.",
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
					"(Not like they had enough time for their own attack...)",
					"All right, so I told you the second ship had to be large.",
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
						}
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
					
					return [true, "Good. See the double threat? For example, if your opponent tries to leave now...", {
						type: "discover",
						oldPiece: theirYellow,
						system: 7,
					}];
				},
			},
			{
				startMessages: [
					"So... It looks like you don't get to do a Star Demolition after all!",
					"But I think you know what you have to do now.",
					"Just don't abandon your own homeworld!",
				],
				objective: "Win the game",
				hint: [
					"I gave you two hints in the intro. Click the Show Intro button to read it again.",
				],
				checkAction: function(action) {
					if (action.type === "sacrifice") {
						if (action.oldPiece === "r3C") {
							return [false, "You did that on purpose, didn't you... If you abandon your homeworld AND destroy the enemy it's a draw."];
						} else if (action.oldPiece[0] !== "r") {
							return [false, "Ah, you see, you need to sacrifice a *RED* ship here, and capture the enemy ships."];
						} else {
							return [true];
						}
					} else if (action.type === "steal") {
						return [true];
					} else {
						return [false, "Actually, you can win right away via Direct Assault. Try a red sacrifice."];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.r3A.owner !== "you" || oldState.g3C.owner !== "you") {
						if (oldState.actions.number > 0) {
							return [false, "You're not quite done yet... (or you found 1 more way not to win, and should Reset Turn)"];
						} else {
							return [false, "Hmmm... looks like you ran out of ammo. Let's try again."];
						}
					} else {
						return [true, "You have won! Whew that was a lot."];
					}
				},
			},
		],
		endMessages: [
			"Wow...",
			"That was a lot to take in.",
			"Notice how your opponent responded to everything you did?",
			"Their \"attack\" never got off the ground.",
			// I do a find-and-replace to change s-o-u-t-h into "you" when the maps come out of the sandbox
			"In fact, I think they could have gotten you first, so don't share this as \"sou" + "th to play and win in 5 turns\" because it isn't.",
		],
	}),
];
export default {
	title: "Advanced Tutorials",
	description: "Here you will learn some more advanced stuff. Right now I have more complicated versions of the Direct Assault and Star Demolition techniques.",
	list: tutorialList,
};