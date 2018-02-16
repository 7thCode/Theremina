/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GoogleModule;
(function (GoogleModule) {
    // const fs = require('graceful-fs');
    // const _: any = require('lodash');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var google = require('googleapis');
    var googleAuth = require('google-auth-library');
    var ga_analytics = require("ga-analytics");
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var Wrapper = share.Wrapper;
    var plugins_config = share.plugins_config;
    var Calendar = /** @class */ (function () {
        // plugins_config.google_api.
        function Calendar(calendar) {
            var clientSecret = calendar.client_secret;
            var clientId = calendar.client_id;
            var redirectUrl = calendar.redirect_uris[1];
            this.auth = new googleAuth();
            this.oauth2Client = new this.auth.OAuth2(clientId, clientSecret, redirectUrl);
        }
        // already auth
        Calendar.prototype.authorize = function (tokens, callback) {
            if (tokens) {
                this.oauth2Client.credentials = tokens;
                callback(this.oauth2Client, tokens);
            }
            else {
                callback(null, null); // not auth etc...
            }
        };
        // new auth step1
        Calendar.prototype.authorize_url = function (scopes) {
            return this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes
            });
        };
        // new auth step2
        Calendar.prototype.authorize_callback = function (code, callback) {
            var _this = this;
            this.oauth2Client.getToken(code, function (error, tokens) {
                if (!error) {
                    _this.oauth2Client.credentials = tokens;
                    callback(_this.oauth2Client, tokens);
                }
                else {
                    callback(null, null); // not auth etc...
                }
            });
        };
        // etc etc...
        Calendar.prototype.calendar = function (auth, callback) {
            var result = "";
            var calendar = google.calendar({ auth: auth, version: "v3" });
            calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            }, function (error, response) {
                if (!error) {
                    var events = response.items;
                    for (var i = 0; i < events.length; i++) {
                        var event_1 = events[i];
                        var start = event_1.start.dateTime || event_1.start.date;
                        result += start + "-" + event_1.summary;
                    }
                    callback(null, result);
                }
                else {
                    callback(error, "");
                }
            });
        };
        // etc etc...
        Calendar.prototype.insert_calendar = function (auth, callback) {
            var event = {
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
                    { 'email': 'lpage@example.com' },
                    { 'email': 'sbrin@example.com' }
                ],
                'reminders': {
                    'useDefault': false,
                    'overrides': [
                        { 'method': 'email', 'minutes': 24 * 60 },
                        { 'method': 'popup', 'minutes': 10 }
                    ]
                },
            };
            var calendar = google.calendar({ auth: auth, version: "v3" });
            calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            }, function (error, response) {
                if (!error) {
                    callback(null, response.htmlLink);
                }
                else {
                    callback(error, "");
                }
            });
        };
        // etc etc...
        Calendar.prototype.analytics = function (auth, callback) {
            var analytics = google.analytics({ auth: auth, version: "v3" });
            analytics.data.ga.get({
                ids: "ga:" + "76780519",
                "start-date": "30daysAgo",
                "end-date": "yesterday",
                metrics: "ga:users,ga:percentNewSessions,ga:bounceRate",
                dimensions: "ga:userType"
            }, function (error, rows) {
                if (!error) {
                    callback(null, rows);
                }
                else {
                    callback(error, "");
                }
            });
        };
        return Calendar;
    }());
    GoogleModule.Calendar = Calendar;
    var Analytics = /** @class */ (function () {
        function Analytics() {
        }
        Analytics.prototype.get = function (request, response) {
            var ga = plugins_config.google_api.analytics;
            var dimensions = Wrapper.Parse(decodeURIComponent(request.params.dimensions));
            dimensions["clientId"] = ga.client_id;
            dimensions["serviceEmail"] = ga.service_account_email;
            dimensions["key"] = ga.service_account_key_file;
            dimensions["ids"] = ga.ids;
            ga_analytics(dimensions, function (error, result) {
                if (!error) {
                    Wrapper.SendSuccess(response, result);
                }
                else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        };
        ;
        return Analytics;
    }());
    GoogleModule.Analytics = Analytics;
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
})(GoogleModule = exports.GoogleModule || (exports.GoogleModule = {}));
module.exports = GoogleModule;
//# sourceMappingURL=google_controller.js.map