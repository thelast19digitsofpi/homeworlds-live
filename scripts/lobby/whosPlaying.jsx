// whosPlaying.jsx
//
// Like whosOnline but displays who is playing currently

import React from 'react';

function WhosPlaying(props) {
	const list = props.list;
	
	let elements = [];
	for (var i = 0; i < list.length; i++) {
		const user = list[i];
		elements.push(
			<li key={user.username}>
				<a href={"/game/" + user.gameID}>
					<i className="material-icons mr-2 text-info">{user.connected ? "pending" : "power_off"}</i>
					{user.username}
					({user.elo})
					game #{user.gameID}
				</a>
			</li>
		)
	}
	
	return <ul>{elements}</ul>;
}

export default WhosPlaying;