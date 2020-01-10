#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var util = require('util');
var getStdin = require('get-stdin');
var Transform = require('stream').Transform;

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
    processFile(process.stdin);
} else if (args.file) {
    let stream = fs.createReadStream(path.join(BASE_PATH, args.file));
    processFile(stream);
} else {
    error('Incorrect usage.');
}

function processFile(inStream) {
    var outStream = inStream;

    var upperStream = new Transform({
        transform(chunk, encoding, callback) {
            this.push(chunk.toString().toUpperCase());
            callback();
        }
    });

    outStream = outStream.pipe(upperStream);

    var targetStream = process.stdout;
    outStream.pipe(targetStream);
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