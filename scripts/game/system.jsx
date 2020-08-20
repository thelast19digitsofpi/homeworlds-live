// system.js
// 
// Holds one star system.

import React from 'react';
import Piece from './piece.jsx';

class System extends React.PureComponent {
	constructor(props) {
		super(props);
	}
	
	// for use in .sort()
	getShipSortScore(reactElement) {
		const props = reactElement.props;
		// size comes first, then color (alphabetical, blue comes first)
		// enemy ships are sorted backwards
		return (props.size * 1000 - props.color.charCodeAt(0)) * (props.rotation ? -1 : 1);
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
				symbolMode={this.props.symbolMode}
				rotation={rotation}
				scaleFactor={this.props.scaleFactor}
				highlight={shipData.serial === this.props.activePiece}
				
				handleClick={this.props.handleBoardClick}
			/>;
			if (shipData.owner === this.props.viewer) {
				yourShips.push(shipElement);
			} else {
				enemyShips.push(shipElement);
			}
		}
		
		// sort them
		const sortCompare = function(ship1, ship2) {
			return this.getShipSortScore(ship2) - this.getShipSortScore(ship1);
		}.bind(this);
		yourShips.sort(sortCompare);
		enemyShips.sort(sortCompare);
		
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
				symbolMode={this.props.symbolMode}
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

export default System;