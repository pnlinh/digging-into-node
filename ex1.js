#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');

var args = minimist(process.argv.slice(2), {
    boolean: ['help'],
    string: ['file']
});

if (args.help) {
    printHelp();
} else if (args.file) {
    processFile(path.resolve(args.file))
} else {
    error('Incorrect usage.');
}

function processFile(filepath) {
    fs.readFile(filepath, function (err, contents) {
        if (err) {
            error(err.toString());
        } else {
            process.stdout.write(contents);
        }
    });
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
    console.log('');
}