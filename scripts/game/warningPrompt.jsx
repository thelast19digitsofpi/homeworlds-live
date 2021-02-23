// warningPrompt.jsx
//
// Indicates when you end your turn with a warning of sufficiently high severity. The end turn is caught and you must confirm that you really want to.

import React from 'react';

function WarningPrompt(props) {
	// props: warnings and the two events, onClose and onEndTurn
	const warningElements = props.warnings.map(warning => <p key={warning.message}>{warning.message}</p>)
	return <div className="alert alert-light">
		<span className="float-right">
			<button className="btn btn-secondary" onClick={props.onClose}>Cancel</button>
			<button className="btn btn-primary" onClick={props.onEndTurn} ref={props.warningRef}>End Turn</button>
		</span>
		<h4 className="text-warning">Are you sure?</h4>
		{warningElements}
	</div>
}

export default WarningPrompt;