/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BeaconApiRouter;
(function (BeaconApiRouter) {
    const express = require('express');
    BeaconApiRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const exception = core.exception;
    const BeaconModule = require(share.Server("plugins/beacon/controllers/beacon_controller"));
    const beacon = new BeaconModule.Beacon;
    BeaconApiRouter.router.get("/api/:token", [exception.exception, beacon.get_beacon]);
})(BeaconApiRouter = exports.BeaconApiRouter || (exports.BeaconApiRouter = {}));
module.exports = BeaconApiRouter.router;
//# sourceMappingURL=api.js.map