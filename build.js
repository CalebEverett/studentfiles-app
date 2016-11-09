'use strict';

const Promise = require('bluebird');
const babel = require("babel-core");
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const dest = 'dist';

const options = {
	babelrc: false,
	presets: ["es2015-node"],
	sourceMaps: false
};

const filesToTransform = [
	'app.js',
	'bin/www',
	'lib/db.js',
	'lib/encrypt.js',
	'lib/hbsHelpers.js',
	'lib/login.js',
	'public/scripts/sortable.js',
	'routes/index.js',
	'routes/login.js'
];

const filesToCopy = [
	'views',
	'public/assets',
	'public/ccclogo.png',
	'public/favicon.ico',
	'public/favicon.png',
	'public/style.css',
];


function babelTransform (file) {
	return new Promise((resolve, reject) => {
		babel.transformFile(file, options, (err, result) => {
			if (err) {
				reject(new Error(chalk.red("Babel transform failed: " + err)));
			} else {
                fs.outputFileSync(dest + '/' + file, result.code);
                if (options.sourceMaps) fs.outputFileSync(dest + '/maps/' + file, JSON.stringify(result.map, null, 4));
                console.log(file + ' transformed');
                resolve(file);
            }
		})
	})
}

(function doBuild () {
	fs.removeSync(dest)
	Promise.each(filesToCopy, file => {return fs.copySync(file, dest + '/' + file) })
	.then(() => { return console.log("Files copie") })
	.then(() => {return Promise.each(filesToTransform, file => babelTransform(file))})
	.then(() => { return console.log("Files tranformed") })
	.then(() => {
		console.log(chalk.green("Build completed"));
		process.exit()
	})
	.catch(error => console.log(error))
})();
