// turnControls.jsx
//
// Reset Turn, End Turn, and warnings

import React from 'react';

function TurnControls(props) {
	const warningContent = props.showDisableWarnings && <React.Fragment>
		<p className="mb-0">
			<input type="checkbox" id="show-warnings-box" checked={!props.disableWarnings} onChange={(event) => props.changeDisableWarnings(!event.target.checked)}/>
			<label className="ml-1" htmlFor="show-warnings-box">Warnings</label>
		</p>
	</React.Fragment>;
	
	if (props.canInteract) {
		const warnings = props.warnings;
		const popupStyle = {
			top: "-1em",
			right: "calc(100% + 1em)",
			width: "40vw",
		};
		
		const warningParagraphs = warnings.map(function(warning) {
			return <p key={warning.message} className="mb-0">{warning.message}</p>;
		});
		
		// find the maximum level
		const levels = {
			note: 0,
			caution: 1,
			warning: 2,
			danger: 3,
		};
		let maxLevel = 0;
		for (let i = 0; i < warnings.length; i++) {
			// use the lookup table
			const newLevel = levels[warnings[i].level];
			if (newLevel > maxLevel) {
				maxLevel = newLevel;
			}
		}
		
		// there's no "caution" or "note" button class
		const endTurnClass = ["success text-light", "info", "warning text-light", "danger"][maxLevel];
		
		const warningClass = (warnings.length > 0 ? "warning" : "success");
		
		// The display!
		return <React.Fragment>
			<button
				onClick={props.handleResetClick}
				className="btn btn-danger mt-1">Reset Turn</button>
			<br/>
			<div className="position-relative">
				{props.showPopup && warnings.length > 0 && 
					<div className="position-absolute alert alert-light shadow" style={popupStyle}>
						{warningParagraphs}
					</div>
				}
				<button className={"end-turn mt-2 btn btn-lg btn-" + endTurnClass}
				        onClick={props.handleEndTurnClick}>{props.actionCount > 0 ? "Pass" : "End"} Turn</button>
			</div>
			{warningContent}
			{!props.disableWarnings && <button className={"text-light mt-3 btn btn-" + warningClass} onClick={props.toggleWarningPopup}>{warnings.length} warning(s)</button>}
		</React.Fragment>
	} else {
		// Render a bunch of dummy outline buttons
		return <React.Fragment>
			<button className="btn btn-outline-danger mt-1" disabled>Reset Turn</button>
			<br/>
			<div className="position-relative">
				<button className="btn btn-lg btn-outline-info mt-2" disabled>End Turn</button>
			</div>
			{warningContent}
			{!props.disableWarnings && <button className="btn btn-outline-secondary mt-3" disabled>0 warning(s)</button>}
		</React.Fragment>
	}
}

export default TurnControls;