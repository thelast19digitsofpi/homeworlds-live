// starmap.js
//
// Probably could have called it the "board" but Homeworlds does not really have a board.

// Data classes (not components)

function StarMap(props) {
	// TODO: positioning of systems
	
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
					homeworld: null // we will find out later
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
		/*
		Possibilities:
		(a) Homeworlds are both one size and connected (e.g. 1 vs 2).
		(b) Homeworlds are connected but one has two sizes (e.g. 1-3 vs 2).
		(c) Homeworlds are 2 steps apart and both one size (e.g. 1 vs 1 or 3 vs 3-3).
		(d) Homeworlds are 2 steps apart and one has two sizes (e.g. 1-3 vs 1).
		(e) Homeworlds are 2 steps apart and both are two sizes (e.g. 1-2 vs 1-2).
		(f) Homeworlds are 3 steps apart (e.g. 1-2 vs 2-3).
		(g) One homeworld is destroyed.
		
		Render:
		- If a, b, or f: Display stars in rows:
			- top=0,1,2,3,4. Put enemy HW in 0, adjacent in 1, adjacent to both or none in 2, adjacent only to your HW in 3, and your HW itself in 4.
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
		*/
		
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
		let systemArray = [];
		for (let id in systems) {
			const myStars = systems[id].stars;
			const reactElement = (
				<System
					key={id}
					id={id}
					stars={systems[id].stars}
					ships={systems[id].ships}
					viewer={props.viewer}
					homeworld={systems[id].homeworld}
					scaleFactor={props.scaleFactor}
					
					handleBoardClick={props.handleBoardClick}
				/>
			);
			
			if (hws.length === 1) {
				// Only 1 homeworld!
				if (GameState.areStarsConnected(myStars, hws[0])) {
					// this.viewer would be considered south
					const which = (players[0] === this.viewer) ? "adjSouth" : "adjNorth";
					containers[which].push(reactElement);
				} else {
					containers.adjNone.push(reactElement);
				}
			} else {
				const adjNorth = 
			}
		}
		
		return <div className="systems">{systemArray}</div>;
	} else {
		// Some sort of SVG render...? Does this even work for SVG images in all browsers?
	}
}


