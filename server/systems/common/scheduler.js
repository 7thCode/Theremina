/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SchedulerModule;
(function (SchedulerModule) {
    var schedule = require("node-schedule");
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
            this.Scheduled_jobs = [];
        }
        Scheduler.prototype.Add = function (item) {
            var job = schedule.scheduleJob(item.timing, item.job);
            this.Scheduled_jobs.push(job);
        };
        return Scheduler;
    }());
    SchedulerModule.Scheduler = Scheduler;
})(SchedulerModule = exports.SchedulerModule || (exports.SchedulerModule = {}));
module.exports = SchedulerModule;
//# sourceMappingURL=scheduler.js.map