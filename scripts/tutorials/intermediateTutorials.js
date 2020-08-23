// intermediateTutorials.js
//
// Some intermediate-level tutorials. They cover basic openings, freeze-outs, and the 3 main ways to win.

import React from 'react';
import Tutorial from './tutorialConstructor.js';


const tutorialList = [
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
					"Welcome to the strategy guide modules. Here you'll find some tips on how to play better.",
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
									"That would mean you have to waste a move trading for green later.",
									"Can you trade a different ship?",
								]];
							}
						} else {
							// didn't take a red
							return [false, "Right now it would be better to trade for a red piece, as a deterrent against invasions."];
						}
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
						"There you go!",
						"The red power is a useful deterrent. Now your opponent won't invade you because you would just sacrifice your red and capture their ship!",
						"Anyway, the next goal would be to expand your fleet more, maybe discover another system, maybe get some blue ships...",
						"...but for that you need to play the real game!",
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
					"In general, if you open up the mediums, make sure you can get one of your own safely...",
					"So now you are at another decision point. Your homeworld is getting crowded with yellow.",
					"This might be a case where you discover a green system, so you don't fall behind getting larges.",
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
							]];
						} else if (action.newPiece[0] === "b") {
							return [true, [
								"Ah, you picked blue!",
								"Blue is good for exploring. You can discover a green system and then start building AND trading!",
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
							return pieces.length < 6 ? 1 : 6;
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
					if (action.type !== "trade") {
						return [false, "That's possible, but you are going to want to get red at some point. Why not get it now?"];
					} else if (action.newPiece[0] !== "r") {
						return [false, "I would recommend you trade for *red*, because you can defend yourself better."];
					} else if (action.oldPiece[0] !== "g") {
						// note: this means they traded their only ship of that color in the homeworld
						const fullColor = {
							b: "blue",
							r: "red",
							y: "yellow",
						}[action.newPiece[0]];
						return [false, "Hmmmm... You only have one " + fullColor + " ship at your homeworld. Do you really want to trade it away? You have two green ships..."];
					} else if (action.oldPiece[1] !== "1") {
						// this means they traded the G3, not the G1
						return [false, [
							"I don't think it is a good idea to trade away G3s.",
							"If you keep the large green, you can later sacrifice it for 3 build actions, and hopefully get one or two large ships in the process.",
							"(Besides, having an R3 as your large homeworld defender can create a false sense of security -- see Direct Assault 2.0 in Advanced for why.)",
						]];
					} else {
						return [true, "There you go! Your opponent won't be able to cause trouble without a lot more preparation..."];
					}
				},
				checkEndTurn: function(oldState) {
					if (oldState.actions.number > 0) {
						return [false, "You aren't quite ready to end your turn! Do something first!"];
					}
					
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
					"Well... it looks like you never discovered any systems!",
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
							return [false, "Oh, no, you don't want BOTH the ship and star to be green. That's wasted potential and it is also a catastrophe risk."];
						} else if (shipGreen || starGreen) {
							if (action.oldPieece[1] === "3") {
								return [false, [
									"It's not a good idea to move out your large ship. It leaves you vulnerable if your opponent gets one in.",
									"The opponent isn't really in position to attack you, but you don't want to forget, either."
								]];
							} else {
								return [true];
							}
						} else {
							return [false, "I wouldn't advise that particular combination. You want to have green there, so that you can build new ships if a good opportunity arises."]
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
					"So...",
					"Both you and your opponent have red, so neither side can really get aggressive for a while. (It's good to have red if your opponent does too.)",
					"You could build *another* medium red...",
					"Or you could trade the one you have for a different color, like blue or yellow.",
					"Blue might actually be good, so that you can still trade when you discover new stars...",
					"Either that, or just get another red.",
				],
				checkAction: function(action, oldState) {
					// homeworld should be G3, R1, R2
					if (action.type === "trade") {
						if (action.oldPiece[0] === "g") {
							return [false, "You don't want to trade away your only green ship, because then you won't be able to build!"];
						} else if (action.newPiece.substring(0, 2) === "g1") {
							return [false, [
								"Hmmm... Do you really want to trade for a G1? You could just build one...",
								"...and if you're building, you may as well get a medium red instead.",
							]];
						} else {
							return [true];
						}
					} else if (action.type === "build") {
						if (action.oldPiece[0] === "r") {
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
				checkEndTurn: function(oldState) {
					// opponent built a medium last turn and wants to trade for a Y2
					let enemyMedium = null;
					const pieces = oldState.getAllPiecesAtSystem(2);
					for (let i = 0; i < pieces.length; i++) {
						if (pieces[i].serial[1] === "2") {
							enemyMedium = pieces[i];
						}
					}
					
					return [true, "There you go. Let's see what happens now...", {
						type: "trade",
						oldPiece: enemyMedium,
						newPiece: oldState.getPieceInStashByType("y2"),
					}];
				},
				nextStep: function(oldState) {
					
				},
			}
		],
		endMessages: [
			"Well, there you are. You have a solid position. Good job!",
			"At some point, you'll want to move all the blue and yellow ships out of your homeworld. (This makes it harder for catastrophes to destroy your home stars.)",
			"I'm sorry to cut this off here, but you have to play the real game for more!",
			"This module actually has three main branches, and some of them split further.",
			"Anyway, I know there's a lot to keep track of, and you won't have my constant pestering every single move in a real game.",
			"The two important things are practice and vigilance. Always watch the Bank for opportunities.",
			"The next tutorial covers a particularly powerful opening trick you should watch out for.",
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
	new Tutorial({
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
					"OK, so they did grab the yellows... and a G2 (i.e. medium green) as the third build...",
					"So here's where the Investment part comes in.",
					"When you discover a large star with a green ship, you can wait until the Bank runs out of smaller pieces of that color.",
					"Then you sacrifice the green. This abandons the system, returning the star to the Bank...",
					"...which means it is immediately available to build!",
					"Can you do that?",
				],
				checkAction: function(action, oldState) {
					if (action.type === "sacrifice") {
						if (action.oldPiece === "g1A") {
							return [true];
						} else {
							return [false, "Oh, right. You have to sacrifice the green ship in order to build."];
						}
					}
				}
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

export default {
	title: "Intermediate Tutorials",
	description: "These tutorials discuss some opening strategy and the main ways to win the game.",
	list: tutorialList,
};