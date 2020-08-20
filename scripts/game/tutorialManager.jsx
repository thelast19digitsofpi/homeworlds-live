// tutorialManager.jsx
//
// The component that lets you access the tutorials.

// hope this works...
window.__webpack_nonce__ = "<%= nonce %>";
window.__something_test__ = "<%= nonce %>";
window.__other_test__ = "[[ nonce ]]";
window.__escape_test__ = "[[:nonce:]]";
window.__whats_going_on__ = "{{nonce}}";

import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
import TutorialGame from './tutorialGame.jsx';

class TutorialManager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tutorial: null,
			pages: [],
			loadingQueue: ["basic", "intermediate", "advanced"],
			pageID: 0,
			loading: false,
			
			// I've made this an error boundary.
			error: null,
		};
	}
	
	// doing this to shorten the length of the bundle file
	// and so that changing basicTutorials does not recompile the whole app
	componentDidMount() {
		this.loadNextBatch();
	}
	
	startTutorial(tutorial) {
		this.setState({
			tutorial: tutorial,
			error: null,
		});
	}
	
	returnToMenu() {
		this.setState({
			tutorial: null,
			error: null,
		});
	}
	
	// parameter is used in case we need this inside a setState(function) call
	getTutorialList(reactState) {
		reactState = reactState || this.state;
		return reactState.pages[reactState.pageID].list;
	}
	
	nextTutorial() {
		this.setState(function(reactState) {
			const tutorialList = this.getTutorialList(reactState);
			const i = tutorialList.indexOf(reactState.tutorial);
			if (i < tutorialList.length) {
				return {
					// Default to null (menu) if they go out of bounds
					tutorial: tutorialList[i + 1] || null,
				};
			} else if (loadingQueue.length) {
				// lazy-load the next tutorial batch
				this.loadNextBatch();
				// We have to give it something to update
				// Tell it to set the thing loading.
				// (We will return to the menu, which makes sense.)
				return {
					loading: true,
				};
			} else {
				return {
					// go back to the menu because you are done
					tutorial: null,
				};
			}
		}.bind(this)); // don't know for sure if .bind is required for setState
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
	
	nextPage() {
		if (this.state.loading) return false;
		
		if (this.state.pageID >= this.state.pages.length - 1) {
			// check if there are more pages to load
			this.loadNextBatch();
		} else {
			this.setState({
				pageID: this.state.pageID + 1,
			});
		}
	}
	
	previousPage() {
		if (this.state.pageID > 0) {
			this.setState({
				pageID: this.state.pageID - 1,
			});
		}
	}
	
	loadNextBatch() {
		if (this.state.loadingQueue.length > 0 && !this.state.loading) {
			const next = this.state.loadingQueue[0];
			this.setState({loading: true});
			import(
				/* webpackMode: "lazy-once" */
				/* webpackExclude: /game\/|\.jsx/ */
				/* webpackChunkName: "/test123[request]" */
			`../tutorials/${next}Tutorials.js`).then(function(stuff) {
				console.log(stuff);
				const page = stuff.default;
				// set our React state to indicate we have them
				this.setState(function(reactState) {
					return {
						pages: reactState.pages.concat([page]),
						pageID: reactState.pages.length, // the old length = the new end
						loading: false,
						// remove that from the loading queue
						loadingQueue: reactState.loadingQueue.slice(1),
					};
				});
			}.bind(this)).catch(function(error) {
				// promises have a weird way of trying and catching
				console.error("INVALID MODULE!", next);
				console.error(error);
				this.setState({
					loading: false,
					// put them on the last page
					pageID: this.state.pages.length - 1,
				});
			}.bind(this));
		}
		// else do nothing.
	}
	
	// handles mostly the error of a null tutorial sent down
	componentDidCatch(something) {
		console.error("ComponentDidCatch", arguments);
		this.setState({
			tutorial: null,
			error: something,
		});
	}
	
	render() {
		if (this.state.loading || this.state.pages.length === 0) {
			return <React.Fragment>
				<h3>Interactive Tutorials</h3>
				<p className="subtitle">If you prefer to learn by doing, here are my tutorial modules which cover the basics of gameplay.</p>
				<div className="d-flex justify-content-center align-items-center">
					<h1 align="center">Loading . . .</h1>
				</div>
			</React.Fragment>;
		}
		if (!this.state.tutorial) {
			// no active tutorial
			// display menu
			const tutorialList = this.getTutorialList();
			const listItems = [];
			for (let i = 0; i < tutorialList.length; i++) {
				listItems.push(<a className="list-group-item"
					onClick={() => this.startTutorial(tutorialList[i])}
					key={i}
					href={"#" + (i+1)}>
					{tutorialList[i].title}
				</a>)
			}
			
			// include non-loaded pages in the queue
			const totalPages = this.state.pages.length + this.state.loadingQueue.length;
			return <React.Fragment>
				<h3>Interactive Tutorials</h3>
				<p className="subtitle">If you prefer to learn by doing, here are my tutorial modules which cover the basics of gameplay.</p>
				{/* Nav Buttons */}
				<div className="btn-group d-flex" role="group">
					<button className="btn btn-secondary"
							onClick={() => this.previousPage()}
							disabled={this.state.pageID <= 0}>
						<i className="material-icons md-18 align-middle">skip_previous</i>
						<span className="align-middle">Previous</span>
					</button>
					<span className="btn btn-secondary">{this.state.pages[this.state.pageID].title}</span>
					<button className="btn btn-secondary"
							onClick={() => this.nextPage()}
							disabled={this.state.pageID >= totalPages - 1}>
						<span className="align-middle">Next</span>
						<i className="material-icons md-18 align-middle">skip_next</i>
					</button>
				</div>
				{/* Tutorial List */}
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

