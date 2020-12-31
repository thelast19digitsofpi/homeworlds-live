// webpack.config.js
//
// I regret waiting so long to do this...

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

// All these pages use only the basic scripting
const simplePages = ["index", "howThisWorks", "login", "createAccount", "changePassword", "orDidI", "404", "admin"].map(function(page) {
	return new HtmlWebpackPlugin({
		hash: true,
		chunks: ["vendor"],
		filename: `./${page}.ejs`,
		template: `./views/${page}.ejs`,
	});
});

module.exports = {
	plugins: [
		new webpack.ProvidePlugin({
			_: "lodash",
		}),
		new CopyPlugin({
			patterns: [
				"views/headElement.ejs",
				"views/header.ejs",
				"views/footer.ejs",
				"views/archiveTable.ejs",
			],
		}),
		new HtmlWebpackPlugin({
			hash: true,
			chunks: ["vendor", "sandbox"],
			filename: "./sandbox.ejs",
			template: "./views/sandbox.ejs",
		}),
		new HtmlWebpackPlugin({
			hash: true,
			chunks: ["vendor", "lobby"],
			filename: "./lobby.ejs",
			template: "./views/lobby.ejs",
		}),
		new HtmlWebpackPlugin({
			hash: true,
			chunks: ["vendor", "liveGame"],
			filename: "./liveGame.ejs",
			template: "./views/liveGame.ejs",
		}),
		new HtmlWebpackPlugin({
			hash: true,
			chunks: ["vendor", "archiveGame"],
			filename: "./archiveViewer.ejs",
			template: "./views/archiveViewer.ejs",
		}),
		new HtmlWebpackPlugin({
			hash: true,
			chunks: ["vendor", "tutorial"],
			filename: "./tutorial.ejs",
			template: "./views/tutorial.ejs",
		}),
		{
			apply: function(compiler) {
				// I have no idea why this works and it's not well documented
				// I just wanted the "watch" command to put a unique number after each compile so I know when it recompiles
				compiler.hooks.afterEmit.tap('AfterEmitPlugin', function() {
					setTimeout(function() {
						console.log("Compiled.", Math.random());
					}, 1000);
				})
			}
		}
	].concat(simplePages),
	mode: "development",
	devtool: "eval",
	resolve: {
		symlinks: false,
	},
	module: {
		rules: [
			{
				test: /\.ejs$/,
				exclude: /node_modules/,
				loader: "ejs-loader",
				options: {
					variable: "data",
					interpolate: /\{\{(.+?)\}\}/,
					evaluate: /\[\[(.+?)\]\]/,
					escape: /\[\[\:(.+?)\:\]\]/,
				}
			},
			{
				test: /\.jsx$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader",
						options: {
							babelrc: false,
							presets: ["@babel/preset-env", "@babel/react"],
							plugins: ["@babel/plugin-syntax-dynamic-import"]
						},
					}
				],
			}
		]
	},
	entry: {
		vendor: path.resolve(__dirname, "scripts", "bootstrap", "bootstrap.min.js"),
		sandbox: path.resolve(__dirname, "scripts", "game", "sandbox.jsx"),
		lobby: path.resolve(__dirname, "scripts", "lobby", "mainLobby.jsx"),
		liveGame: path.resolve(__dirname, "scripts", "game", "liveGame.jsx"),
		archiveGame: path.resolve(__dirname, "scripts", "game", "archiveViewer.jsx"),
		tutorial: path.resolve(__dirname, "scripts", "game", "tutorialManager.jsx"),
	},
	output: {
		publicPath: '/scripts',
	}
};
