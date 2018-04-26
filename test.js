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
//const fs = require('fs');
//const path: any = require('path');
//
//var model = require(path.join(process.cwd(), "models/systems/files/file.js"));
//
//var file_path = path.join(process.cwd(), "test.html");
//var readstream = fs.createReadStream(file_path);
////var file_path_2 = path.join(process.cwd(), "test2.html");
////var writestream = fs.createWriteStream(file_path_2);
//
//var writestream = model.writeStream('test.html', {
//metadata: {}
//});
//
//writestream.once('finish', function(){
//console.info('オワタ');
//});
//
//readstream.pipe(writestream);
/*
const wgxpath = require('wgxpath');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let url = 'https://shopping.yahoo.co.jp/search;_ylt=A7dPI1TT7dVZOD8AVHOkKdhE?p=' +
    encodeURIComponent("RJ45") +
    '&aq=&oq=&ei=UTF-8&first=1&ss_first=1&tab_ex=commerce&uIv=on&X=2&mcr=af1d4481817ea02898809ce62a384f03&ts=1507192276&di=&cid=&uIv=on&used=0&pf=&pt=&seller=0&mm_Check=&sc_i=shp_pc_search_searchBox';
//var expressionString_for_name = '//div[@class="elList"]/ul/li[@data-item-pos="1"]/div/div/div/dl/dd/h3/a/span';
let expressionString = '//div[@class="elList"]/ul/li[@data-item-pos="1"]/div/div/div/dl/dd[@class="elPrice"]/p/span';


JSDOM.fromURL(url, {
    userAgent: ""
}).then(dom => {
  let window = dom.window;
  if (window) {
      wgxpath.install(window);
      let expression = window.document.createExpression(expressionString);
      let result = expression.evaluate(window.document, wgxpath.XPathResultType.STRING_TYPE);
      if (result.stringValue.length > 0) {
         let a = result.stringValue;
      } else {
        let b = 1;
      }
  }

});

*/
var request = require('request');
var async = require('async');
function Get(url, callback) {
    request.get(url, {}, function (error, response, body) {
        callback();
    });
}
var urls = [
    ["get", '', {}, "1"],
    ["get", '', {}, "1"],
    ["get", '', {}, "1"],
    ["get", '', {}, "1"]
];
var server = "http://chintai-keiei.net/cms/seminar/doc/";
//let server = "http://localhost:8000";
//let server = "http://133.242.22.100:2001";
var funcs = [];
urls.forEach(function (url) {
    var func = null;
    switch (url[0]) {
        case "get":
            func = function (callback) {
                Get(server + url[1], function () {
                    callback(null, "");
                    console.log(url[1] + " " + url[3]);
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