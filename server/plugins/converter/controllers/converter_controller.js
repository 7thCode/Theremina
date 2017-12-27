/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConverterModule;
(function (ConverterModule) {
    var fs = require('graceful-fs');
    var _ = require('lodash');
    var mongoose = require('mongoose');
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var Wrapper = share.Wrapper;
    var Exceljs = require("exceljs");
    var LocalAccount = require(share.Models("systems/accounts/account"));
    var Excel = (function () {
        function Excel() {
        }
        Excel.prototype.account = function (request, response) {
            var workbook = new Exceljs.Workbook();
            var worksheet = workbook.addWorksheet("Accounts");
            var transformer = {
                columns: [
                    { header: 'Username', key: 'username', width: 32 },
                    { header: 'Zip', key: 'zip', width: 10 },
                    { header: 'Category', key: 'category', width: 20 },
                    { header: 'Street', key: 'street', width: 20 },
                    { header: 'City', key: 'city', width: 20 },
                    { header: 'Address', key: 'address', width: 32 },
                    { header: 'Nickname', key: 'nickname', width: 20 },
                    { header: 'Magazine', key: 'send', width: 10 }
                ],
                transform: function (from) {
                    var result = {};
                    result.username = from.username;
                    if (from.local) {
                        result.zip = from.local.zip;
                        result.category = from.local.category;
                        result.street = from.local.street;
                        result.city = from.local.city;
                        result.address = from.local.address;
                        result.nickname = from.local.nickname;
                        if (from.local.magazine) {
                            result.send = from.local.magazine.send;
                        }
                    }
                    return result;
                }
            };
            worksheet.columns = transformer.columns;
            Wrapper.Find(response, 5000, LocalAccount, {}, {}, {}, function (response, accounts) {
                var aligns = [];
                accounts.forEach(function (account) {
                    aligns.push(transformer.transform(account));
                });
                worksheet.addRows(aligns);
                var filename = request.params.filename;
                var tmp_path = '/tmp/' + request.sessionID;
                var tmp_file = '/' + filename;
                var original_mask = process.umask(0);
                fs.mkdir(tmp_path, '0777', function () {
                    workbook.xlsx.writeFile(tmp_path + tmp_file).then(function () {
                        process.umask(original_mask);
                        Wrapper.SendSuccess(response, {});
                    });
                });
            });
        };
        return Excel;
    }());
    ConverterModule.Excel = Excel;
    var Downloader = (function () {
        function Downloader() {
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        Downloader.prototype.download = function (request, response) {
            var delete_folder_recursive = function (path) {
                fs.readdirSync(path).forEach(function (file) {
                    var curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) {
                        delete_folder_recursive(curPath);
                    }
                    else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };
            var tmp_path = '/tmp/' + request.sessionID;
            var tmp_file = '/' + request.params.filename; //  '/noname.xlsx';
            response.download(tmp_path + tmp_file, function (error) {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, function (error) {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        };
        return Downloader;
    }());
    ConverterModule.Downloader = Downloader;
})(ConverterModule = exports.ConverterModule || (exports.ConverterModule = {}));
module.exports = ConverterModule;
//# sourceMappingURL=converter_controller.js.map