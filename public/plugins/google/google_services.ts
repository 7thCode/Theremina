/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace GoogleServicesModule {

    let GoogleServices = angular.module('GoogleServices', []);

    GoogleServices.factory('Analytics', ['$resource',
        ($resource: any): any => {
            return $resource('/google/api/ga/:dimensions', {dimensions: "@dimensions"}, {});
        }]);

    GoogleServices.service("LocationService", [function () {
        let id, target, options;
        this.Get = (callback: (results: any) => void, error: (error) => void): void => {

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
            } else {
                error({code: 1, message: "There is no GPS."});
            }
        }
    }]);

    GoogleServices.service("AnalyticsService", ["Analytics", "AnalyticsCreate", "AnalyticsCreate2", "Upload", function (Analytics: any, AnalyticsCreate: any, AnalyticsCreate2: any, Upload: any) {

        this.Get = (dimensions, callback: (results: any) => void, error: (code: number, message: string) => void): void => {
            Analytics.get({
                dimensions: encodeURIComponent(JSON.stringify(dimensions)),
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        }

    }]);

}