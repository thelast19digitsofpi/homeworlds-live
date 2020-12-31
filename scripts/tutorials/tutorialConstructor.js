// tutorialConstructor.js
//
// I'm not really sure why I used this instead of a standard object
// I guess it just looked better
function Tutorial(data) {
	this.id = data.id;
	this.title = data.title;
	this.disableWarnings = data.disableWarnings;
	// the second "t" is important!
	this.startMap = data.startMap;
	this.steps = data.steps;
	this.endMessages = data.endMessages;
}

export default Tutorial;