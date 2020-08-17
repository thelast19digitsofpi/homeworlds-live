// advancedTutorials.js
//
// Some more advanced tutorials.
// Here I include more advanced defenses and the "move two larges" direct assault strategy.

import React from 'react';
import Tutorial from './tutorialConstructor.js';


export default [
	new Tutorial({
		title: "Direct Assault 2.0",
		startMap: {
			"b1A": {"at": 6, "owner": "north"},
			"b1B": {"at": 1, "owner": null},
			"b1C": {"at": 5, "owner": "south"},
			"b2A": null,
			"b2B": null,
			"b2C": {"at": 6, "owner": null},
			"b3A": {"at": 5, "owner": "south"},
			"b3B": {"at": 3, "owner": null},
			"b3C": {"at": 2, "owner": "north"},

			"g1A": {"at": 3, "owner": "south"},
			"g1B": null,
			"g1C": {"at": 6, "owner": "north"},
			"g2A": {"at": 1, "owner": null},
			"g2B": {"at": 6, "owner": "north"},
			"g2C": {"at": 5, "owner": null},
			"g3A": {"at": 3, "owner": "south"},
			"g3B": {"at": 7, "owner": null},
			"g3C": {"at": 2, "owner": null},

			"r1A": {"at": 5, "owner": "south"},
			"r1B": null,
			"r1C": {"at": 2, "owner": "north"},
			"r2A": null,
			"r2B": {"at": 1, "owner": "south"},
			"r2C": {"at": 5, "owner": "south"},
			"r3A": null,
			"r3B": null,
			"r3C": null,

			"y1A": {"at": 3, "owner": "south"},
			"y1B": {"at": 1, "owner": "south"},
			"y1C": {"at": 2, "owner": null},
			"y2A": null,
			"y2B": {"at": 6, "owner": "north"},
			"y2C": {"at": 7, "owner": "north"},
			"y3A": null,
			"y3B": {"at": 1, "owner": "south"},
			"y3C": null,
		},
		steps: [
			{
				startMessages: [
					"I don't think my earlier Direct Assault tutorial did the concept justice.",
					"You may be thinking that if you just have a large and a red, you're save from direct assaults. But there are more tricky versions...",
					"Here, your opponent has a single small red. What would happen if you moved *two* large ships into their homeworld at once?",
					"(If you get stuck, there's still the Reset Turn button.)",
				],
				objective: "Get two large ships in the enemy homeworld at once",
				hint: "How many moves do you need? (The turn may look dangerous, but make it anyway.)",
				checkAction: function(action, oldState) {
					if (oldState.actions.sacrifice) {
						// post-sacrifice
						// let anything happen, then grade them at the end
						return [true];
					} else {
						// you have to sacrifice the right piece
						if (action.type === "sacrifice") {
							if (action.oldPiece === "y3B") {
								return [true];
							} else if (action.oldPiece[0] === "y") {
								// sacrificed the wrong yellow
								return [false, "Hmmm... if you sacrificed that small yellow, you would get 1 move action. Is one move enough?"];
							} else {
								return [false, "Did you mis-click? You have to sacrifice *yellow* pieces to get move actions."];
							}
						}
					}
				},
			}
		],
	}),
];
