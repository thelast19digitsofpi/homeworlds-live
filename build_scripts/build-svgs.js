// build-svgs.js
//
// I'm not really proud of this file. I'm not really sure of the best way to do something like this. Making one's own SVG images 

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

const gExtraProps = `opacity="0.75" stroke-width="3" stroke-linejoin="round" fill="none"`

// ships
// note the use of double-templates... some static things and some dynamic things
const ship_template = ejs.compile(`<% -%>
<svg xmlns="http://www.w3.org/2000/svg" width="<%= shipWidth + 8 %>" height="<%= shipHeight + 8 %>">
	<polygon points="4,<%= shipHeight + 4 %> <%= shipWidth + 4 %>,<%= shipHeight + 4 %> <%= shipWidth/2 + 4 %>,4" fill="<%= color %>" stroke="<%= color %>" stroke-linejoin="round" stroke-width="8" />
<% if (pips) { _%>
  <%_ for (var i = 1; i <= size; i++) { %> <%# note: -13 * (i-1) spaces out the pips when size >= 1 -%>
	<ellipse cx="<%= shipWidth/2 + 4 - 13*(i-1) %>" cy="<%= shipHeight - 8 %>" rx="5" ry="8" fill="${pipColor}" opacity="0.75" stroke="none" />
  <%_ } _%>
<% } _%>
  <%_ if (color === '${colors.y}') { %>
  	<!-- Render 1, 2, or 3 copies of the move arrow -->
  	<%_ for (let i = 1; i <= size; i++) { %>
    <g stroke="${pipColor}" ${gExtraProps}
    	transform="translate(<%= shipWidth/2 + 4 %> <%= shipHeight - (i * 30 - 10) %>)">
    	<%- typeof extra !== "undefined" ? extra : null %>
    </g>
    <%_ } %>
  <%_ } else { %>
  	<g stroke="${pipColor}" ${gExtraProps}
  		transform="translate(<%= shipWidth/2 + 4 %> <%= shipHeight*0.75 %>) scale(<%= 0.45 + 0.45*size %>)">
  		<%- typeof extra !== "undefined" ? extra : null %>
  	</g>
  <% } %>
  <%_ if (typeof number !== "undefined") { %>
	<text fill="${pipColor}" text-anchor="middle" font-weight="bold" font-family="Courier New, monospace" x="<%= (shipWidth+8)/2 %>" y="<%= shipHeight * 0.95 %>" font-size="<%= Math.floor(shipHeight * 0.5) %>"><%= size %></text>
<% } _%>
</svg>`);

// stars (image is square so width == height)
const pipDistFromEdge = 5;
const star_template = ejs.compile(`<% -%>
<svg xmlns="http://www.w3.org/2000/svg" width="<%= width %>" height="<%= width %>">
	<rect x="0" y="0" width="<%= width %>" height="<%= width %>" rx="4" ry="4" fill="<%= color %>" stroke="${pipColor}" stroke-width="1" />
	<g fill="${pipColor}" opacity="0.75" stroke="none">
<% if (pips) { _%>
  <%_ for (var i = 0; i < size; i++) { -%>
 		<ellipse cx="<%= width/2 + 13*i %>" cy="${pipDistFromEdge}" rx="5" ry="3" />
 		<ellipse cx="<%= width/2 - 13*i %>" cy="<%= width - ${pipDistFromEdge} %>" rx="5" ry="3" />
 		<ellipse cx="${pipDistFromEdge}" cy="<%= width/2 - 13*i %>" rx="3" ry="5" />
 		<ellipse cx="<%= width - ${pipDistFromEdge} %>" cy="<%= width/2 + 13*i %>" rx="3" ry="5" />
  <%_ } -%>
 <% } _%>
 	</g>
 	<g stroke="${pipColor}" ${gExtraProps} transform="translate(<%= width/2 %> <%= width/2 %>) scale(<%= 0.4 + 0.5*size %>)">
    	<%- typeof extra !== "undefined" ? extra : null %>
    </g>
<%_ if (typeof number !== "undefined") { %>
	<text fill="${pipColor}" text-anchor="middle" font-weight="bold" font-family="Courier New, monospace" x="<%= width/2 %>" y="<%= width * 0.77 %>" font-size="<%= Math.floor(width * 0.8) %>"><%= size %></text>
<% } _%>
</svg>`);

// Symbol designs. More ugly but make it clear what is going on.
// Intend to go inside a <g></g> with position set
// Calibrated for 21x21 (-10 to +10) but can be scaled with standard transforms

const symbols = {
	// Plus sign to build
	// I think a wrench would be too hard to see especially in a G1
	g: `
		<path stroke="white" stroke-width="4" d="M-10,0 h20 M0,-10 v20" />`,

	// Two arrows in opposite directions like this:
	/*  -->
	    <--  */
	b: `
		<path stroke="white" d="M-10,5 h20 l-7,-7 m0,14 l7,-7" />
		<path stroke="white" d="M10,-5 h-20 l7,7 m0,-14 l-7,7" />`,

	// Arrowhead going forward, even though "forward" doesn't really exist.
	y: `
		<path d="M-10,10 l10,-20 l10,20" />`,

	// Explosion (8-pointed star)
	r: `
		<path fill="white" stroke="white" d="M12.0,0.0 L3.7,1.5 L8.5,8.5 L1.5,3.7 L0.0,12.0 L-1.5,3.7 L-8.5,8.5 L-3.7,1.5 L-12.0,0.0 L-3.7,-1.5 L-8.5,-8.5 L-1.5,-3.7 L-0.0,-12.0 L1.5,-3.7 L8.5,-8.5 L3.7,-1.5 Z" />`,
		
	// I don't think I actually used the grey pieces but they would be blank
	x: "",
};

// make the images
for (let i = 1; i <= 3; i++) {
	for (var colorName in colors) {
		const sWidth = 20 * (i + 1);
		const sHeight = 32 * (i + 1); 
		let shipSVG = ship_template({
			color: colors[colorName],
			size: i,
			pips: true,
			shipWidth: sWidth,
			shipHeight: sHeight,
			
			extra: "",
		});
		let starSVG = star_template({
			color: colors[colorName],
			size: i,
			pips: true,
			width: sWidth + 8,
			
			extra: "",
		});
		//console.log(shipSVG);
		fs.writeFile(`images/ship-${colorName}${i}.svg`, shipSVG, function(err) {
			if (err) throw err;
		});
		fs.writeFile(`images/star-${colorName}${i}.svg`, starSVG, function(err) {
			if (err) throw err;
		});
		
		// Symbol mode (colorblind or reference)
		let shipSymbol = ship_template({
			color: colors[colorName],
			size: i,
			// boolean
			pips: (colorName !== "y") && (i > 1), // don't show pips on the smalls
			shipWidth: sWidth,
			shipHeight: sHeight,
			extra: symbols[colorName],
		});
		fs.writeFile(`images/ship-${colorName}${i}-symbol.svg`, shipSymbol, function(err) {
			if (err) throw err;
		});
		
		let starSymbol = star_template({
			color: colors[colorName],
			size: i,
			pips: true, // don't show pips on the smalls
			width: sWidth + 8,
			extra: symbols[colorName],
		});
		fs.writeFile(`images/star-${colorName}${i}-symbol.svg`, starSymbol, function(err) {
			if (err) throw err;
		});
		
		// "Size-blind" mode (draws numbers for sizes)
		let shipNumber = ship_template({
			color: colors[colorName],
			size: i,
			pips: false,
			shipWidth: sWidth,
			shipHeight: sHeight,
			number: true,
		});
		fs.writeFile(`images/ship-${colorName}${i}-number.svg`, shipNumber, function(err) {
			if (err) throw err;
		});
		let starNumber = star_template({
			color: colors[colorName],
			size: i,
			pips: false,
			width: sWidth + 8,
			number: true,
		});
		fs.writeFile(`images/star-${colorName}${i}-number.svg`, starNumber, function(err) {
			if (err) throw err;
		});
	}
}

