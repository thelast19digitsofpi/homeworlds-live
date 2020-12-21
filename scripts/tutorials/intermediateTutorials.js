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
					} else {
						// how did you get here?!
						return [false, "War Is Peace. Freedom Is Slavery. Ignorance Is Strength.\n\n(If you are seeing this, this is a bug.)"];
					}
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
					// this is the first of those "check at the end" modules
					return [true];
				},
				requireAction: true,
				checkEndTurn: function(oldState) {
					if (oldState.map.y3B && oldState.map.y3B.owner === "you") {
						// it's on the board and in your possession
						return [true];
					}
					return [false, "Looks like you didn't build the Y3. If you need to, click Reset Turn."];
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