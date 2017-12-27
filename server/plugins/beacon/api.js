/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BeaconApiRouter;
(function (BeaconApiRouter) {
    var express = require('express');
    BeaconApiRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var exception = core.exception;
    var BeaconModule = require(share.Server("plugins/beacon/controllers/beacon_controller"));
    var beacon = new BeaconModule.Beacon;
    BeaconApiRouter.router.get("/api/:token", [exception.exception, beacon.get_beacon]);
})(BeaconApiRouter = exports.BeaconApiRouter || (exports.BeaconApiRouter = {}));
module.exports = BeaconApiRouter.router;
//# sourceMappingURL=api.js.map