// gameRooms.jsx
//
// The component for showing the list of all game rooms.
// Note that this is a function prop. See specificRoom.jsx for more...

function GameRooms(props) {
	console.log(props);
	const list = props.list;
	let trows = [];
	const userToElement = (user) => <p className="mb-0" key={user.username}>{user.username}</p>;
	for (let i = 0; i < list.length; i++) {
		const room = list[i];
		let timeString = "None";
		if (room.options && room.options.timeControl) {
			const tc = room.options.timeControl;
			const seconds = tc.start % 60;
			timeString = (
				Math.floor(tc.start / 60) + "m" +
				// e.g. 7m30s but not 10m0s
				(seconds ? (seconds + "s") : "") +
				// if a bonus is added, add e.g. "+ 5d" (delay) or "+ 3i" (increment)
				(tc.bonus ? " + " + tc.bonus + tc.type[0].toUpperCase() : "")
			)
		}
		
		// Use color to indicate rooms you own or are invited to
		let rowClassName = "";
		// If you are in the room...
		for (let j = 0; j < room.players.length; j++) {
			const player = room.players[j];
			if (player.username === YOUR_USERNAME) {
				// Use blue for rooms you own
				rowClassName = (j === 0 ? "table-primary" : "table-secondary");
				break;
			}
		}
		// Or if you are invited...
		for (let j = 0; j < room.invitedPlayers.length; j++) {
			const player = room.invitedPlayers[j];
			if (player.username === YOUR_USERNAME) {
				rowClassName = "table-warning";
			}
		}
		
		trows.push(
			<tr key={room.id} onClick={() => props.onRowClick(room.id)} className={rowClassName}>
				<th>{room.id}</th>
				<td>{room.numPlayers}</td>
				<td>{room.players.map(userToElement)}</td>
				<td>{room.invitedPlayers.map(userToElement)}</td>
				<td>{timeString}</td>
			</tr>
		);
	}
	
	return <table className="table table-striped table-hover table-sm">
		<caption>Invited column shows players who were invited but did not actually join yet. Time control: m,s = minutes and seconds of initial time. D = delay, I = increment, both in seconds.</caption>
		<thead>
			<tr>
				<th>Room #</th>
				<th>Player Count</th>
				<th>Joined</th>
				<th>Invited</th>
				<th>Time Control</th>
			</tr>
		</thead>
		<tbody>
			{trows}
		</tbody>
	</table>;
}
