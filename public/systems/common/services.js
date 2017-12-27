/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
/// <reference path="./shape_edit/shape_edit.ts" />
/// <reference path="./shape_edit/server_canvas.ts" />
/// <reference path="./shape_edit/adaptor.ts" />
/// <reference path="./html_edit/html_edit.ts" />
"use strict";
var Services = angular.module('Services', []);
Services.factory('Socket', ["$rootScope", function ($rootScope) {
        var socket = io.connect();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function (data) {
                    var args = [data];
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function (ee) {
                    var args = [data];
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        };
    }]);
Services.factory('Session', ['$resource',
    function ($resource) {
        return $resource('/session/api', {}, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
        });
    }]);
Services.service("BrowserService", [function () {
        var _this = this;
        this.UserAgent = "";
        this.IsIE = function () {
            return (_this.UserAgent.indexOf('msie') >= 0 || _this.UserAgent.indexOf('trident') >= 0 || _this.UserAgent.indexOf('edge/') >= 0);
        };
        this.IsEdge = function () {
            return _this.UserAgent.indexOf('edge/') >= 0;
        };
        this.IsChrome = function () {
            var result = false;
            if (!_this.IsIE()) {
                result = _this.UserAgent.indexOf('chrome/') >= 0;
            }
            return result;
        };
        this.IsSafari = function () {
            var result = false;
            if (!_this.IsIE()) {
                if (!_this.IsChrome()) {
                    result = _this.UserAgent.indexOf('safari/') >= 0;
                }
            }
            return result;
        };
        this.IsiPhone = function () {
            return _this.UserAgent.indexOf('iphone') >= 0;
        };
        this.IsiPod = function () {
            return _this.UserAgent.indexOf('ipod') >= 0;
        };
        this.IsiPad = function () {
            return _this.UserAgent.indexOf('ipad') >= 0;
        };
        this.IsiOS = function () {
            return (_this.IsiPhone() || _this.IsiPod() || _this.IsiPad());
        };
        this.IsAndroid = function () {
            return _this.UserAgent.indexOf('android') >= 0;
        };
        this.IsPhone = function () {
            return (_this.IsiOS() || _this.IsAndroid());
        };
        this.IsTablet = function () {
            return (_this.IsiPad() || (_this.IsAndroid() && _this.UserAgent.indexOf('mobile') < 0));
        };
        this.Version = function () {
            var result = 0;
            if (_this.IsIE()) {
                var verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec(_this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            }
            else if (_this.IsiOS()) {
                var verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec(_this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            }
            else if (_this.IsAndroid()) {
                var verArray = /(android)\s([0-9]{1,})([\.0-9]{1,})/.exec(_this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            }
            return result;
        };
        this.UserAgent = window.navigator.userAgent.toLowerCase();
    }]);
Services.service("CollectionService", [function () {
        this.Get = function (model, param, callback, error) {
            var instance = new model();
            instance.$get(param, function (result) {
                if (result) {
                    if (result.code == 0) {
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
        this.List = function (resource, query, option, success, error) {
            resource.query({
                query: encodeURIComponent(JSON.stringify(query)),
                option: encodeURIComponent(JSON.stringify(option))
            }, function (data) {
                if (data) {
                    if (data.code === 0) {
                        success(data.value);
                    }
                    else {
                        error(data.code, data.message);
                    }
                }
                else {
                    error(data.code, data.message);
                }
            });
        };
        this.Count = function (resource, query, success, error) {
            resource.get({
                query: encodeURIComponent(JSON.stringify(query))
            }, function (data) {
                if (data) {
                    if (data.code === 0) {
                        success(data.value);
                    }
                    else {
                        error(data.code, data.message);
                    }
                }
                else {
                    error(data.code, data.message);
                }
            });
        };
    }]);
Services.service("SessionService", ['Session', function (Session) {
        this.Get = function (callback, error) {
            Session.get({}, function (result) {
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
        this.Put = function (content, callback, error) {
            var self = new Session();
            self.data = content;
            self.$put({}, function (result) {
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
Services.service("GuidanceService", ['Session', function (Session) {
        /*
        Services.factory('focus', function($timeout, $window) {
                return function(id) {
                    $timeout(function() {
                        var element = $window.document.getElementById(id);
                        if(element)
                            element.focus();
                    });
                };
            });
        */
    }]);
/*
Services.directive('eventFocus', function(focus) {
    return function(scope, elem, attr) {
        elem.on(attr.eventFocus, function() {
            focus(attr.eventFocusId);
        });

        scope.$on('$destroy', function() {
            elem.off(attr.eventFocus);
        });
    };
});
*/
Services.directive("compareTo", function () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue === scope.otherModelValue;
            };
            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
});
Services.directive("guidance", ['$compile', '$parse',
    function ($compile, $parse) {
        return function (scope, element, attrs) {
            var scenario = $parse(attrs.scenario)(scope);
            var result = '<section>';
            _.forEach(scenario, function (act, index) {
                var target = act.outer.target;
                var target_element = document.getElementById(target);
                if (target_element) {
                    var rect = target_element.getBoundingClientRect();
                    var position_x = rect.left + window.pageXOffset;
                    var position_y = rect.top + window.pageYOffset;
                    var padding_x = Math.round(act.outer.width / 8);
                    var padding_y = Math.round(act.outer.height / 8);
                    var top_1 = act.outer.top + position_y;
                    var left = act.outer.left + position_x;
                    result +=
                        '<div ng-show="step == ' + index + '">' +
                            '<div style="position:absolute;z-index:10000;top:' + top_1 + 'px' + ';left:' + left + 'px' + ';' + act.style + '" class="' + act._class + '">' +
                            '<div style="position:absolute;top:' + act.inner.top + 'px' + ';left:' + act.inner.left + 'px' + ';width:' + act.inner.width + 'px' + ';height:' + act.inner.height + 'px' + ';word-wrap: break-word;padding:' + padding_x + 'px' + ' ' + padding_y + 'px' + ';">' + act.inner.content + '</div>' +
                            '<img src="' + act.outer.background + '" style="object-fit:fill;width:' + act.outer.width + 'px' + ';height:' + act.outer.height + 'px' + ';"/>' +
                            '</div>' +
                            '</div>';
                }
            });
            result += '</section>';
            element.append(result);
            $compile(element.contents())(scope);
        };
    }
]);
Services.directive('draggablepane', ['$document', function ($document) {
        return {
            restrict: 'A',
            link: function (scope, element, attribute) {
                var style = element[0].style;
                if (style) {
                    var name_1;
                    element.css({ position: 'fixed' });
                    name_1 = attribute.draggablepane;
                    var start_x_1;
                    var start_y_1;
                    var clicked_x_1;
                    var clicked_y_1;
                    var location_x_1;
                    var location_y_1;
                    var left = localStorage.getItem(name_1 + '_left');
                    if (left) {
                        location_x_1 = left;
                    }
                    else {
                        location_x_1 = element[0].style.left;
                    }
                    var top_2 = localStorage.getItem(name_1 + '_top');
                    if (top_2) {
                        location_y_1 = top_2;
                    }
                    else {
                        location_y_1 = element[0].style.top;
                    }
                    element.css({
                        width: element[0].style.width,
                        height: element[0].style.height,
                        top: location_y_1,
                        left: location_x_1
                    });
                    element.bind('mousedown', function ($event) {
                        var result = false;
                        start_x_1 = element.prop('offsetLeft');
                        start_y_1 = element.prop('offsetTop');
                        clicked_x_1 = $event.clientX;
                        clicked_y_1 = $event.clientY;
                        var handle_y = clicked_y_1 - start_y_1;
                        if (handle_y < 30) {
                            $document.bind('mousemove', mousemove_1);
                            $document.bind('mouseup', mouseup_1);
                        }
                        else {
                            result = true;
                        }
                        return result;
                    });
                    var mousemove_1 = function ($event) {
                        var target = angular.element("#draggable_area");
                        if (target) {
                            var target_x_min = target[0].offsetLeft;
                            var target_y_min = target[0].offsetTop;
                            var target_width = target[0].offsetWidth;
                            var target_height = target[0].offsetHeight;
                            var target_x_max = target_x_min + target_width;
                            var target_y_max = target_y_min + target_height;
                            var delta_x = $event.clientX - clicked_x_1;
                            var delta_y = $event.clientY - clicked_y_1;
                            var position_x = start_x_1 + delta_x;
                            var position_y = start_y_1 + delta_y;
                            if (position_x < target_x_min) {
                                position_x = target_x_min;
                            }
                            if (position_y < target_y_min) {
                                position_y = target_y_min;
                            }
                            if (position_x > target_x_max) {
                                position_x = target_x_max;
                            }
                            if (position_y > target_y_max) {
                                position_y = target_y_max;
                            }
                            location_x_1 = position_x + "px";
                            location_y_1 = position_y + "px";
                        }
                        element.css({
                            top: location_y_1,
                            left: location_x_1
                        });
                        return false;
                    };
                    var mouseup_1 = function () {
                        if (('localStorage' in window) && (window.localStorage !== null)) {
                            if (name_1) {
                                localStorage.setItem(name_1 + '_left', location_x_1);
                                localStorage.setItem(name_1 + '_top', location_y_1);
                            }
                        }
                        $document.unbind('mousemove', mousemove_1);
                        $document.unbind('mouseup', mouseup_1);
                    };
                }
            }
        };
    }]);
Services.filter('length', [function () {
        return function (s, limit) {
            var result = s;
            if (s) {
                if (s.length > limit) {
                    result = s.slice(0, limit) + "...";
                }
            }
            return result;
        };
    }]);
Services.provider('HtmlEdit', [function () {
        this.$get = function () {
            return {
                toHtml: function (object, init) {
                    return HtmlEdit.Render.toHtml(object, init);
                },
                fromHtml: function (html, callback) {
                    HtmlEdit.Render.fromHtml(html, callback);
                },
            };
        };
    }
]);
// ShapeEditProvider
Services.provider('ShapeEdit', [function () {
        var _self = this;
        _self.Handlers = new ShapeEdit.EventHandlers();
        _self.Plugins = new ShapeEdit.Plugins();
        _self.pagesize = 40;
        _self.query = {};
        _self.option = { limit: _self.pagesize, skip: 0 };
        _self.count = 0;
        _self.IsOpen = false;
        _self.input = {};
        _self.ratio = 1;
        _self.scale = 1;
        _self.object = null;
        this.configure = function (options) {
            _self.Wrapper = document.getElementById(options.wrapper);
            _self.CanvasElement = document.getElementById(options.canvas);
            if (_self.CanvasElement) {
                _self.CanvasElement.width = options.width;
                _self.CanvasElement.height = options.height;
                _self.Canvas = new ShapeEdit.Canvas(_self.CanvasElement, _self.Handlers, _self.Plugins, null, true);
                //this.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.CanvasElement.width, _self.CanvasElement.height);
            }
        };
        this.adjust = function (element, outerwidth, outerheight, innerwidth, innerheight, scale) {
            element.width = innerwidth;
            element.height = innerheight;
            element.style.marginLeft = ((outerwidth - innerwidth) / 2) + "px";
            element.style.marginRight = ((outerwidth - innerwidth) / 2) + "px";
            element.style.marginTop = ((outerheight - innerheight) / 2) + "px";
            element.style.marginBottom = ((outerheight - innerheight) / 2) + "px";
            var width = (outerwidth / innerwidth);
            var height = (outerheight / innerheight);
            _self.ratio = Math.min(width, height) * scale * 0.9;
            element.style.transform = "scale(" + _self.ratio + ")";
        };
        this.$get = function () {
            return {
                Canvas: _self.Canvas,
                Wrapper: _self.Wrapper,
                CanvasElement: _self.CanvasElement,
                RGBAColor: ShapeEdit.RGBAColor,
                Font: ShapeEdit.Font,
                ShapeProperty: ShapeEdit.ShapeProperty,
                Rectangle: ShapeEdit.Rectangle,
                Text: ShapeEdit.Text,
                Box: ShapeEdit.Box,
                Oval: ShapeEdit.Oval,
                Bezier: ShapeEdit.Bezier,
                ImageRect: ShapeEdit.ImageRect,
                Location: ShapeEdit.Location,
                Mode: ShapeEdit.Mode,
                IsOpen: _self.IsOpen,
                Input: _self.input,
                Ratio: _self.ratio,
                Scale: _self.scale,
                Serialize: function () {
                    return ShapeEdit.Canvas.Serialize(_self.Canvas);
                },
                Load: function (value) {
                    _self.object = {};
                    try {
                        _self.object = JSON.parse(value);
                    }
                    catch (e) {
                    }
                    _self.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.object.width, _self.object.height, _self.scale);
                    ShapeEdit.Canvas.Load(_self.Canvas, _self.object, _self.Handlers);
                    _self.IsOpen = true;
                    _self.Canvas.isdirty = false;
                    _self.Canvas.Draw();
                    //    _self.Canvas.Animate();
                },
                IsDirty: function () {
                    return _self.Canvas.isdirty;
                },
                Save: function () {
                    return ShapeEdit.Canvas.Save(_self.Canvas);
                },
                Clear: function () {
                    _self.IsOpen = true;
                },
                Draw: function () {
                    _self.Canvas.Draw();
                },
                GetScale: function () {
                    return _self.scale;
                },
                SetScale: function (scale) {
                    _self.scale = scale;
                    _self.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.object.width, _self.object.height, _self.scale);
                    _self.Canvas.Draw();
                    //     _self.Canvas.Animate();
                },
                ToTop: function () {
                    _self.Canvas.ToTop();
                },
                ToBottom: function () {
                    _self.Canvas.ToBottom();
                },
                Selected: function () {
                    _self.Canvas.Selected();
                },
                Add: function (shape) {
                    _self.Canvas.Add(shape);
                },
                DeleteSelected: function () {
                    _self.Canvas.DeleteSelected();
                },
                Lock: function () {
                    _self.Canvas.Lock();
                },
                UnLockAll: function () {
                    _self.Canvas.UnLockAll();
                },
                Group: function () {
                    _self.Canvas.Group();
                },
                Ungroup: function () {
                    _self.Canvas.Ungroup();
                },
                Copy: function () {
                    _self.Canvas.Copy();
                },
                Paste: function () {
                    _self.Canvas.Paste();
                },
                Snap: function () {
                    _self.Canvas.Snap();
                },
                SetMode: function (mode) {
                    _self.Canvas.SetMode(mode);
                },
                SetCurrentLocation: function (loc) {
                    _self.Canvas.SetCurrentLocation(loc);
                },
                CurrentLocation: function () {
                    return _self.Canvas.CurrentLocation();
                },
                SetCurrentSize: function (size) {
                    _self.Canvas.SetCurrentSize(size);
                },
                CurrentSize: function () {
                    return _self.Canvas.CurrentSize();
                },
                SetCurrentFillColor: function (color) {
                    _self.Canvas.SetCurrentFillColor(color);
                },
                CurrentFillColor: function () {
                    return _self.Canvas.CurrentFillColor();
                },
                SetCurrentStrokeColor: function (color) {
                    _self.Canvas.SetCurrentStrokeColor(color);
                },
                CurrentStrokeColor: function () {
                    return _self.Canvas.CurrentStrokeColor();
                },
                SetCurrentStrokeWidth: function (width) {
                    _self.Canvas.SetCurrentStrokeWidth(width);
                },
                CurrentStrokeWidth: function () {
                    return _self.Canvas.CurrentStrokeWidth();
                },
                SetCurrentFontStyle: function (style) {
                    if (_self.Canvas) {
                        _self.Canvas.SetCurrentFontStyle(style);
                    }
                },
                CurrentFontStyle: function () {
                    return _self.Canvas.CurrentFontStyle();
                },
                SetCurrentFontVariant: function (variant) {
                    _self.Canvas.SetCurrentFontVariant(variant);
                },
                CurrentFontVariant: function () {
                    return _self.Canvas.CurrentFontVariant();
                },
                SetCurrentFontWeight: function (weight) {
                    if (_self.Canvas) {
                        _self.Canvas.SetCurrentFontWeight(weight);
                    }
                },
                CurrentFontWeight: function () {
                    return _self.Canvas.CurrentFontWeight();
                },
                SetCurrentFontSize: function (size) {
                    if (_self.Canvas) {
                        _self.Canvas.SetCurrentFontSize(size);
                    }
                },
                CurrentFontSize: function () {
                    return _self.Canvas.CurrentFontSize();
                },
                SetCurrentFontKeyword: function (keyword) {
                    _self.Canvas.SetCurrentFontKeyword(keyword);
                },
                CurrentFontKeyword: function () {
                    return _self.Canvas.CurrentFontKeyword();
                },
                SetCurrentFontFamily: function (family) {
                    _self.Canvas.SetCurrentFontFamily(family);
                },
                CurrentFontFamily: function () {
                    return _self.Canvas.CurrentFontFamily();
                },
                SetCurrentPath: function (path) {
                    _self.Canvas.SetCurrentPath(path);
                },
                CurrentPath: function () {
                    return _self.Canvas.CurrentPath();
                },
                SetCurrentAlign: function (align) {
                    if (_self.Canvas) {
                        _self.Canvas.SetCurrentAlign(align);
                    }
                },
                CurrentAlign: function () {
                    return _self.Canvas.CurrentAlign();
                },
                SetCurrentText: function (text) {
                    if (_self.Canvas) {
                        _self.Canvas.SetCurrentText(text);
                    }
                },
                CurrentText: function () {
                    return _self.Canvas.CurrentText();
                },
                CurrentType: function () {
                    return _self.Canvas.CurrentType();
                },
                SetCurrentShapesAlign: function (align) {
                    _self.Canvas.SetCurrentShapesAlign(align);
                },
                DeselectAll: function () {
                    _self.Canvas.DeselectAll();
                },
                SelectedCount: function () {
                    return _self.Canvas.SelectedCount();
                },
                onTick: function (callback) {
                    _self.Plugins.on("tick", callback);
                },
                onDraw: function (callback) {
                    _self.Plugins.on("draw", callback);
                },
                onNew: function (callback) {
                    _self.Handlers.on("new", callback);
                },
                onDelete: function (callback) {
                    _self.Handlers.on("delete", callback);
                },
                onSelect: function (callback) {
                    _self.Handlers.on("select", callback);
                },
                onDeselect: function (callback) {
                    _self.Handlers.on("deselect", callback);
                },
                onMove: function (callback) {
                    _self.Handlers.on("move", callback);
                },
                onResize: function (callback) {
                    _self.Handlers.on("resize", callback);
                },
                onDeformation: function (callback) {
                    _self.Handlers.on("deformation", callback);
                },
                onChange: function (callback) {
                    _self.Handlers.on("change", callback);
                },
                onKeydown: function (callback) {
                    _self.Handlers.on("keydown", callback);
                },
                onDrop: function (callback) {
                    _self.Handlers.on("drop", callback);
                },
                onResizeWindow: function (callback) {
                    var resizeTimer;
                    var interval = Math.floor(1000 / 60 * 10);
                    window.addEventListener('resize', function (event) {
                        if (resizeTimer !== false) {
                            clearTimeout(resizeTimer);
                        }
                        resizeTimer = setTimeout(function () {
                            if (_self.object) {
                                callback(_self.Wrapper, _self.object);
                                _self.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.object.width, _self.object.height, _self.scale);
                                _self.Canvas.Draw();
                                //      _self.Canvas.Animate();
                            }
                        }, interval);
                    });
                }
            };
        };
    }
]);
//# sourceMappingURL=services.js.map