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
				use: ["babel-loader"]
			}
		]
	},
	entry: {
		index: path.resolve(__dirname, "scripts", "")
	}
};
