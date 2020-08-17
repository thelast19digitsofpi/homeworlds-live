// intermediateTutorials.js
//
// Some intermediate-level tutorials. They cover basic openings, freeze-outs, and the 3 main ways to win.

import React from 'react';
import Tutorial from './tutorialConstructor.js';


export default [
	// Openings 1
	new Tutorial({
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
					"So now come the strategy guide modules. Here you'll find some tips on how to play better.",
					"The first question is, what do you do once you have made your homeworld? Well, it depends in part on what you picked.",
					"I've given you a B1+Y2 homeworld against an R1+B3, but a lot of these ideas apply to any setup situation.",
					"Your second turn will almost always be to build a second ship. (You can't capture anything, moving abandons your homeworld, and trading just wastes a turn because you could have picked the new ship to begin with.)",
				],
				objective: "Build a second ship.",
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
					"If you remember the tutorial about the economy, you probably know not to build another green.",
					"So what else is there?",
					"Well, you have movement, so you can discover a new system.",
					"Alternatively, you can trade for some other color.",
					"I'll let you pick which one you want to try. (This tutorial has 3 different branches; you can come back and try a different route.)",
				],
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
						} else {
							return [true, "I see you're being adventurous!"];
						}
					} else if (action.type === "sacrifice") {
						if (action.oldPiece[1] === "1") {
							// sacrificed the small
							return [false, [
								"Sacrificing a small green... would get you 1 build. That can be useful (it lets you build where you don't have green). But does that help you *here*?",
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
				checkEndTurn: function(oldState) {
					if (oldState.actions.length > 0) {
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
						return [true, "Now, although you have yellow (movement ability), your opponent does not, so they're going to trade for it now.", {
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
								"It's generally good to get a weapon when your opponent gets one. Since reds are in short supply, they are going to trade now.",
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
					"Let's get it while we can!",
					"But make sure you still have green tech at that system.",
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
								"(If you trade the small you can just move it out, but it's not a good idea to leave your homeworld without a large.)"
							]];
						} else {
							// check if you have another ship there
							const system = oldState.map[action.oldPiece];
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
					"Your opponent just got a medium yellow. Let's get one of our own!",
				],
				hint: "Come on... you don't need a hint...",
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						return [true];
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
					"Your opponent just obtained a red ship.",
					"(Notice how they *traded* a medium yellow into a medium red. Sometimes you can bypass the smalls this way.)",
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
									"You probably don't want to trade your green away.",
									"That would mean you have to waste a move trading for green later.",
								]];
							}
						} else {
							// didn't take a red
							return [false, "Right now it would be better to trade for a red piece, as a deterrent against invasions."];
						}
					} else {
						// didn't trade
						return [false, [
							"There's no pressing need to trade right now, but you don't want to put it off TOO long.",
							"It's better to be safe and trade now, and besides, you get to build more red next turn!",
						]];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You haven't done anything yet... don't end your turn yet!"];
					}
					
					return [true, [
						"There you go!",
						"The red power is a useful deterrent. Now your opponent won't invade you because you would just sacrifice your red and capture their ship!",
						"Anyway, the next goal would be to expand your fleet more, maybe discover another system, maybe get some blue ships...",
						""
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
					"I see you have a yellow ship.",
					"It may look redundant, but it's actually good to have yellow ships, particularly mediums and larges, so you can sacrifice for several moves at once.",
					"It looks like your opponent also traded for yellow.",
					"You probably don't want to grab the last yellow (can you think why?). What other options do you have?",
				],
			}
		],
		endMessages: [
			"I'm sorry to cut this off here, but you have to play the real game for more!",
			"This module actually has four different branches (three for the colors you can trade for, plus one if you discover a system right away).",
			"The important thing to keep in mind is to always watch the Bank!",
			"The next tutorial covers another opening trick, but after that, you'll learn how to actually set up for victory!",
		],
	}),
	
	// Openings 2
	new Tutorial({
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
			"r1B": {"at": 1, "owner": null},
			"r1C": null,
			"r2A": null,
			"r2B": null,
			"r2C": null,
			"r3A": null,
			"r3B": null,
			"r3C": null,

			"y1A": null,
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
					"So do that.",
				],
				hint: "Come on, you don't need a hint here.",
				objective: "Build a new ship",
				checkAction: function(action, oldState) {
					if (action.type === "build") {
						return [true];
					} else {
						return [false, "I suppose I should appreciate your curiosity. Please report any bugs you inevitably find."];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false];
					} else {
						return [true, "I think you know what the opponent is doing... (no, there are no surprises left)", {
							type: "build",
							newPiece: oldState.getPieceInStashByType('g', 1),
							system: 2,
						}];
					}
				},
			},
			{
				startMessages: [
					"In this particular game, you don't have any yellow, so you can't move away.",
					"But you do have blue technology in your star, so you can get yellow with a trade.",
					"Let's trade our small green.",
				],
				hint: "Error 404: Hint Not Found.",
				objective: "Get a yellow ship",
				checkAction: function(action, oldState) {
					if (action.type === "trade") {
						if (action.oldPiece.substring(0, 2) === "g3") {
							return [false, "I don't suggest trading away your large unless you have to. But admittedly this is more because I have something set up that only happens if you trade the small."];
						} else if (action.newPiece[0] !== "y") {
							return [false, "That's fine, except that right now you don't have the ability to leave your homeworld. How about trading for yellow?"];
						} else {
							return [true, ""]
						}
					} else if (action.type === "build") {
						return [false, [
							"Ah, you see, this is why Homeworlds is a game of economics.",
							"There are 3 small greens on the board, which means your opponent can build a medium green now.",
							"Why give them a material advantage so early?",
						]];
					} else {
						return [false, "Uhhh... did you mis-click? Try again."];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false];
					} else {
						// get the g1
						let enemyShip = '';
						const letters = 'ABC';
						for (let i = 0; i < letters.length; i++) {
							const data = oldState.map['g1' + letters[i]];
							if (data && data.at === 2) {
								enemyShip = 'g1' + letters[i];
								break;
							}
						}
						return [true, "All right. I mean, if you want to trade the large green in your games, it's all yours. But this particular move leads to a weird outcome...", {
							type: "trade",
							oldPiece: enemyShip,
							newPiece: oldState.getPieceInStashByType('r1'),
						}];
					}
				},
			},
			{
				startMessages: [
					"Sorry for forcing the issue here, but...",
					"There's only *one* small yellow left in the bank.",
					"Which means if you build it, the enemy won't be able to trade for it!",
				],
				hint: "Just read the intro again.",
				objective: "Build the other yellow ship.",
				checkAction: function(action, oldState) {
					if (action.type !== "build") {
						return [false, ""]
					}
				},
			}
		],
		endMessages: [],
	}),
	
	// Direct Assault
	new Tutorial({
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
						return [false, "You need to capture ships at the enemy's homeworld to win!"];
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
					if (action.type === "steal") {
						return [true]; // let them make the mistake if it's not the G3
					}
					
					return [false, "You need to capture ALL of the ships at the enemy's homeworld to win!"]
				},
				checkEndTurn: function(oldState) {
					// did you find a way to destroy the g3?
					if (oldState.map.g3C === null) {
						return [true, "Clever! You could have just attacked the large green, but it's good to think creatively on things like this!"]
					} else if (oldState.map.g3C.owner === "you") {
						return [true, "Good. As soon as they build anything, you just take it."];
					}
				}
			}
		],
		endMessages: [
			"Nice work. Keep in mind this only worked because your opponent did not have a large ship at their home.",
			"If they had, they could have attacked you when you came in...",
			"In the next two modules we will look at a few other ways to win. There's also a later module with some more advanced Direct Assaults."
		],
	}),
	
	// Fleet Catastrophe
	new Tutorial({
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
	new Tutorial({
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