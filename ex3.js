#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var util = require('util');
var Transform = require('stream').Transform;
var zlib = require('zlib');

var CAF = require('caf');

var args = minimist(process.argv.slice(2), {
    boolean: ['help', 'in', 'out', 'compress', 'uncompress'],
    string: ['file']
});

processFile = CAF(processFile);

function streamComplete(stream) {
    return new Promise(resolve => {
        stream.on('end', resolve);
    });
}

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
    let tooLong = CAF.timeout(3, 'Took too long!');

    processFile(tooLong, process.stdin)
        .catch(error);
} else if (args.file) {
    let stream = fs.createReadStream(path.join(BASE_PATH, args.file));
    let tooLong = CAF.timeout(3, 'Took too long!');

    processFile(tooLong, stream)
        .then(() => {
            console.log('Complete!');
        })
        .catch(error);
} else {
    error('Incorrect usage.');
}

function *processFile(signal, inStream) {
    var outStream = inStream;

    if (args.uncompress) {
        let gunzipStream = zlib.createUnzip();
        outStream = outStream.pipe(gunzipStream);
    }

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

    signal.pr.catch(() => {
        outStream.unpipe(targetStream);
        outStream.destroy();
    });

    yield streamComplete(outStream);
}

function error(msg, includeHelp = true) {
    console.error(msg);

    if (includeHelp) {
        console.log('');
        printHelp();
    }
}

function printHelp() {
    console.log('ex3 usage:');
    console.log('   ex3.js --file={FILENAME}');
    console.log('');
    console.log('--help            print this help');
    console.log('--file={FILENAME}  process the file');
    console.log('--in,  -          process stdin');
    console.log('--out, -          process to stdout');
    console.log('--compress, -     gzip the output');
    console.log('--uncompress, -   un-gzip the input');
    console.log('');
}