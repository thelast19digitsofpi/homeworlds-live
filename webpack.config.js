// webpack.config.js
//
// I regret waiting so long to do this...

const path = require("path");

module.exports = {
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader",
						options: {
							babelrc: false,
							presets: [["es2015", {modules: false}], "react", "stage-3"],
						},
					}
				],
			}
		]
	},
	entry: {
		index: path.resolve(__dirname, "scripts", "")
	}
};
