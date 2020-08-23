// basicTutorials.js
//
// the hope is that we don't load the entire thing at once
// but only load the modules the user actually might play

import React from 'react';
import Tutorial from './tutorialConstructor.js';

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
	new Tutorial({
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
					"It's important to note that you do NOT \"grow\" a ship. You only get bigger ones by building when the Bank is out of smaller pieces of that color.",
					"Given this, your challenge is to build a medium ship (two pips)!\n(Again, hint button is on the top left)",
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
	new Tutorial({
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
					"But remember, the piece has to be available in the Bank!",
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
						"You may have noticed you couldn't trade at system #9, the one on the right.",
						"That's because you have no blue ships there and the star isn't blue.",
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
	new Tutorial({
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
					"Now, this website tries to smartly arrange the stars in rows, to help you visualize the connections. However, this is *only* a visual aid.",
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
						"Or use the Reset Turn at right to undo your whole turn. This even works in real games.",
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
					"In fact, you can \"discover\" a star any time you have movement power.",
					"Here, to discover a system, you first click the piece you want to move, then click the \"Discover a system...\" button in the popup.",
					"Then you click a piece in the Bank. Just like with normal movement, it must be a different size to the star you started in. (The STAR, not the ship.)",
					"(Note: Homeworld systems always start out with two stars. All other systems are single stars.)",
					"Now, your task is to discover a new system. You can use either yellow, but keep the large green home.",
				],
				objective: "Discover a new system",
				hint: [
					"First click the ship, then click a star in the Bank.",
				],
				checkAction: function(action, oldState) {
					if (action.type === "discover") {
						if (action.oldPiece[1] === "3") {
							return [false, "Yep, that's it! However, as we'll see later, it's a good habit to keep your largest ship at your homeworld (for defense).\n\nTry moving one of the yellow ships."];
						}
						return [true, "Good job. End your turn and I'll show you something interesting..."];
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
			"Anyway, did you notice how the star system disappeared when it was abandoned? Stars get added to the map via discovery, and go back to the Bank when the last ship leaves.",
			"It may seem weird at first, but it's actually a very crucial part of how the game works.",
			"It can be used to manipulate the Bank. That's important enough to emphasize in another module...",
		],
	}),

	// Economic Intermission
	new Tutorial({
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
	new Tutorial({
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
						return [true, React.createElement(
							"span",
							{},
							"I see you're finding stuff out... You know you can read the rules (scroll up) and play around in the ",
							React.createElement("a", {href: "/sandbox"}, "sandbox?")
						)];
					}
					return [true];
				},
				checkEndTurn: function(oldState) {
					const pieces = oldState.getAllPiecesAtSystem(1);
					if (pieces.length <= 2) {
						return [false, "No! Don't abandon your homeworld! That's one thing I can't allow... (In the real game you get a warning, assuming you haven't disabled them)"];
					}
					return [true];
				},
				nextStep: function(oldState) {
					if (oldState.actions.number === 0) {
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
	new Tutorial({
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
	new Tutorial({
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
			"So even if you sacrifice, you might get multiple moves (if yellow) OR multiple captures (if red), but you can NOT get both in the same turn.",
			"Also, you can sacrifice ANY piece you have; it does NOT require any specific color like the other four actions do.",
			"All right, let's learn about catastrophes! I promise, we're done with these surprises.",
		],
	}),
	
	// Catastrophes
	new Tutorial({
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
	new Tutorial({
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
							techFeedback.push("You don't have blue either! Now you can't even trade for green. Fortunately this is ");
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
			"That's important. You can never abandon your homeworld!",
			"(Well, actually, you CAN safely abandon it mid-turn, like with a yellow sacrifice, IF you get a ship back home before your turn ends.)",
			// somehow I don't feel like using JSX
			React.createElement("span", {}, 
				"Well, I think that about covers everything you need to know. I do have some more information on this site itself ",
				React.createElement("a", {href: "/howThisWorks"}, "here"),
				", and Looney Labs has the official rules for Homeworlds ",
				React.createElement("a", {href: "https://www.looneylabs.com/sites/default/files/pyramid_rules/Rules.Homeworlds.pdf"}, "here"),
				"."
			),
			"The next module is designed in case you have found the movement rule confusing. It lets you move all around many different stars.\n\nFurther modules will cover more advanced strategies. Good luck!"
		],
	}),
	
	// Star Connection Playground
	new Tutorial({
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
export default ({
	title: "Basic Tutorials",
	description: "These cover the basics of gameplay. Start here if you don't already know how Homeworlds works!",
	list: tutorialList,
});