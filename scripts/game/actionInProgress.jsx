// actionInProgress.jsx
//
// Used for the alert banner that shows up when you are in the middle of some
// action, like creating a homeworld or discovering a system.

function ActionInProgress(props) {
	const aip = props.actionInProgress;
	if (aip) {
		const message = "Click on " + (
			aip.type === "trade" ? "a piece in the stash to TRADE for" :
			aip.type === "move" ? "any star on the board to MOVE there" :
			aip.type === "discover" ? "a piece in the stash to DISCOVER" :
			aip.type === "homeworld" ? (
				(!aip.star1) ? "a piece in the stash for your FIRST star" :
				(!aip.star2) ? "a piece in the stash for your SECOND star" :
				(!aip.ship) ? "a piece in the stash for your SHIP" :
				"the END TURN button to finalize!"
			) :
			"...something... [this is probably a bug!]"
		);
		// use the correct icon
		const icon = (
			aip.type === "trade" ? "autorenew" :
			aip.type === "move" ? "navigation" :
			aip.type === "discover" ? "add_location" :
			aip.type === "homeworld" ? "add_box" : "info" // info is the fallback
		);
		return <p className="alert alert-secondary">
			<i className="material-icons mr-1">{icon}</i>
			{message}
		</p>;
	} else {
		return null;
	}
}