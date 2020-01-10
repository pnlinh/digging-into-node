#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var util = require('util');
var getStdin = require('get-stdin');
var Transform = require('stream').Transform;
var zlib = require('zlib');

var args = minimist(process.argv.slice(2), {
    boolean: ['help', 'in', 'out', 'compress'],
    string: ['file']
});

var BASE_PATH = path.resolve(
    process.env.BASE_PATH || __dirname
);

var OUTFILE = path.join(BASE_PATH, 'out.txt');

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

    if (args.compress) {
        let gzipStream = zlib.createGzip();
        outStream = outStream.pipe(gzipStream);
        OUTFILE = `${OUTFILE}.gz`;
    }

    var targetStream;
    if (args.out) {
        targetStream = process.stdout;
    } else {
        targetStream = fs.createWriteStream(OUTFILE);
    }
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
    console.log('--file={FILENAME}  process the file');
    console.log('--in,  -          process stdin');
    console.log('--out, -          process to stdout');
    console.log('--compress, -     gzip the output');
    console.log('');
}