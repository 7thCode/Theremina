/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace GoogleModule {

    // const fs = require('graceful-fs');
   // const _: any = require('lodash');

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const google: any = require('googleapis');
    const googleAuth: any = require('google-auth-library');
    const ga_analytics = require("ga-analytics");

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const Wrapper: any = share.Wrapper;

    const plugins_config: any = share.plugins_config;

    export class Calendar {

        private auth: any;
        private oauth2Client: any;

        // plugins_config.google_api.
        constructor(calendar) {
            let clientSecret = calendar.client_secret;
            let clientId = calendar.client_id;
            let redirectUrl = calendar.redirect_uris[1];
            this.auth = new googleAuth();
            this.oauth2Client = new this.auth.OAuth2(clientId, clientSecret, redirectUrl);
        }

        // already auth
        public authorize(tokens: any, callback: (client: any, tokens: any) => void): void {
            if (tokens) {
                this.oauth2Client.credentials = tokens;
                callback(this.oauth2Client, tokens);
            } else {
                callback(null, null);   // not auth etc...
            }
        }

        // new auth step1
        public authorize_url(scopes: string[]): string {
            return this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes
            });
        }

        // new auth step2
        public authorize_callback(code: any, callback: (client: any, tokens: any) => void): void {
            this.oauth2Client.getToken(code, (error: any, tokens: any): void => {
                if (!error) {
                    this.oauth2Client.credentials = tokens;
                    callback(this.oauth2Client, tokens);
                } else {
                    callback(null, null);   // not auth etc...
                }
            });
        }

        // etc etc...
        public calendar(auth: any, callback: (error: any, result: string) => void): void {
            let result = "";
            let calendar: any = google.calendar({auth: auth, version: "v3"});

            calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            }, (error: any, response: any): void => {

                if (!error) {
                    let events: any = response.items;

                    for (let i = 0; i < events.length; i++) {
                        let event: any = events[i];
                        let start: any = event.start.dateTime || event.start.date;
                        result += start + "-" + event.summary;
                    }
                    callback(null, result);
                } else {
                    callback(error, "");
                }

            });
        }

        // etc etc...
        public insert_calendar(auth: any, callback: (error: any, result: string) => void): void {

            let event = {
                'summary': 'Google I/O 2015',
                'location': '800 Howard St., San Francisco, CA 94103',
                'description': 'A chance to hear more about Google\'s developer products.',
                'start': {
                    'dateTime': '2017-05-28T09:00:00-07:00',
                    'timeZone': 'America/Los_Angeles'
                },
                'end': {
                    'dateTime': '2017-05-28T17:00:00-07:00',
                    'timeZone': 'America/Los_Angeles'
                },
                'recurrence': [
                    'RRULE:FREQ=DAILY;COUNT=2'
                ],
                'attendees': [
                    {'email': 'lpage@example.com'},
                    {'email': 'sbrin@example.com'}
                ],
                'reminders': {
                    'useDefault': false,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 10}
                    ]
                },
            };

            let calendar: any = google.calendar({auth: auth, version: "v3"});

            calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            }, (error: any, response: any): void => {

                if (!error) {
                    callback(null, response.htmlLink);
                } else {
                    callback(error, "");
                }

            });
        }

        // etc etc...
        public analytics(auth: any, callback: (error: any, result: string) => void): void {
            let analytics = google.analytics({auth: auth, version: "v3"});

            analytics.data.ga.get({
                ids: "ga:" + "76780519",
                "start-date": "30daysAgo",
                "end-date": "yesterday",
                metrics: "ga:users,ga:percentNewSessions,ga:bounceRate",
                dimensions: "ga:userType"
            }, (error, rows): void => {
                if (!error) {
                    callback(null, rows);
                } else {
                    callback(error, "");
                }
            });
        }
    }

    export class Analytics {

        public get(request: any, response: any): void {

            let ga = plugins_config.google_api.analytics;

            let dimensions = Wrapper.Parse(decodeURIComponent(request.params.dimensions));

            dimensions["clientId"] = ga.client_id;
            dimensions["serviceEmail"] = ga.service_account_email;
            dimensions["key"] = ga.service_account_key_file;
            dimensions["ids"] = ga.ids;

            ga_analytics(dimensions, (error, result) => {
                if (!error) {
                    Wrapper.SendSuccess(response, result);
                } else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        };


        /*
                public create(request: any, response: any): void {
                    let workbook = new Exceljs.Workbook();
                    let ga = plugins_config.google_api.analytics;



                    let ReadAdwords = (path: string, callback: (error, records) => void): void => {
                        fs.readFile(path, (err, data) => {
                            if (!err) {
                                let utf8 = iconv.decode(data, "utf16-le");
                                csv(utf8, {
                                    delimiter: '\t',
                                    rowDelimiter: '\r\n',
                                    quote: '',
                                    escape: '"',
                                    columns: null,
                                    comment: '#',
                                    skip_empty_line: false,
                                    trim: false
                                }, callback);
                            } else {
                                callback(err, null);
                            }
                        });


                    };

                    let ReadYahoo = (path: string, callback: (error, records) => void): void => {
                        fs.readFile(path, (err, data) => {
                            if (!err) {
                                let utf8 = iconv.decode(data, "Shift_JIS");
                                csv(utf8, {
                                    delimiter: ',',
                                    rowDelimiter: '\r\n',
                                    quote: '',
                                    escape: '"',
                                    columns: null,
                                    comment: '#',
                                    skip_empty_line: false,
                                    trim: false
                                }, callback);
                            } else {
                                callback(err, null);
                            }
                        });



                    };

                    let ByMediatype = (rows: any[]): any => {


                        let bymedia: any = {};
                        let sheet: any[] = [];
                        let name = "";
                        rows.forEach((item: string[]): void => {
                            if (name != item[0]) {
                                sheet = [];
                                sheet.push(transformer.transform(item));
                                bymedia[item[0]] = sheet;
                                name = item[0];
                            } else {
                                sheet.push(transformer.transform(item))
                            }
                        });


                        let bytype = {};
                        Object.keys(bymedia).forEach((sourceMedium: string): void => {
                            let mediatype = sourceMedium.split("/")[1].trim();
                            if (bytype[mediatype]) {
                                bytype[mediatype] = _.concat(bytype[mediatype], bymedia[sourceMedium]);
                            } else {
                                bytype[mediatype] = bymedia[sourceMedium];
                            }
                        });
                        return bytype;
                    };

                    let filename = "Yahooデイリーレポート.csv";// decodeURIComponent(request.params.filename);
                    let tmp_path = '/tmp/' + request.sessionID;
                    let tmp_file = '/' + filename;
                    ReadYahoo(tmp_path + tmp_file, (error, externalyahoo) => {
                        if (!error) {
                            let filename = "Adwordsデイリーレポート.csv";// decodeURIComponent(request.params.filename);
                            let tmp_path = '/tmp/' + request.sessionID;
                            let tmp_file = '/' + filename;
                            ReadAdwords(tmp_path + tmp_file, (error, externaladwords) => {

                                let dimensions = {
                                    dimensions: 'ga:sourceMedium,ga:date',
                                    metrics: 'ga:bounceRate,ga:sessions,ga:users,ga:pageviews,ga:pageviewsPerSession,ga:avgSessionDuration,ga:goal7Completions,ga:goal8Completions',
                                    startDate: '2017-06-30',
                                    endDate: '2017-07-18',
                                    sort: 'ga:sourceMedium',
                                    clientId: ga.client_id,
                                    serviceEmail: ga.service_account_email,
                                    key: ga.service_account_key_file,
                                    ids: ga.ids
                                };
                                let transformer = {
                                    transform: (from: string[]): any => {
                                        let result: any = {};
                                        result.sourceMedium = from[0].split("/")[0].trim();

                                        let y = parseInt((from[1].substr(0, 4)));
                                        let m = parseInt((from[1].substr(4, 2))) - 1;
                                        let d = parseInt((from[1].substr(6, 2)));

                                        result.date = new Date(y, m, d);
                                        result.bounceRate = (parseFloat(from[2]) / 100);
                                        result.sessions = parseInt(from[3]);
                                        result.users = parseInt(from[4]);
                                        result.pageviews = parseInt(from[5]);
                                        result.pageviewsPerSession = (parseFloat(from[6]) / 100);
                                        result.avgSessionDuration = Math.floor(parseFloat(from[7]));
                                        result.goal7Completions = parseInt(from[8]);
                                        result.goal8Completions = parseInt(from[9]);
                                        result.conversion = ((parseInt(from[8]) + parseInt(from[9])) / parseInt(from[3]));
                                        return result;
                                    }
                                };
                                ga_analytics(dimensions, (error, result) => {
                                    if (!error) {
                                        let adwords_dimensions = {
                                            dimensions: 'ga:date',
                                            metrics: 'ga:impressions,ga:adClicks,ga:adCost,ga:CPC,ga:CTR',
                                            startDate: '2017-06-30',
                                            endDate: '2017-07-18',
                                            sort: 'ga:date',
                                            clientId: ga.client_id,
                                            serviceEmail: ga.service_account_email,
                                            key: ga.service_account_key_file,
                                            ids: ga.ids
                                        };
                                        let adwords_transformer = {

                                            transform: (from: string[]): any => {
                                                let result: any = {};

                                                let y = parseInt((from[0].substr(0, 4)));
                                                let m = parseInt((from[0].substr(4, 2))) - 1;
                                                let d = parseInt((from[0].substr(6, 2)));

                                                result.date = new Date(y, m, d);
                                                result.impressions = parseInt(from[1]);
                                                result.adClicks = parseInt(from[2]);
                                                result.adCost = parseInt(from[3]);
                                                result.CPC = parseInt(from[4]);
                                                result.CTR = parseInt(from[5]) / 100;
                                                return result;
                                            }
                                        };

                                        ga_analytics(adwords_dimensions, (error, adwords_result) => {
                                            if (!error) {
                                                let bytype = ByMediatype(result.rows);
                                                let cpc: any[] = bytype["cpc"];

                                                let organic: any[] = _.concat(bytype["organic"], bytype["referral"]);
                                                let google: any[] = [];
                                                let yahoolisting: any[] = [];

                                                let adwords: any[] = [];
                                                adwords_result.rows.forEach((row) => {
                                                    adwords.push(adwords_transformer.transform(row));
                                                });

                                                cpc.forEach((row) => {
                                                    switch (row["sourceMedium"]) {
                                                        case "google":
                                                            google.push(row);
                                                            break;
                                                        case "yahoolisting":
                                                            yahoolisting.push(row);
                                                            break;
                                                        default:
                                                    }
                                                });

                                                // marge analytics & adwords by date

                                                google.forEach((google_row) => {
                                                    adwords.forEach((adwords_row) => {
                                                        if (google_row.date.getTime() === adwords_row.date.getTime()) {
                                                            google_row.impressions = adwords_row.impressions;
                                                            google_row.adClicks = adwords_row.adClicks;
                                                            google_row.adCost = adwords_row.adCost;
                                                            google_row.CPC = adwords_row.CPC;
                                                            google_row.CTR = adwords_row.CTR;
                                                        }
                                                    });
                                                });

                                                google.forEach((google_row) => {
                                                    externaladwords.forEach((externaladwords_row) => {
                                                        let separeted_date: string[] = externaladwords_row[0].split("/");
                                                        let y = parseInt(separeted_date[0]);
                                                        let m = parseInt(separeted_date[1]) - 1;
                                                        let d = parseInt(separeted_date[2]);
                                                        let externaladwords_row_date: any = new Date(y, m, d);
                                                        if (google_row.date.getTime() === externaladwords_row_date.getTime()) {
                                                            google_row.position = parseInt(externaladwords_row[5]);
                                                        }
                                                    });
                                                });

                                                yahoolisting.forEach((yahoo_row) => {
                                                    externalyahoo.forEach((externalyahoo_row) => {
                                                        let separeted_date: string[] = externalyahoo_row[0].split("/");
                                                        let y = parseInt(separeted_date[0]);
                                                        let m = parseInt(separeted_date[1]) - 1;
                                                        let d = parseInt(separeted_date[2]);
                                                        let externalyahoo_row_date: any = new Date(y, m, d);
                                                        if (yahoo_row.date.getTime() === externalyahoo_row_date.getTime()) {
                                                            yahoo_row.impressions = parseInt(externalyahoo_row[1]);
                                                            yahoo_row.adClicks = parseInt(externalyahoo_row[2]);
                                                            yahoo_row.CTR =  parseInt(externalyahoo_row[3]);
                                                            yahoo_row.position = parseInt(externalyahoo_row[4]);
                                                            yahoo_row.adCost = parseInt(externalyahoo_row[5]);
                                                            yahoo_row.CPC = parseInt(externalyahoo_row[6]);
                                                        }
                                                    });
                                                });




                                                // google
                                                // yahoolisting
                                                // organic





                                                // wirte

                                                let filename = decodeURIComponent(request.params.filename);
                                                let tmp_path = '/tmp/' + request.sessionID;
                                                let tmp_file = '/' + filename;
                                                fs.mkdir(tmp_path, (error: any): void => {
                                                    workbook.xlsx.writeFile(tmp_path + tmp_file).then(function () {
                                                        Wrapper.SendSuccess(response, {});
                                                    });
                                                });

                                            }
                                        });
                                    } else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            });
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });

                };
        */

        //メール   電話	    合計  imp  CTR  CPC	掲載順位    広告費用    直帰率 セッション	ユーザー    PV合計    PV平均    滞在時間	CVR(メール)　CVR(電話)    CVR
        //worksheet.getCell('A5').value =  { formula: "SUM(C2:C4)" };
        /*
                public create2(request: any, response: any): void {

                    let ga = plugins_config.google_api.analytics;

                    let dimensions = {
                        dimensions: 'ga:date',
                        metrics: 'ga:impressions,ga:adClicks,ga:adCost,ga:CPC,ga:CTR',
                        startDate: '2017-06-30',
                        endDate: '2017-07-18',
                        sort: 'ga:date'
                    };

                    dimensions["clientId"] = ga.client_id;
                    dimensions["serviceEmail"] = ga.service_account_email;
                    dimensions["key"] = ga.service_account_key_file;
                    dimensions["ids"] = ga.ids;

                    let transformer = {
                        columns: [

                            {header: '日付', key: 'date', width: 10, style: {numFmt: 'yyyy/mm/dd'}},
                            {header: 'impressions', key: 'impressions', width: 10},
                            {header: 'adClicks', key: 'adClicks', width: 10},
                            {header: 'adCost', key: 'adCost', width: 10},
                            {header: 'CPC', key: 'CPC', width: 10},
                            {header: 'CTR', key: 'CTR', width: 10, style: {numFmt: '0.00%'}}
                        ],
                        transform: (from: string[]): any => {
                            let result: any = {};

                            let y = parseInt((from[0].substr(0, 4)));
                            let m = parseInt((from[0].substr(4, 2))) - 1;
                            let d = parseInt((from[0].substr(6, 2)));

                            result.date = new Date(y, m, d);
                            result.impressions = parseInt(from[1]);
                            result.adClicks = parseInt(from[2]);
                            result.adCost = parseInt(from[3]);
                            result.CPC = parseInt(from[4]);
                            result.CTR = parseInt(from[5]) / 100;
                            return result;
                        }
                    };

                    let workbook = new Exceljs.Workbook();
                    ga_analytics(dimensions, (error, result) => {
                        if (!error) {

                            let worksheet = workbook.addWorksheet("analytics");
                            worksheet.columns = transformer.columns;

                            let aligns = [];
                            result.rows.forEach((account) => {
                                aligns.push(transformer.transform(account));
                            });
                            worksheet.addRows(aligns);

                            // wirte

                            let filename = decodeURIComponent(request.params.filename);
                            let tmp_path = '/tmp/' + request.sessionID;
                            let tmp_file = '/' + filename;
                            fs.mkdir(tmp_path, (error: any): void => {
                                workbook.xlsx.writeFile(tmp_path + tmp_file).then(function () {
                                    Wrapper.SendSuccess(response, {});
                                });
                            });
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                };
        */
    }

    /*
        export class FileTransfer {

            constructor() {

            }

            public upload(request: any, response: any): void {

                let name = request.params.filename;
                if (name) {
                    if (name.indexOf('/') == -1) {
                        let parseDataURL = (dataURL: any): any => {
                            let result = {
                                mediaType: null,
                                encoding: null,
                                isBase64: null,
                                data: null
                            };
                            if (/^data:([^;]+)(;charset=([^,;]+))?(;base64)?,(.*)/.test(dataURL)) {
                                result.mediaType = RegExp.$1 || 'text/plain';
                                result.encoding = RegExp.$3 || 'US-ASCII';
                                result.isBase64 = String(RegExp.$4) === ';base64';
                                result.data = RegExp.$5;
                            }
                            return result;
                        };

                        let info = parseDataURL(request.body.url);
                        let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');

                        let tmp_path = '/tmp/' + request.sessionID;
                        let tmp_file = '/' + name;
                        fs.mkdir(tmp_path, (error: any): void => {
                            fs.writeFile(tmp_path + tmp_file, chunk, (error: any): void => {
                                if (!error) {
                                    Wrapper.SendSuccess(response, {});
                                } else {
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        });
                    }
                }
            }


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
    */
}

module.exports = GoogleModule;
