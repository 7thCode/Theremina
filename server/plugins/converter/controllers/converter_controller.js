/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConverterModule;
(function (ConverterModule) {
    const fs = require('graceful-fs');
    const _ = require('lodash');
    const mongoose = require('mongoose');
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const Wrapper = share.Wrapper;
    const Exceljs = require("exceljs");
    const LocalAccount = require(share.Models("systems/accounts/account"));
    class Excel {
        constructor() {
        }
        account(request, response) {
            let workbook = new Exceljs.Workbook();
            let worksheet = workbook.addWorksheet("Accounts");
            let transformer = {
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
                transform: (from) => {
                    let result = {};
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
            Wrapper.Find(response, 5000, LocalAccount, {}, {}, {}, (response, accounts) => {
                let aligns = [];
                accounts.forEach((account) => {
                    aligns.push(transformer.transform(account));
                });
                worksheet.addRows(aligns);
                let filename = request.params.filename;
                let tmp_path = '/tmp/' + request.sessionID;
                let tmp_file = '/' + filename;
                let original_mask = process.umask(0);
                fs.mkdir(tmp_path, '0777', () => {
                    workbook.xlsx.writeFile(tmp_path + tmp_file).then(function () {
                        process.umask(original_mask);
                        Wrapper.SendSuccess(response, {});
                    });
                });
            });
        }
    }
    ConverterModule.Excel = Excel;
    class Downloader {
        constructor() {
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        download(request, response) {
            let delete_folder_recursive = function (path) {
                fs.readdirSync(path).forEach(function (file) {
                    let curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) {
                        delete_folder_recursive(curPath);
                    }
                    else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };
            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/' + request.params.filename; //  '/noname.xlsx';
            response.download(tmp_path + tmp_file, (error) => {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, (error) => {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        }
    }
    ConverterModule.Downloader = Downloader;
})(ConverterModule = exports.ConverterModule || (exports.ConverterModule = {}));
module.exports = ConverterModule;
//# sourceMappingURL=converter_controller.js.map