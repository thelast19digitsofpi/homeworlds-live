
function ActionsPopup(props) {
	// possibly render popup
	let popupElement = null;
	let popup = props.popup;
	if (popup) {
		const styleData = {
			left: popup.x,
			top: popup.y
		};
		let buttons = [];
		for (let i = 0; i < popup.actions.length; i++) {
			let ac = popup.actions[i];
			let className = "btn btn-outline-";
			let message;
			if (ac.type === "build") {
				// display "Build G1 here"
				message = "Build " + ac.newPiece.substring(0, 2).toUpperCase() + " here";
				className += "success";
			} else if (ac.type === "trade") {
				message = "Trade...";
				className += "primary";
			} else if (ac.type === "move") {
				message = "Move...";
				className += "warning";
			} else if (ac.type === "discover") {
				message = "Discover a system...";
				className += "warning";
			} else if (ac.type === "steal") {
				message = "Capture this ship";
				className += "danger";
			} else if (ac.type === "sacrifice") {
				const numActions = Number(ac.oldPiece[1]);
				const actionType = {
					g: "build",
					b: "trade",
					y: "move",
					r: "capture",
					// for tutorials?
					x: "useless"
				}[ac.oldPiece[0]]; // Use the color (first letter) to get the verb
				message = `Sacrifice for\n${numActions} ${actionType} action${numActions === 1 ? '' : 's'}`;
				className += "dark";
			} else if (ac.type === "catastrophe") {
				const fullColor = {
					g: "green",
					b: "blue",
					y: "yellow",
					r: "red",
					x: "grey",
				}[ac.color];
				message = `Cause a ${fullColor} catastrophe`;
				className += "dark";
			} else {
				console.warn("Action element: ", ac);
				throw new Error("Unknown action type " + ac.type);
			}
			buttons.push(
				<button className={className} key={ac.type} type="button"
					onClick={() => props.handleButtonClick(ac)}
				>{message}</button>
			)
		}
		popupElement = (
			<div className="action-popup" style={styleData}>
				<div className="btn-group-vertical">
					{buttons}
				</div>
			</div>
		);
		return popupElement;
	} else {
		return null;
	}
}
