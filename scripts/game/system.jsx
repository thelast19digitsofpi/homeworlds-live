// system.js
// 
// Holds one star system.



class System extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		// Calculate opponent's ships and your ships
		// TODO: change to implement SVG and then 3-4 players
		var enemyShips = [];
		var yourShips = [];
		var stars = [];
		
		// do the ships first
		const ships = this.props.ships;
		for (let i = 0; i < ships.length; i++) {
			const shipData = ships[i];
			// Rotate enemy ships by 180 degrees
			let rotation = 0;
			if (shipData.owner !== this.props.viewer) {
				rotation = 180;
			}
			
			const shipElement = <Piece
				key={shipData.serial}
				serial={shipData.serial}
				type="ship"
				size={shipData.size}
				color={shipData.color}
				symbolMode={false}
				rotation={rotation}
				scaleFactor={this.props.scaleFactor}
				
				handleClick={this.props.handleBoardClick}
			/>;
			if (shipData.owner === this.props.viewer) {
				yourShips.push(shipElement);
			} else {
				enemyShips.push(shipElement);
			}
		}
		
		// now do stars
		for (let i = 0; i < this.props.stars.length; i++) {
			const star = this.props.stars[i];
			// nothing fancy to do here
			stars.push(<Piece
				key={star.serial}
				serial={star.serial}
				type="star"
				size={star.size}
				color={star.color}
				symbolMode={false}
				rotation={0}
				scaleFactor={this.props.scaleFactor}
				
				handleClick={this.props.handleBoardClick}
			/>);
		}
		
		// if homeworld, apply appropriate class
		let className = "system-container";
		if (this.props.homeworld) {
			// It could either be us or our opponent.
			if (this.props.homeworld == this.props.viewer) {
				className += " homeworld homeworld-yours";
			} else {
				className += " homeworld homeworld-enemy";
			}
		}
		
		// stars will be inserted in the middle of course
		return (
			<div className={className}>
				{this.props.id}
				{enemyShips}
				{stars}
				{yourShips}
			</div>
		);
	}
}