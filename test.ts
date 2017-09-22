'use strict';
/*

var request = require('request');
var async = require('async');

function Get(url,callback) {
    request.get(url, {}, (error, response, body) => {
        callback();
    });
}


let urls = [

    ["get", '/index.html', {}]

];

//let server = "http://seventh-code.com";
let server = "http://localhost:3000";

//let server = "http://133.242.22.100:2001";

let funcs = [];

urls.forEach((url) => {

    let func:(callback:(a:any, b:string)=> void) => void = null;
    switch (url[0]) {
        case "get":
            func = (callback) => {
                Get(server + url[1], () => {
                    callback(null, "");
                });
            };
            break;

    }
    funcs.push(func);
});


//for (var index = 0; index < 10; index++) {
console.time("time");
//async.series(funcs, function (err, results) {
async.parallel(funcs, function (err, results) {
    console.timeEnd("time");
   });
//});
//}

*/

const fs = require('fs');
const path: any = require('path');

var model = require(path.join(process.cwd(), "models/systems/files/file.js"));

var file_path = path.join(process.cwd(), "test.html");
var readstream = fs.createReadStream(file_path);
//var file_path_2 = path.join(process.cwd(), "test2.html");
//var writestream = fs.createWriteStream(file_path_2);

var writestream = model.writeStream('test.html', {
    metadata: {}
});

writestream.once('finish', function(){
    console.info('オワタ');
});

readstream.pipe(writestream);