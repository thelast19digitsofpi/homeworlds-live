// tutorialData.js
//
// just trying to get a sense for what tutorials would look like
// this is *not* the React component

// import nothing from null;
// ...right?

function Tutorial(data) {
	this.title = data.title;
	// the second "t" is important!
	this.startMap = data.startMap;
	this.steps = data.steps;
}

const tutorialList = [
	new Tutorial({
		title: "Star Connections",
		startMap: {
			/*
			2 (enemy): enemy has b3,g3; stars r1,y3
			
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
			b3A: {at: 4, owner: "enemy"},
			b3B: {at: 4, owner: "enemy"},
			b3C: {at: 4, owner: "enemy"},
		},
		steps: [
			{
				startMessages: [
					"In Homeworlds, two star systems are connected if and only if they do not share any size stars.",
					"If you find that a bit confusing, here is a scenario where you move all around the board and get a better grasp for what is going on.",
					"The enemy will NOT act in this scenario, and I have disabled the trade, sacrifice, and discover actions.\n\nCan you capture all the ships?",
				],
				hint: "Just move your red ship out.",
				checkAction: function(action) {
					if (action.type !== "move") {
						return [false, "I'd prefer you stick to movement and capturing for now."];
					}
					if (action.oldPiece !== "r2A") {
						return [false, "I'd prefer you move the red ship, so you can directly capture other ships."];
					}
				},
			},
			{
				id: "loop",
				startMessages: [],
				hint: "Systems are connected if they are DIFFERENT sizes. It may take you two turns to get where you want to go...",
				
				// undefined/null => go to next
				// number => offset (e.g. 2 = go ahead 2 steps), can be negative, if overflows then we finish
				// "end" => finish tutorial (Infinity also works)
				// other string => step with matching "id" property
				nextStep: function(state) {
					if ("condition") {
						return "loop";
					}
				},
			}
		],
	}),
	
	new Tutorial({
		title: "Direct Assault",
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
					"Now, let's learn how to actually win a game!\nAs we have said, you lose the game if you ever have zero ships at your homeworld.",
					"One way to win is to use the red (steal) ability to capture all your opponent's ships.",
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
			"In the next two modules we will look at a few other ways to win."
		],
	}),
]

export default tutorialList;
