/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GoogleModule;
(function (GoogleModule) {
    const fs = require('graceful-fs');
    const _ = require('lodash');
    const mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    const google = require('googleapis');
    const googleAuth = require('google-auth-library');
    const ga_analytics = require("ga-analytics");
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const Wrapper = share.Wrapper;
    const plugins_config = share.plugins_config;
    class Calendar {
        // plugins_config.google_api.
        constructor(calendar) {
            let clientSecret = calendar.client_secret;
            let clientId = calendar.client_id;
            let redirectUrl = calendar.redirect_uris[1];
            this.auth = new googleAuth();
            this.oauth2Client = new this.auth.OAuth2(clientId, clientSecret, redirectUrl);
        }
        // already auth
        authorize(tokens, callback) {
            if (tokens) {
                this.oauth2Client.credentials = tokens;
                callback(this.oauth2Client, tokens);
            }
            else {
                callback(null, null); // not auth etc...
            }
        }
        // new auth step1
        authorize_url(scopes) {
            let authUrl = this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes
            });
            return authUrl;
        }
        // new auth step2
        authorize_callback(code, callback) {
            this.oauth2Client.getToken(code, (error, tokens) => {
                if (!error) {
                    this.oauth2Client.credentials = tokens;
                    callback(this.oauth2Client, tokens);
                }
                else {
                    callback(null, null); // not auth etc...
                }
            });
        }
        // etc etc...
        calendar(auth, callback) {
            let result = "";
            let calendar = google.calendar({ auth: auth, version: "v3" });
            calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            }, (error, response) => {
                if (!error) {
                    let events = response.items;
                    for (var i = 0; i < events.length; i++) {
                        let event = events[i];
                        let start = event.start.dateTime || event.start.date;
                        result += start + "-" + event.summary;
                    }
                    callback(null, result);
                }
                else {
                    callback(error, null);
                }
            });
        }
        // etc etc...
        insert_calendar(auth, callback) {
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
            let calendar = google.calendar({ auth: auth, version: "v3" });
            calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            }, (error, response) => {
                if (!error) {
                    callback(null, response.htmlLink);
                }
                else {
                    callback(error, null);
                }
            });
        }
        // etc etc...
        analytics(auth, callback) {
            let result = "";
            let analytics = google.analytics({ auth: auth, version: "v3" });
            analytics.data.ga.get({
                ids: "ga:" + "76780519",
                "start-date": "30daysAgo",
                "end-date": "yesterday",
                metrics: "ga:users,ga:percentNewSessions,ga:bounceRate",
                dimensions: "ga:userType"
            }, (error, rows) => {
                if (!error) {
                    callback(null, rows);
                }
                else {
                    callback(error, null);
                }
            });
        }
    }
    GoogleModule.Calendar = Calendar;
    class Analytics {
        get(request, response) {
            let ga = plugins_config.google_api.analytics;
            let dimensions = Wrapper.Parse(decodeURIComponent(request.params.dimensions));
            dimensions["clientId"] = ga.client_id;
            dimensions["serviceEmail"] = ga.service_account_email;
            dimensions["key"] = ga.service_account_key_file;
            dimensions["ids"] = ga.ids;
            ga_analytics(dimensions, (error, result) => {
                if (!error) {
                    Wrapper.SendSuccess(response, result);
                }
                else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        }
        ;
    }
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