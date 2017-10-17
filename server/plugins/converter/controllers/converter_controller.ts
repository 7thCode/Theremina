/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ConverterModule {

    const fs = require('graceful-fs');
    const _ = require('lodash');

    const mongoose = require('mongoose');

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;

    const Wrapper = share.Wrapper;

    const Exceljs = require("exceljs");

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    export class Excel {

        constructor() {

        }

        public account(request: any, response: any): void {

            let workbook = new Exceljs.Workbook();
            let worksheet = workbook.addWorksheet("Accounts");

            let transformer = {
                columns: [
                    {header: 'Username', key: 'username', width: 32},
                    {header: 'Zip', key: 'zip', width: 10},
                    {header: 'Category', key: 'category', width: 20},
                    {header: 'Street', key: 'street', width: 20},
                    {header: 'City', key: 'city', width: 20},
                    {header: 'Address', key: 'address', width: 32},
                    {header: 'Nickname', key: 'nickname', width: 20},
                    {header: 'Magazine', key: 'send', width: 10}
                ],
                transform: (from): any => {
                    let result: any = {};
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

            Wrapper.Find(response, 5000, LocalAccount, {}, {}, {}, (response: any, accounts: any): any => {
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

    export class Downloader {

        constructor() {

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public download(request: any, response: any): void {

            let delete_folder_recursive = function (path) {
                fs.readdirSync(path).forEach(function (file) {
                    let curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        delete_folder_recursive(curPath);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };

            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/' + request.params.filename;//  '/noname.xlsx';
            response.download(tmp_path + tmp_file, (error: any): void => {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, (error: any): void => {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        }
    }
}

module.exports = ConverterModule;
