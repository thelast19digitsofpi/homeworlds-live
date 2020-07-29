// alerts.jsx
//
// Better than using window.alert(), which may even disconnect the socket!
// Expects a prop function for closing an alert given its index.
// Note that to get HTML (e.g. bold) one must pass a React element as the message.

import React from 'react';

function Alerts(props) {
	return props.list.map(function(alert, index) {
		return <p className={"alert alert-" + alert.type} key={alert.key}>
			{alert.message}
			<button type="button" className="btn btn-light pull-right" onClick={() => props.onClick(index)}>Dismiss</button>
		</p>
	});
}

export default Alerts;