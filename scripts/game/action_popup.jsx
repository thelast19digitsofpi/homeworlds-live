
import React from 'react';

function pleaseFocusMe(div) {
	if (div) {
		div.focus();
	}
}

function ActionsPopup(props) {
	// possibly render popup
	let popupElement = null;
	let popup = props.popup;
	if (popup) {
		const styleData = {};
		// decide whether to use left or right
		styleData[popup.xSide] = popup.x;
		styleData[popup.ySide] = popup.y;
		
		let buttons = [];
		for (let i = 0; i < popup.actions.length; i++) {
			let ac = popup.actions[i];
			// discover and move are in the same thing
			if (ac.type === "discover") {
				continue;
			}
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
				message = "Move / Discover...";
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
				// onMouseDown stops the onBlur from firing prematurely
				<button className={className} key={ac.type} type="button"
					onClick={() => props.handleButtonClick(ac)}
					onMouseDown={event => event.preventDefault()}
				>{message}</button>
			)
		}
		if (buttons.length) {
			buttons.push(
				<button className="btn btn-outline-dark text-black" key="cancel" type="button"
					onClick={() => props.handleButtonClick(null)}>Cancel</button>
			)
		}
		return (
			<div className="action-popup" style={styleData} onBlurCapture={props.onBlur} tabIndex="0" autoFocus ref={pleaseFocusMe}>
				<div className="btn-group-vertical">
					{buttons}
				</div>
			</div>
		);
	} else {
		return null;
	}
}

export default ActionsPopup;