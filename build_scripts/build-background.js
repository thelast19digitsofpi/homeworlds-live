
const fs = require("fs");

const width = 1000;
const height = 750;

let stars = [];
for (let i = 0; i < 320; i++) {
	const cx = (Math.random() * width).toFixed(1);
	const cy = (Math.random() * height).toFixed(1);
	const r = (Math.random() * 2).toFixed(1);
	// sqrt biases towards higher numbers
	const opacity = Math.sqrt(Math.random() * 0.25).toFixed(2);
	stars.push(`    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" opacity="${opacity}" />`);
}


const output = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">\n` +
	stars.join("\n") + "\n" +
	"</svg>";

fs.writeFile("images/background.svg", output, function(err) {
	if (err) {
		throw err;
	}
});
