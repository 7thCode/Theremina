/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let GoogleServices = angular.module('GoogleServices', []);
GoogleServices.factory('Analytics', ['$resource',
    ($resource) => {
        return $resource('/google/api/ga/:dimensions', { dimensions: "@dimensions" }, {});
    }]);
GoogleServices.service("LocationService", [function () {
        let id, target, options;
        this.Get = (callback, error) => {
            target = {
                latitude: 0,
                longitude: 0,
            };
            options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };
            if (navigator.geolocation) {
                id = navigator.geolocation.watchPosition(callback, error, options);
            }
            else {
                error({ code: 1, message: "There is no GPS." });
            }
        };
    }]);
GoogleServices.service("AnalyticsService", ["Analytics", "AnalyticsCreate", "AnalyticsCreate2", "Upload", function (Analytics, AnalyticsCreate, AnalyticsCreate2, Upload) {
        this.Get = (dimensions, callback, error) => {
            Analytics.get({
                dimensions: encodeURIComponent(JSON.stringify(dimensions)),
            }, (result) => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    }
                    else {
                        error(result.code, result.message);
                    }
                }
                else {
                    error(10000, "network error");
                }
            });
        };
    }]);
//# sourceMappingURL=google_services.js.map