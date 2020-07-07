const ejs = require("ejs");
const fs = require("fs");

const colors = {
	"g": "#090",
	"b": "#00c",
	"r": "#c00",
	"y": "#cc0",
	"x": "#808080", // used to refer to a generic size when color is not important
};
const pipColor = "#000000";

// ships
// note the use of double-templates... some static things and some dynamic things
const ship_template = ejs.compile(`<% -%>
<svg xmlns="http://www.w3.org/2000/svg" width="<%= shipWidth + 8 %>" height="<%= shipHeight + 8 %>">
	<polygon points="4,<%= shipHeight + 4 %> <%= shipWidth + 4 %>,<%= shipHeight + 4 %> <%= shipWidth/2 + 4 %>,4" fill="<%= color %>" stroke="<%= color %>" stroke-linejoin="round" stroke-width="8" />
  <%_ for (var i = 1; i <= size; i++) { %> <%# note: -13 * (i-1) spaces out the pips when size >= 1 -%>
	<ellipse cx="<%= shipWidth/2 + 4 - 13*(i-1) %>" cy="<%= shipHeight - 8 %>" rx="5" ry="8" fill="${pipColor}" opacity="0.75" stroke="none" />
  <%_ } _%>
</svg>`);

// stars (image is square so width == height)
const star_template = ejs.compile(`<% -%>
<svg xmlns="http://www.w3.org/2000/svg" width="<%= width %>" height="<%= width %>">
	<rect x="0" y="0" width="<%= width %>" height="<%= width %>" rx="4" ry="4" fill="<%= color %>" stroke="${pipColor}" stroke-width="1" />
	<g stroke="${pipColor}" opacity="0.25">
		<line x1="1" y1="1" x2="<%= width - 1 %>" y2="<%= width - 1 %>" />
		<line x1="1" y1="<%= width - 1 %>" x2="<%= width - 1 %>" y2="1" />
	</g>
	<g fill="${pipColor}" opacity="0.75" stroke="none">
<%_ for (var i = 0; i < size; i++) { -%>
 		<ellipse cx="<%= width/2 + 13*i %>" cy="4" rx="5" ry="2" />
 		<ellipse cx="<%= width/2 - 13*i %>" cy="<%= width - 4 %>" rx="5" ry="2" />
 		<ellipse cx="4" cy="<%= width/2 - 13*i %>" rx="2" ry="5" />
 		<ellipse cx="<%= width - 4 %>" cy="<%= width/2 + 13*i %>" rx="2" ry="5" />
<%_ } -%>
 	</g>
</svg>`);

// build ships
for (let i = 1; i <= 3; i++) {
	for (var colorName in colors) {
		const sWidth = 20 * (i + 1);
		const sHeight = 32 * (i + 1); 
		let shipSVG = ship_template({
			color: colors[colorName],
			size: i,
			
			shipWidth: sWidth,
			shipHeight: sHeight
		});
		let starSVG = star_template({
			color: colors[colorName],
			size: i,
			width: sWidth + 8
		});
		//console.log(shipSVG);
		fs.writeFile(`images/ship-${colorName}${i}.svg`, shipSVG, function(err) {
			if (err) throw err;
		});
		fs.writeFile(`images/star-${colorName}${i}.svg`, starSVG, function(err) {
			if (err) throw err;
		});
	}
}

