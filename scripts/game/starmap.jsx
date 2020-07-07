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
	for (let player in props.homeworldData) {
		let hwid = props.homeworldData[player];
		if (systems[hwid]) {
			// set it to the owner
			systems[hwid].homeworld = player;
		}
	}
	
	// we need to convert the system object into an array of elements
	let systemArray = [];
	for (let id in systems) {
		systemArray.push(
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
	}
	
	return <div className="systems">{systemArray}</div>;
}


