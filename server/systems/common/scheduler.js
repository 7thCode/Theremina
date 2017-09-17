/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SchedulerModule;
(function (SchedulerModule) {
    let schedule = require("node-schedule");
    class Scheduler {
        constructor() {
            this.Scheduled_jobs = [];
        }
        Add(item) {
            let job = schedule.scheduleJob(item.timing, item.job);
            this.Scheduled_jobs.push(job);
        }
    }
    SchedulerModule.Scheduler = Scheduler;
})(SchedulerModule = exports.SchedulerModule || (exports.SchedulerModule = {}));
module.exports = SchedulerModule;
//# sourceMappingURL=scheduler.js.map