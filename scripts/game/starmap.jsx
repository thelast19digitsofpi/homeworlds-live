// starmap.js
//
// Probably could have called it the "board" but Homeworlds does not really have a board.

import React from 'react';
import System from './system.jsx'; // maybe "StarSystem" would have been better
import GameState from './gameState.mjs';

class StarMap extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			// array of: {x, y, stars: [serials], numShips}
			systemPositions: [],
			scaleFactor: 0.5, // good baseline
		}
		
		//this.handleResize = this.handleResize.bind(this);
		this.getSystemOwnershipScore = this.getSystemOwnershipScore.bind(this);
	}
	
	/*componentDidMount() {
		window.addEventListener("resize", this.handleResize, {passive: true});
	}
	componentWillUnmount() {
		window.removeEventListener("resize", this.handleResize, {passive: true});
	}
	
	handleResize() {
		
	}*/
	
	// Numeric score used for Array.sort
	getSystemOwnershipScore(reactSystemElement) {
		const ships = reactSystemElement.props.ships;
		// how much control (determined by size of largest ship) do you have?
		let yourControl = 0;
		let enemyControl = 0;
		for (let i = 0; i < ships.length; i++) {
			const influence = ships[i].size;
			if (ships[i].owner === this.props.viewer) {
				yourControl = Math.max(yourControl, influence);
			} else {
				enemyControl += Math.max(enemyControl, influence);
			}
		}
		
		const tiebreak = reactSystemElement.props.id / 1e4;
		// basically, move systems more dominated by you to your right
		if (enemyControl && !yourControl) {
			// put their systems on the left
			// use system id to make a stable sort
			return -1 - tiebreak;
		} else if (yourControl < enemyControl) {
			// contested system but enemy has majority
			return -0.5 - tiebreak;
		} else if (yourControl === enemyControl) {
			// perfectly contested
			return tiebreak;
		} else if (yourControl > enemyControl && enemyControl > 0) {
			// contested system but you have majority
			return 0.5 + tiebreak;
		} else {
			// only you occupy it
			return 1 + tiebreak;
		}
	}
	
	sortContainer(container) {
		// these are React system objects
		return container.sort(function(sys1, sys2) {
			return this.getSystemOwnershipScore(sys1) - this.getSystemOwnershipScore(sys2);
		}.bind(this));
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
		// i.e. map(x => Number(x))
		return Object.keys(sizesFound).map(Number);
	}
	
	// Helper function for renderHTMLContainers().
	// Renders a 3-column layout. The center array is rendered as is while the sides array is split based on star size for a slightly easier map.
	renderHTMLThreeColumns(smallerSize, center, sides) {
		let leftSide = [];
		let rightSide = [];
		for (let i = 0; i < sides.length; i++) {
			const reactElement = sides[i];
			// Read the "size" prop on the System element.
			// If it is the smaller size it goes on the left, otherwise on the right.
			if (reactElement.props.stars[0].size === smallerSize) {
				leftSide.push(reactElement);
			} else {
				rightSide.push(reactElement);
			}
		}
		
		return (
			<div className="row justify-content-around">
				<div className="col-auto" align="center">{leftSide}</div>
				<div className="col-auto" align="center">{center}</div>
				<div className="col-auto" align="center">{rightSide}</div>
			</div>
		);
	}
	
	// Given the containers and the 2 homeworlds, return a React element
	renderHTMLContainers(hw1, hw2, containers) {
		/*
		Possibilities:
		(a) Homeworlds are both one size and connected (e.g. 1 vs 2).
		(b) Homeworlds are connected but one has two sizes (e.g. 1-3 vs 2).
		(c) Homeworlds are 2 steps apart and both one size (e.g. 1 vs 1, or 3 vs 3-3).
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
		
		const sizes1 = this.getUniqueSizes(hw1);
		const sizes2 = this.getUniqueSizes(hw2);
		
		// we will need this often
		const rowDisplay = (<React.Fragment>
			<div className="adj-north">{containers.adjNorth}</div>
			{/* hopefully one of these is empty */}
			<div className="adj-both adj-neither">{containers.adjBoth}{containers.adjNeither}</div>
			<div className="adj-south">{containers.adjSouth}</div>
		</React.Fragment>);
		
		if (sizes1.length === 1 && sizes2.length === 1) {
			//console.log("[Starmap] cases C or A");
			// both homeworlds are single stars or geminis
			if (sizes1[0] === sizes2[0]) {
				console.log("[Starmap] case c");
				// identical sizes, type (c)
				// put smaller sizes on the left
				const smallerSize = (sizes1[0] === 1) ? 2 : 1;
				return this.renderHTMLThreeColumns(smallerSize, containers.adjNeither, containers.adjBoth);
			} else {
				//console.log("case a");
				// identical sizes, type (a)
				// row format
				return rowDisplay;
			}
		} else if (sizes1.length === 2 && sizes2.length === 2) {
			//console.log("[Starmap] cases E or F");
			// both homeworlds have 2 distinct sizes
			let missingSize = 0;
			// Check if the same size is absent in both homeworlds.
			for (let i = 1; i <= 3; i++) {
				if (sizes1.indexOf(i) === -1 && sizes2.indexOf(i) === -1) {
					missingSize = i;
					break;
				}
			}
			if (missingSize !== 0) {
				//console.log("case e", missingSize);
				// so they were 2 moves away, type (e)
				const smallerSize = (missingSize === 1) ? 2 : 1;
				return this.renderHTMLThreeColumns(smallerSize, containers.adjBoth, containers.adjNeither);
			} else {
				//console.log("case f");
				// standard 3 moves away, type (f)
				return rowDisplay;
			}
		} else if (sizes1.length === 0 || sizes2.length === 0) {
			//console.log("[Starmap] cases g/h");
			// one of the homeworlds is gone
			// there is really no hope for order here
			return rowDisplay;
		} else {
			/*
			There are 9 possibilitiesfor the number of different sizes at each homeworld:
			0,0; 0,1; 0,2; 1,0; 1,1; 1,2; 2,0; 2,1; 2,2.
			
			The first and second if's knocked out 1,1 and 2,2.
			The third knocked out all those with 0.
			  0 1 2
			0 X X X
			1 X X
			2 X   X
			
			This leaves us with only (1,2) or (2,1).
			*/
			// Are they connected?
			let connected = true;
			for (let i = 0; i < sizes1.length; i++) {
				if (sizes2.indexOf(sizes1[i]) >= 0) {
					// size match!
					connected = false;
				}
			}
			
			
			if (connected) {
				console.log("case b");
				// ok this is actually quite easy, type (b)
				return rowDisplay;
			} else {
				console.log("case d");
				// we do not want the left thing to take up half the space for 0-2 systems
				const numLeft = containers.adjNeither.length;
				const numRight = Math.max(containers.adjNorth.length,
				                          containers.adjBoth.length,
				                          containers.adjSouth.length);
				let classLeft;
				// determine how big to make the left side
				if (numLeft === 0) {
					// nothing there
					classLeft = "d-none";
				} else if (numLeft === 1) {
					// just one system, make it only wide enough to fit the system
					classLeft = "col-auto px-1";
				} else if (numLeft <= numRight*2/3) {
					// left is small
					classLeft = "col-4 col-md-3 col-lg-2";
				} else if (numLeft >= numRight*3/2) {
					// left is big
					classLeft = "col-8 col-sm-7";
				} else {
					// roughly same size, make them equal
					classLeft = "col-6";
				}
				
				if (numLeft > 0) {
					classLeft += " d-flex flex-column justify-content-center";
				}
				// case (d)
				// return a mixed view, because we have Both *and* Neither *and* a north or south
				return (
					<div className="row flex-grow">
						<div className={classLeft}>{containers.adjNeither}</div>
						{/* flex-ception */}
						<div className="col d-flex flex-column justify-content-around">
							{/* if the north or south containers are empty that messes up the flexing */}
							{containers.adjNorth && <div>{containers.adjNorth}</div>}
							<div>{containers.adjBoth}</div>
							{containers.adjSouth && <div>{containers.adjSouth}</div>}
						</div>
					</div>
				)
			}
		}
	}
	
	moveSVGSystems() {
		// react state is de jure immutable
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
			const dataToSerial = data => data.serial;
			
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
			let innerDisplay = null;
			for (let id in systems) {
				const system = systems[id];
				const myStars = system.stars.map(dataToSerial);
				const reactElement = (
					<System
						key={id}
						id={id}
						stars={system.stars}
						ships={system.ships}
						viewer={props.viewer}
						homeworld={system.homeworld}
						scaleFactor={props.scaleFactor}
						activePiece={props.activePiece}
						
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
						if (GameState.areStarsConnected(myStars, hws[0].map(dataToSerial))) {
							// this.viewer would be considered south
							const which = (players[0] === props.viewer) ? "adjSouth" : "adjNorth";
							containers[which].push(reactElement);
						} else {
							containers.adjNeither.push(reactElement);
						}
					} else if (hws.length === 2) {
						// 2 homeworlds.
						const adj0 = GameState.areStarsConnected(myStars, hws[0].map(dataToSerial));
						const adj1 = GameState.areStarsConnected(myStars, hws[1].map(dataToSerial));
						let adjNorth, adjSouth;
						if (players[0] === props.viewer) {
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
						containers.adjNeither.push(reactElement);
					}
				}
			} // end for loop
			
			// sort them
			for (let which in containers) {
				containers[which] = this.sortContainer(containers[which]);
			}
			
			if (hws.length === 2) {
				innerDisplay = this.renderHTMLContainers(hws[0], hws[1], containers);
			} else if (hws.length === 1) {
				innerDisplay = this.renderHTMLContainers(hws[0], [], containers);
			} else {
				innerDisplay = <div>{containers.adjNeither}</div>
			}
			
			return (
				<div className="systems">
					{containers.hwNorth}
					{innerDisplay}
					{containers.hwSouth}
				</div>
			);
		} else {
			// Some sort of SVG render...? Does this even work for SVG images in all browsers?
			console.log("other render method is not supported, please change that boolean back");
		}
	}
}

export default StarMap;