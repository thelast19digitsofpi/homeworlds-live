// starmap.js
//
// Probably could have called it the "board" but Homeworlds does not really have a board.

class StarMap extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			// array of: {x, y, stars: [serials], numShips}
			systemPositions: [],
			scaleFactor: 0.5, // good baseline
		}
		
		this.handleResize = this.handleResize.bind(this);
	}
	
	componentDidMount() {
		window.addEventListener("resize", this.handleResize, {passive: true});
	}
	componentWillUnmount() {
		window.removeEventListener("resize", this.handleResize, {passive: true});
	}
	
	handleResize() {
		
	}
	
	// gets the number of different sizes in a homeworld
	getUniqueSizes(homeworld) {
		var sizesFound = {};
		for (let i = 0; i < homeworld.length; i++) {
			// homeworld[i] is an object {serial, size, color}
			const size = homeworld[i].size;
			if (!sizesFound[size]) {
				sizesFound[size] = true;
			}
		}
		return Object.keys(sizesFound);
	}
	
	// Given the containers and the 2 homeworlds, return a React element
	renderHTMLContainers(hw1, hw2, containers) {
		/*
		Possibilities:
		(a) Homeworlds are both one size and connected (e.g. 1 vs 2).
		(b) Homeworlds are connected but one has two sizes (e.g. 1-3 vs 2).
		(c) Homeworlds are 2 steps apart and both one size (e.g. 1 vs 1 or 3 vs 3-3).
		(d) Homeworlds are 2 steps apart and one has two sizes (e.g. 1-3 vs 1).
		(e) Homeworlds are 2 steps apart and both are two sizes (e.g. 1-2 vs 1-2).
		(f) Homeworlds are 3 steps apart (e.g. 1-2 vs 2-3).
		(g) One homeworld is destroyed.
		(h) Both homeworlds are destroyed.
		
		Render:
		- If a, b, or f: Display stars in rows:
			- Put adjacent to enemy in row 1, adjacent to both or none in 2, and adjacent only to your HW in 3.
		- If c: Display stars in columns:
			- Stars adjacent to HWs go in middle.
			- Stars not adjacent go in left/right edges.
		- If d: Display stars in mixed format:
			- Left column displays stars adjacent to neither HW.
			- Right column is split, with stars adjacent to only one HW in a block closer to that HW.
			- Or maybe switch the left and right depending on who has the 2 sizes...
		- If e: Display stars in columns:
			- Stars adjacent to HWs go in middle.
			- Stars of one size go to left, other size go to right.
		- If g, then... I guess pretend it is (d) or (a) (as appropriate)
		- If h... then who really cares? (This might be an argument for a stateful component?)
		*/
		
		const sizes1 = getUniqueSizes(hw1);
		const sizes2 = getUniqueSizes(hw2);
		if (sizes1.length === 1 && sizes2.length === 1) {
			// both homeworlds are single stars or geminis
			containers[i]
		}
	}
	
	moveSVGSystems() {
		// react state is immutable
		const newPositions = [];
		
		// Loop over each pair of systems
		const array = this.state.systemPositions;
		for (let i = 0; i < array.length; i++) {
			const sys1 = array[i];
			let forceX = 0;
			let forceY = 0;
			// attract/repel to all other systems
			for (let j = 0; j < array.length; j++) {
				// does not attract/repel itself!
				if (j !== i) {
					// Because we are in a 2-player game, x-direction is more liable to overlaps than y-direction
					const sys2 = array[j];
					if (GameState.areStarsConnected(sys1.stars, sys2.stars)) {
						// move them together but not too close
						forceX += (sys2.x - sys1.x) - 100;
					} else {
						// move them apart
						forceX -= (sys2.x - sys1.x);
					}
				}
			}
		}
	}
	
	render() {
		const props = this.props;
		
		// need to get the array of systems.
		// System wants objects of the form {size, color, serial, owner} for ships and {size, color, serial} for stars.
		
		// Loop over all pieces in the game.
		const map = props.map;
		let systems = {}; // systems[3] will store system ID=3
		let stash = {}; // stores a count of each g3
		// map is an object, each property is a serial number (b2A)
		for (let serial in map) {
			let data = map[serial];
			// 3 cases: null, owner is null, or owner is not null
			if (data === null) {
				continue;
			} else {
				// get the system we are at
				let system = systems[data.at];
				if (!system) {
					// then create an empty system object
					system = {
						stars: [],
						ships: [],
						homeworld: null, // we will find out later
					};
					systems[data.at] = system;
				}
				// now add either a ship or a star
				let pieceData = {
					serial: serial,
					size: Number(serial[1]),
					color: serial[0]
				};
				if (data.owner === null) {
					// is a star
					pieceData.type = "star";
					system.stars.push(pieceData);
				} else {
					// is a ship
					// remember "data" is the entry in "map"
					pieceData.owner = data.owner;
					pieceData.type = "ship";
					system.ships.push(pieceData);
				}
			}
		}
		
		// let the homeworld systems know that they are such
		let players = [];
		for (let player in props.homeworldData) {
			let hwid = props.homeworldData[player];
			if (systems[hwid]) {
				// set it to the owner
				systems[hwid].homeworld = player;
				players.push(player);
			}
		}
		
		if (true) {
			
			
			// Work out the connections between systems
			let hws = [];
			for (let i = 0; i < players.length; i++) {
				const hwid = props.homeworldData[players[i]];
				hws.push(systems[hwid].stars);
			}
			
			let containers = {
				hwNorth: [], // enemy
				hwSouth: [], // you
				adjNorth: [],
				adjSouth: [],
				adjBoth: [],
				adjNeither: [],
			};
			
			// we need to convert the system object into an array of elements
			let actualMapDisplay = null;
			for (let id in systems) {
				const system = systems[id];
				const myStars = system.stars;
				const reactElement = (
					<System
						key={id}
						id={id}
						stars={system.stars}
						ships={system.ships}
						viewer={props.viewer}
						homeworld={system.homeworld}
						scaleFactor={props.scaleFactor}
						
						handleBoardClick={props.handleBoardClick}
					/>
				);
				
				// Now work out which bin to put the system in!
				if (system.homeworld) {
					if (system.homeworld === props.viewer) {
						containers.hwSouth.push(reactElement);
					} else {
						containers.hwNorth.push(reactElement);
					}
				} else {
					if (hws.length === 1) {
						// Only 1 homeworld!
						if (GameState.areStarsConnected(myStars, hws[0])) {
							// this.viewer would be considered south
							const which = (players[0] === this.viewer) ? "adjSouth" : "adjNorth";
							containers[which].push(reactElement);
						} else {
							containers.adjNeither.push(reactElement);
						}
					} else if (hws.length === 2) {
						// 2 homeworlds.
						const adj0 = GameState.areStarsConnected(myStars, hws[0]);
						const adj1 = GameState.areStarsConnected(myStars, hws[1]);
						let adjNorth, adjSouth;
						if (players[0] === this.viewer) {
							// players[0] is south
							adjSouth = adj0;
							adjNorth = adj1;
						} else {
							adjSouth = adj1;
							adjNorth = adj0;
						}
						
						// put it in the proper bin
						if (adjNorth) {
							containers[adjSouth ? "adjBoth" : "adjNorth"].push(reactElement);
						} else {
							containers[adjSouth ? "adjSouth" : "adjNeither"].push(reactElement);
						}
					} else {
						// no homeworlds?!?
						console.log("No homeworlds exist!");
					}
				}
			} // end for loop
			
			if (hws.length === 2) {
				if ()
			} else if (hws.length === 1) {
				
			} else {
				
			}
			
			return <div className="systems">{systemArray}</div>;
		} else {
			// Some sort of SVG render...? Does this even work for SVG images in all browsers?
		}
	}
}

