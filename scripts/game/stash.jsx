// stash.jsx
//
// Component for holding the stash of unused pieces.

import React from 'react';
import Piece from './piece.jsx';

// can I do this as a function component?! Sure...
function Stash(props) {
	const colors = ["b", "g", "r", "y"];
	const specifiers = "ABCDE"; // can't think of a better name!
	const scaleFactor = props.scaleFactor || 0.4;
	const aip = props.actionInProgress;
	
	// Highlights sizes for trading and discovery
	// they by default are all on
	let highlight = {
		1: true,
		2: true,
		3: true,
	};
	if (aip) {
		// size is the second character of the serial
		// mismatches will fade out
		if (aip.type === "trade") {
			// turn them all off
			highlight[1] = false;
			highlight[2] = false;
			highlight[3] = false;
			// then your size gets turned on
			highlight[aip.oldPiece[1]] = true;
		}
		
		if (aip.type === "discover") {
			// turn off anything matching the stars you are at
			const fromSystem = props.map[aip.oldPiece].at;
			for (let serial in props.map) {
				const data = props.map[serial];
				if (data && data.owner === null && data.at === fromSystem) {
					// pieces of that size must fade out
					highlight[serial[1]] = false;
				}
			}
		}
	}
	
	
	// array of <tr> elements
	let rows = [];
	for (let i = 0; i < colors.length; i++) {
		const color = colors[i];
		// array of <td> elements
		let cols = [];
		for (let size = 1; size <= 3; size++) {
			// array of ship images
			let cell = [];
			// there are 3 of each piece
			for (let which = 0; which < 3; which++) {
				// serial number is color + size + specifier
				const serial = color + size + specifiers[which];
				
				// try to decide if it should be hidden or faded based on AIP
				let show = true;
				let fade = false;
				if (aip && aip.type === "homeworld") {
					// making a homeworld
					// the loop also matches "type" and "player" but those are never serials
					for (let piece in aip) {
						if (aip[piece] === serial) {
							// the piece is part of the AIP, so do not show it
							show = false;
							break;
						}
					}
				}
				
				// If the map does not have the piece on the board...
				if (props.map[serial] === null && show) {
					// put that map into a <Piece>
					const css = {
						// height of a ship is 40 + 32*size
						marginTop: scaleFactor * -(4 + 32 * size),
					};
					
					// This is a neat trick: put the props in, them map them to React elements
					cell.push({
						key: serial,
						serial: serial,
						type: "ship",
						color: color,
						size: size,
						scaleFactor: scaleFactor,
						style: css,
						handleClick: props.handleClick,
						displayMode: props.displayMode,
					});
				}
			}
			// The last one loses its special marginTop
			if (cell.length > 0) {
				delete cell[cell.length - 1].style.marginTop;
			}
			
			// check if this column should be highlighted
			const cellCSS = {
				opacity: highlight[size] ? 1 : 0.4,
			};
			
			// Turn the props into a React Piece
			cell = cell.map(subProps => React.createElement(Piece, subProps));
			// put that cell into a <td>
			cols.push(
				<td key={color + size.toString()}
					style={cellCSS}>
					<div className="d-flex flex-column-reverse">{cell}</div>
				</td>
			)
		}
		// put that column into a <tr>
		rows.push(
			<tr key={color}>{cols}</tr>
		)
	}
	
	// put those rows into a <table>
	return <React.Fragment>
		<h4 align="center">Bank</h4>
		<table className="stash-table">
			<tbody>{rows}</tbody>
		</table>
	</React.Fragment>;
}

export default Stash;

