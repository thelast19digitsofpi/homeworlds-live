// stash.jsx
//
// Component for holding the stash of unused pieces.


// can I do this as a function component?! Sure...
function Stash(props) {
	const colors = ["b", "g", "r", "y"];
	const specifiers = "ABCDE"; // can't think of a better name!
	const scaleFactor = props.scaleFactor || 0.4;
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
				if (props.data[serial] === null) {
					// put that data into a <Piece>
					cell.push(
						<Piece
							key={serial}
							serial={serial}
							type="ship"
							color={color}
							size={size}
							scaleFactor={scaleFactor}
							
							handleClick={props.handleClick}
						/>
					)
				}
			}
			// put that cell into a <td>
			cols.push(
				<td key={color + size.toString()}>
					<div className="flexxer">{cell}</div>
				</td>
			)
		}
		// put that column into a <tr>
		rows.push(
			<tr key={color}>{cols}</tr>
		)
	}
	
	// put those rows into a <table>
	return (
		<table className="stash-table">
			<tbody>{rows}</tbody>
		</table>
	);
}

