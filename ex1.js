#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var util = require('util');
var getStdin = require('get-stdin');

var BASE_PATH = path.resolve(
    process.env.BASE_PATH || __dirname
);

var args = minimist(process.argv.slice(2), {
    boolean: ['help', 'in'],
    string: ['file']
});

if (args.help) {
    printHelp();
} else if (
    args.in ||
    args._.includes('-')
) {
    getStdin()
        .then(processFile)
        .catch(error);
} else if (args.file) {
    fs.readFile(path.join(BASE_PATH, args.file), function (err, contents) {
        if (err) {
            error(err.toString());
        } else {
            processFile(contents.toString());
        }
    });
} else {
    error('Incorrect usage.');
}

function processFile(contents) {
    contents = contents.toString().toUpperCase();
    process.stdout.write(contents);
}

function error(msg, includeHelp = true) {
    console.error(msg);

    if (includeHelp) {
        console.log('');
        printHelp();
    }
}

function printHelp() {
    console.log('ex1 usage:');
    console.log('   ex1.js --file={FILENAME}');
    console.log('');
    console.log('--help            print this help');
    console.log('--file={FILENAME} process the file');
    console.log('--in, -          process stdin');
    console.log('');
}