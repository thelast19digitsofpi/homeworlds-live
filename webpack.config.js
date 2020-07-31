// webpack.config.js
//
// I regret waiting so long to do this...

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

// All these pages use only the basic scripting
const simplePages = ["index", "howThisWorks", "login", "createAccount"].map(function(page) {
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
				"views/tutorial.ejs",
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
	].concat(simplePages),
	mode: "production",
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.ejs$/,
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
	},
	output: {
		publicPath: '/scripts',
	}
};
