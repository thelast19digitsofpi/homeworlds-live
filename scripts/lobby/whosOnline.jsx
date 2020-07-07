// whosOnline.jsx
//
// React component for displaying the list of all users connected in the lobby.

function WhosOnline(props) {
	const list = props.list;
	
	let elements = [];
	for (var i = 0; i < list.length; i++) {
		const user = list[i];
		let connectedIcon = null;
		if (user.connected) {
			connectedIcon = <i className="material-icons mr-2 text-success">star</i>;
		} else {
			connectedIcon = <i className="material-icons mr-2 text-danger">star_outline</i>;
		}
		elements.push(
			<li key={user.username}>
				{connectedIcon}
				{user.username}
			</li>
		)
	}
	
	return <ul>{elements}</ul>;
}
