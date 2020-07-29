// sandbox.jsx
//
// Allows you to move pieces around and do everything. Could be used to set up puzzles, if you can move the pieces to the right positions.

import React from 'react';
import ReactDOM from 'react-dom';
import withGame from './game.jsx';

function SandboxDisplay(props) {
	return <div className="sandbox">{props.children}</div>;
}
// the empty object is because we have no events
const GameSandbox = withGame(SandboxDisplay, {}, {
	actionInProgress: {
		type: "homeworld",
		player: "south",
	},
});


ReactDOM.render(<GameSandbox />, document.getElementById('game-container'));
