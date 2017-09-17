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
let Services = angular.module('Services', []);
Services.factory('Socket', ["$rootScope", ($rootScope) => {
        let socket = io.connect();
        return {
            on: (eventName, callback) => {
                socket.on(eventName, (data) => {
                    let args = [data];
                    $rootScope.$apply(() => {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            },
            emit: (eventName, data, callback) => {
                socket.emit(eventName, data, (ee) => {
                    let args = [data];
                    $rootScope.$apply(() => {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        };
    }]);
Services.factory('Session', ['$resource',
    ($resource) => {
        return $resource('/session/api', {}, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
        });
    }]);
Services.service("BrowserService", [function () {
        this.UserAgent = "";
        this.IsIE = () => {
            return (this.UserAgent.indexOf('msie') >= 0 || this.UserAgent.indexOf('trident') >= 0 || this.UserAgent.indexOf('edge/') >= 0);
        };
        this.IsEdge = () => {
            return this.UserAgent.indexOf('edge/') >= 0;
        };
        this.IsChrome = () => {
            let result = false;
            if (!this.IsIE()) {
                result = this.UserAgent.indexOf('chrome/') >= 0;
            }
            return result;
        };
        this.IsSafari = () => {
            let result = false;
            if (!this.IsIE()) {
                if (!this.IsChrome()) {
                    result = this.UserAgent.indexOf('safari/') >= 0;
                }
            }
            return result;
        };
        this.IsiPhone = () => {
            return this.UserAgent.indexOf('iphone') >= 0;
        };
        this.IsiPod = () => {
            return this.UserAgent.indexOf('ipod') >= 0;
        };
        this.IsiPad = () => {
            return this.UserAgent.indexOf('ipad') >= 0;
        };
        this.IsiOS = () => {
            return (this.IsiPhone() || this.IsiPod() || this.IsiPad());
        };
        this.IsAndroid = () => {
            return this.UserAgent.indexOf('android') >= 0;
        };
        this.IsPhone = () => {
            return (this.IsiOS() || this.IsAndroid());
        };
        this.IsTablet = () => {
            return (this.IsiPad() || (this.IsAndroid() && this.UserAgent.indexOf('mobile') < 0));
        };
        this.Version = () => {
            let result = 0;
            if (this.IsIE()) {
                let verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec(this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            }
            else if (this.IsiOS()) {
                let verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec(this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            }
            else if (this.IsAndroid()) {
                let verArray = /(android)\s([0-9]{1,})([\.0-9]{1,})/.exec(this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            }
            return result;
        };
        this.UserAgent = window.navigator.userAgent.toLowerCase();
    }]);
Services.service("CollectionService", [function () {
        this.Get = (model, param, callback, error) => {
            let instance = new model();
            instance.$get(param, (result) => {
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
        this.List = (resource, query, option, success, error) => {
            resource.query({
                query: encodeURIComponent(JSON.stringify(query)),
                option: encodeURIComponent(JSON.stringify(option))
            }, (data) => {
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
        this.Count = (resource, query, success, error) => {
            resource.get({
                query: encodeURIComponent(JSON.stringify(query))
            }, (data) => {
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
        this.Get = (callback, error) => {
            Session.get({}, (result) => {
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
        this.Put = (content, callback, error) => {
            let self = new Session();
            self.data = content;
            self.$put({}, (result) => {
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
    }]);
Services.directive("compareTo", () => {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: (scope, element, attributes, ngModel) => {
            ngModel.$validators.compareTo = (modelValue) => {
                return modelValue === scope.otherModelValue;
            };
            scope.$watch("otherModelValue", () => {
                ngModel.$validate();
            });
        }
    };
});
Services.directive("guidance", ['$compile', '$parse',
    ($compile, $parse) => {
        return (scope, element, attrs) => {
            let scenario = $parse(attrs.scenario)(scope);
            let result = '<section>';
            _.forEach(scenario, (act, index) => {
                let target = act.outer.target;
                let target_element = document.getElementById(target);
                if (target_element) {
                    let rect = target_element.getBoundingClientRect();
                    let position_x = rect.left + window.pageXOffset;
                    let position_y = rect.top + window.pageYOffset;
                    let padding_x = Math.round(act.outer.width / 8);
                    let padding_y = Math.round(act.outer.height / 8);
                    let top = act.outer.top + position_y;
                    let left = act.outer.left + position_x;
                    result +=
                        '<div ng-show="step == ' + index + '">' +
                            '<div style="position:absolute;z-index:10000;top:' + top + 'px' + ';left:' + left + 'px' + ';' + act.style + '" class="' + act._class + '">' +
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
Services.directive('draggablepane', ['$document', ($document) => {
        return {
            restrict: 'A',
            link: (scope, element, attribute) => {
                let style = element[0].style;
                if (style) {
                    let name;
                    element.css({ position: 'fixed' });
                    name = attribute.draggablepane;
                    let start_x;
                    let start_y;
                    let clicked_x;
                    let clicked_y;
                    let location_x;
                    let location_y;
                    let left = localStorage.getItem(name + '_left');
                    if (left) {
                        location_x = left;
                    }
                    else {
                        location_x = element[0].style.left;
                    }
                    let top = localStorage.getItem(name + '_top');
                    if (top) {
                        location_y = top;
                    }
                    else {
                        location_y = element[0].style.top;
                    }
                    element.css({
                        width: element[0].style.width,
                        height: element[0].style.height,
                        top: location_y,
                        left: location_x
                    });
                    element.bind('mousedown', ($event) => {
                        let result = false;
                        start_x = element.prop('offsetLeft');
                        start_y = element.prop('offsetTop');
                        clicked_x = $event.clientX;
                        clicked_y = $event.clientY;
                        let handle_y = clicked_y - start_y;
                        if (handle_y < 30) {
                            $document.bind('mousemove', mousemove);
                            $document.bind('mouseup', mouseup);
                        }
                        else {
                            result = true;
                        }
                        return result;
                    });
                    let mousemove = ($event) => {
                        let target = angular.element("#draggable_area");
                        if (target) {
                            let target_x_min = target[0].offsetLeft;
                            let target_y_min = target[0].offsetTop;
                            let target_width = target[0].offsetWidth;
                            let target_height = target[0].offsetHeight;
                            let target_x_max = target_x_min + target_width;
                            let target_y_max = target_y_min + target_height;
                            let delta_x = $event.clientX - clicked_x;
                            let delta_y = $event.clientY - clicked_y;
                            let position_x = start_x + delta_x;
                            let position_y = start_y + delta_y;
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
                            location_x = position_x + "px";
                            location_y = position_y + "px";
                        }
                        element.css({
                            top: location_y,
                            left: location_x
                        });
                        return false;
                    };
                    let mouseup = () => {
                        if (('localStorage' in window) && (window.localStorage !== null)) {
                            if (name) {
                                localStorage.setItem(name + '_left', location_x);
                                localStorage.setItem(name + '_top', location_y);
                            }
                        }
                        $document.unbind('mousemove', mousemove);
                        $document.unbind('mouseup', mouseup);
                    };
                }
            }
        };
    }]);
Services.filter('length', [() => {
        return (s, limit) => {
            let result = s;
            if (s) {
                if (s.length > limit) {
                    result = s.slice(0, limit) + "...";
                }
            }
            return result;
        };
    }]);
Services.provider('HtmlEdit', [function () {
        this.$get = () => {
            return {
                toHtml: (object, init) => {
                    return HtmlEdit.Render.toHtml(object, init);
                },
                fromHtml: (html, callback) => {
                    HtmlEdit.Render.fromHtml(html, callback);
                },
            };
        };
    }
]);
// ShapeEditProvider
Services.provider('ShapeEdit', [function () {
        let _self = this;
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
        this.configure = (options) => {
            _self.Wrapper = document.getElementById(options.wrapper);
            _self.CanvasElement = document.getElementById(options.canvas);
            if (_self.CanvasElement) {
                _self.CanvasElement.width = options.width;
                _self.CanvasElement.height = options.height;
                _self.Canvas = new ShapeEdit.Canvas(_self.CanvasElement, _self.Handlers, _self.Plugins, null, true);
                //this.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.CanvasElement.width, _self.CanvasElement.height);
            }
        };
        this.adjust = (element, outerwidth, outerheight, innerwidth, innerheight, scale) => {
            element.width = innerwidth;
            element.height = innerheight;
            element.style.marginLeft = ((outerwidth - innerwidth) / 2) + "px";
            element.style.marginRight = ((outerwidth - innerwidth) / 2) + "px";
            element.style.marginTop = ((outerheight - innerheight) / 2) + "px";
            element.style.marginBottom = ((outerheight - innerheight) / 2) + "px";
            let width = (outerwidth / innerwidth);
            let height = (outerheight / innerheight);
            _self.ratio = Math.min(width, height) * scale * 0.9;
            element.style.transform = "scale(" + _self.ratio + ")";
        };
        this.$get = () => {
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
                Serialize: () => {
                    return ShapeEdit.Canvas.Serialize(_self.Canvas);
                },
                Load: (value) => {
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
                IsDirty: () => {
                    return _self.Canvas.isdirty;
                },
                Save: () => {
                    return ShapeEdit.Canvas.Save(_self.Canvas);
                },
                Clear: () => {
                    _self.IsOpen = true;
                },
                Draw: () => {
                    _self.Canvas.Draw();
                },
                GetScale: () => {
                    return _self.scale;
                },
                SetScale: (scale) => {
                    _self.scale = scale;
                    _self.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.object.width, _self.object.height, _self.scale);
                    _self.Canvas.Draw();
                    //     _self.Canvas.Animate();
                },
                ToTop: () => {
                    _self.Canvas.ToTop();
                },
                ToBottom: () => {
                    _self.Canvas.ToBottom();
                },
                Selected: () => {
                    _self.Canvas.Selected();
                },
                Add: (shape) => {
                    _self.Canvas.Add(shape);
                },
                DeleteSelected: () => {
                    _self.Canvas.DeleteSelected();
                },
                Lock: () => {
                    _self.Canvas.Lock();
                },
                UnLockAll: () => {
                    _self.Canvas.UnLockAll();
                },
                Group: () => {
                    _self.Canvas.Group();
                },
                Ungroup: () => {
                    _self.Canvas.Ungroup();
                },
                Copy: () => {
                    _self.Canvas.Copy();
                },
                Paste: () => {
                    _self.Canvas.Paste();
                },
                Snap: () => {
                    _self.Canvas.Snap();
                },
                SetMode: (mode) => {
                    _self.Canvas.SetMode(mode);
                },
                SetCurrentLocation: (loc) => {
                    _self.Canvas.SetCurrentLocation(loc);
                },
                CurrentLocation: () => {
                    return _self.Canvas.CurrentLocation();
                },
                SetCurrentSize: (size) => {
                    _self.Canvas.SetCurrentSize(size);
                },
                CurrentSize: () => {
                    return _self.Canvas.CurrentSize();
                },
                SetCurrentFillColor: (color) => {
                    _self.Canvas.SetCurrentFillColor(color);
                },
                CurrentFillColor: () => {
                    return _self.Canvas.CurrentFillColor();
                },
                SetCurrentStrokeColor: (color) => {
                    _self.Canvas.SetCurrentStrokeColor(color);
                },
                CurrentStrokeColor: () => {
                    return _self.Canvas.CurrentStrokeColor();
                },
                SetCurrentStrokeWidth: (width) => {
                    _self.Canvas.SetCurrentStrokeWidth(width);
                },
                CurrentStrokeWidth: () => {
                    return _self.Canvas.CurrentStrokeWidth();
                },
                SetCurrentFontStyle: (style) => {
                    if (_self.Canvas) {
                        _self.Canvas.SetCurrentFontStyle(style);
                    }
                },
                CurrentFontStyle: () => {
                    return _self.Canvas.CurrentFontStyle();
                },
                SetCurrentFontVariant(variant) {
                    _self.Canvas.SetCurrentFontVariant(variant);
                },
                CurrentFontVariant: () => {
                    return _self.Canvas.CurrentFontVariant();
                },
                SetCurrentFontWeight: (weight) => {
                    if (_self.Canvas) {
                        _self.Canvas.SetCurrentFontWeight(weight);
                    }
                },
                CurrentFontWeight: () => {
                    return _self.Canvas.CurrentFontWeight();
                },
                SetCurrentFontSize: (size) => {
                    if (_self.Canvas) {
                        _self.Canvas.SetCurrentFontSize(size);
                    }
                },
                CurrentFontSize: () => {
                    return _self.Canvas.CurrentFontSize();
                },
                SetCurrentFontKeyword: (keyword) => {
                    _self.Canvas.SetCurrentFontKeyword(keyword);
                },
                CurrentFontKeyword: () => {
                    return _self.Canvas.CurrentFontKeyword();
                },
                SetCurrentFontFamily: (family) => {
                    _self.Canvas.SetCurrentFontFamily(family);
                },
                CurrentFontFamily: () => {
                    return _self.Canvas.CurrentFontFamily();
                },
                SetCurrentPath: (path) => {
                    _self.Canvas.SetCurrentPath(path);
                },
                CurrentPath: () => {
                    return _self.Canvas.CurrentPath();
                },
                SetCurrentAlign: (align) => {
                    if (_self.Canvas) {
                        _self.Canvas.SetCurrentAlign(align);
                    }
                },
                CurrentAlign: () => {
                    return _self.Canvas.CurrentAlign();
                },
                SetCurrentText: (text) => {
                    if (_self.Canvas) {
                        _self.Canvas.SetCurrentText(text);
                    }
                },
                CurrentText: () => {
                    return _self.Canvas.CurrentText();
                },
                CurrentType: () => {
                    return _self.Canvas.CurrentType();
                },
                SetCurrentShapesAlign: (align) => {
                    _self.Canvas.SetCurrentShapesAlign(align);
                },
                DeselectAll: () => {
                    _self.Canvas.DeselectAll();
                },
                SelectedCount: () => {
                    return _self.Canvas.SelectedCount();
                },
                onTick: (callback) => {
                    _self.Plugins.on("tick", callback);
                },
                onDraw: (callback) => {
                    _self.Plugins.on("draw", callback);
                },
                onNew: (callback) => {
                    _self.Handlers.on("new", callback);
                },
                onDelete: (callback) => {
                    _self.Handlers.on("delete", callback);
                },
                onSelect: (callback) => {
                    _self.Handlers.on("select", callback);
                },
                onDeselect: (callback) => {
                    _self.Handlers.on("deselect", callback);
                },
                onMove: (callback) => {
                    _self.Handlers.on("move", callback);
                },
                onResize: (callback) => {
                    _self.Handlers.on("resize", callback);
                },
                onDeformation: (callback) => {
                    _self.Handlers.on("deformation", callback);
                },
                onChange: (callback) => {
                    _self.Handlers.on("change", callback);
                },
                onKeydown: (callback) => {
                    _self.Handlers.on("keydown", callback);
                },
                onDrop: (callback) => {
                    _self.Handlers.on("drop", callback);
                },
                onResizeWindow: (callback) => {
                    let resizeTimer;
                    let interval = Math.floor(1000 / 60 * 10);
                    window.addEventListener('resize', (event) => {
                        if (resizeTimer !== false) {
                            clearTimeout(resizeTimer);
                        }
                        resizeTimer = setTimeout(() => {
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