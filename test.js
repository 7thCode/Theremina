'use strict';
var request = require('request');
var async = require('async');
function Get(url, callback) {
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
    let func = null;
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
//# sourceMappingURL=test.js.map