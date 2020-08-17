// tutorialManager.jsx
//
// The component that lets you access the tutorials.

import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
import basicList from '../tutorials/basicTutorials.js';
import intermediateList from '../tutorials/intermediateTutorials.js';
import advancedList from '../tutorials/advancedTutorials.js';
import TutorialGame from './tutorialGame.jsx';

const tutorialList = basicList;
let loadingQueue = ["intermediate", "advanced"];

class TutorialManager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tutorial: null,
			loading: true,
		};
	}
	
	startTutorial(tutorial) {
		this.setState({
			tutorial: tutorial,
		});
	}
	
	returnToMenu() {
		this.setState({
			tutorial: null,
		});
	}
	
	nextTutorial() {
		this.setState(function(reactState) {
			const i = tutorialList.indexOf(reactState.tutorial);
			if (i < tutorialList.length) {
				return {
					// Default to null (menu) if they go out of bounds
					tutorial: tutorialList[i + 1] || null,
				};
			} else if (loadingQueue.length) {
				// lazy-load the next tutorial batch
				this.setState({
					loading: true,
				});
				const next = loadingQueue.shift();
				import(`../tutorials/${next}Tutorials.js`).then(function(tutorials) {
					// we put the new tutorials we got into the global list
					tutorialList.push(...tutorials);
					// and then set our React state
					this.setState({
						tutorial: tutorialList[i + 1],
					});
				}.bind(this)) // no semicolon!
				// catch the error...
				.catch(function(error) {
					console.error("INVALID MODULE!", next);
					console.error(error);
				});
			}
		});
	}
	
	previousTutorial() {
		this.setState(function(reactState) {
			const i = tutorialList.indexOf(reactState.tutorial);
			return {
				// Default to null (menu) if they go out of bounds
				tutorial: tutorialList[i - 1] || null,
			};
		});
	}
	
	// handles mostly the error of a null tutorial sent down
	componentDidCatch(something) {
		console.error("ComponentDidCatch", arguments);
		this.setState({
			tutorial: null,
		});
	}
	
	render() {
		if (!this.state.tutorial) {
			// no active tutorial
			// display menu
			const listItems = [];
			for (let i = 0; i < tutorialList.length; i++) {
				listItems.push(<a className="list-group-item"
					onClick={() => this.startTutorial(tutorialList[i])}
					key={i}
					href={"#" + (i+1)}>
					{tutorialList[i].title}
				</a>)
			}
			return <React.Fragment>
				<h3>Interactive Tutorials</h3>
				<p className="subtitle">If you prefer to learn by doing, here are my tutorial modules which cover the basics of gameplay.</p>
				<div className="list-group">
					{listItems}
				</div>
			</React.Fragment>;
		} else {
			// display the active tutorial
			const navMethods = {
				returnToMenu: this.returnToMenu.bind(this),
				nextTutorial: this.nextTutorial.bind(this),
				previousTutorial: this.previousTutorial.bind(this),
			};
			// use a key to forcefully destroy the component when a new tutorial loads
			return <TutorialGame
				disableWarnings={this.state.tutorial.disableWarnings}
				tutorial={this.state.tutorial}
				key={this.state.tutorial.title}
				navMethods={navMethods} />;
		}
	}
}

ReactDOM.render(<TutorialManager />, document.getElementById("game-container"));

