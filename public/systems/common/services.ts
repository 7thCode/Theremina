/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */


/// <reference path="./shape_edit/shape_edit.ts" />
/// <reference path="./shape_edit/server_canvas.ts" />
/// <reference path="./shape_edit/adaptor.ts" />
/// <reference path="./html_edit/html_edit.ts" />

"use strict";

let Services = angular.module('Services', []);

Services.factory('Socket', ["$rootScope", ($rootScope: any): any => {
    let socket: any = io.connect();
    return {
        on: (eventName: any, callback: any): void => {
            socket.on(eventName, (data): void => {
                let args: any = [data];
                $rootScope.$apply((): void => {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        },
        emit: (eventName, data, callback): void => {
            socket.emit(eventName, data, (ee): void => {
                let args: any = [data];
                $rootScope.$apply((): void => {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
}]);

Services.factory('Session', ['$resource',
    ($resource: any): any => {
        return $resource('/session/api', {}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
        });
    }]);

Services.service("BrowserService", [function () {

    this.UserAgent = "";

    this.IsIE = (): boolean => {
        return (this.UserAgent.indexOf('msie') >= 0 || this.UserAgent.indexOf('trident') >= 0 || this.UserAgent.indexOf('edge/') >= 0);
    };

    this.IsEdge = (): boolean => {
        return this.UserAgent.indexOf('edge/') >= 0;
    };

    this.IsChrome = (): boolean => {
        let result: boolean = false;
        if (!this.IsIE()) {
            result = this.UserAgent.indexOf('chrome/') >= 0;
        }
        return result;
    };

    this.IsSafari = (): boolean => {
        let result: boolean = false;
        if (!this.IsIE()) {
            if (!this.IsChrome()) {
                result = this.UserAgent.indexOf('safari/') >= 0;
            }
        }
        return result;
    };

    this.IsiPhone = (): boolean => {
        return this.UserAgent.indexOf('iphone') >= 0;
    };

    this.IsiPod = (): boolean => {
        return this.UserAgent.indexOf('ipod') >= 0;
    };

    this.IsiPad = (): boolean => {
        return this.UserAgent.indexOf('ipad') >= 0;
    };

    this.IsiOS = (): boolean => {
        return (this.IsiPhone() || this.IsiPod() || this.IsiPad());
    };

    this.IsAndroid = (): boolean => {
        return this.UserAgent.indexOf('android') >= 0;
    };

    this.IsPhone = (): boolean => {
        return (this.IsiOS() || this.IsAndroid());
    };

    this.IsTablet = (): boolean => {
        return (this.IsiPad() || (this.IsAndroid() && this.UserAgent.indexOf('mobile') < 0));
    };

    this.Version = (): number => {
        let result: number = 0;
        if (this.IsIE()) {
            let verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec(this.UserAgent);
            if (verArray) {
                result = parseInt(verArray[2], 10);
            }
        } else if (this.IsiOS()) {
            let verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec(this.UserAgent);
            if (verArray) {
                result = parseInt(verArray[2], 10);
            }
        } else if (this.IsAndroid()) {
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

    this.Get = (model: any, param: any, callback: (data: any) => void, error: (code: number, message: string) => void): void => {
        let instance = new model();
        instance.$get(param, (result: any) => {
            if (result) {
                if (result.code == 0) {
                    callback(result.value);
                } else {
                    error(result.code, result.message);
                }
            } else {
                error(10000, "network error");
            }
        });
    };

    this.List = (resource: any, query: any, option: any, success: (value: any) => void, error: (code: number, message: string) => void): void => {
        resource.query({
            query: encodeURIComponent(JSON.stringify(query)),
            option: encodeURIComponent(JSON.stringify(option))
        }, (data: any): void => {
            if (data) {
                if (data.code === 0) {
                    success(data.value);
                } else {
                    error(data.code, data.message);
                }
            } else {
                error(data.code, data.message);
            }
        });
    };

    this.Count = (resource: any, query: any, success: (value: any) => void, error: (code: number, message: string) => void): void => {
        resource.get({
            query: encodeURIComponent(JSON.stringify(query))
        }, (data: any): void => {
            if (data) {
                if (data.code === 0) {
                    success(data.value);
                } else {
                    error(data.code, data.message);
                }
            } else {
                error(data.code, data.message);
            }
        });
    };

}]);

Services.service("SessionService", ['Session', function (Session: any): void {

    this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
        Session.get({}, (result: any): void => {
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
    };

    this.Put = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
        let self = new Session();
        self.data = content;
        self.$put({}, (result: any): void => {
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

Services.directive("compareTo", (): any => {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: (scope: any, element: any, attributes: any, ngModel: any): void => {

            ngModel.$validators.compareTo = (modelValue: any): any => {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch("otherModelValue", (): void => {
                ngModel.$validate();
            });
        }
    };
});

Services.directive("guidance", ['$compile', '$parse',
    ($compile: any, $parse: any): any => {
        return (scope: any, element: any, attrs: any): void => {
            let scenario = $parse(attrs.scenario)(scope);

            let result = '<section>';
            _.forEach(scenario, (act: any, index: number): void => {

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
        }
    }
]);

Services.directive('draggablepane', ['$document', ($document: any): any => {
    return {
        restrict: 'A',
        link: (scope: any, element: any, attribute: any): void => {

            let style = element[0].style;
            if (style) {
                let name: string;

                element.css({position: 'fixed'});

                name = attribute.draggablepane;


                let start_x: number;
                let start_y: number;
                let clicked_x: number;
                let clicked_y: number;
                let location_x: string;
                let location_y: string;


                let left = localStorage.getItem(name + '_left');
                if (left) {
                    location_x = left;
                } else {
                    location_x = element[0].style.left;
                }

                let top = localStorage.getItem(name + '_top');
                if (top) {
                    location_y = top;
                } else {
                    location_y = element[0].style.top;
                }

                element.css({
                    width: element[0].style.width,
                    height: element[0].style.height,
                    top: location_y,
                    left: location_x
                });

                element.bind('mousedown', ($event: any): boolean => {
                    let result = false;

                    let header = angular.element("#box-header")[0];
                    if (header) {
                        start_x = element.prop('offsetLeft');
                        start_y = element.prop('offsetTop');
                        clicked_x = $event.clientX;
                        clicked_y = $event.clientY;

                        let handle_y = clicked_y - start_y;
                        if (handle_y < header.clientHeight) {
                            $document.bind('mousemove', mousemove);
                            $document.bind('mouseup', mouseup);
                        } else {
                            result = true;
                        }
                    }
                    return result;
                });

                let mousemove: ($event: any) => boolean = ($event: any): boolean => {

                    let target = angular.element("#draggable_area");

                    if (target) {
                        let target_x_min = target[0].offsetLeft;
                        let target_y_min = target[0].offsetTop;
                        let target_width = target[0].offsetWidth;
                        let target_height = target[0].offsetHeight;
                        let target_x_max = target_x_min + target_width;
                        let target_y_max = target_y_min + target_height;


                        let delta_x: number = $event.clientX - clicked_x;
                        let delta_y: number = $event.clientY - clicked_y;
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

                let mouseup: () => void = (): void => {

                    if (('localStorage' in window) && (window.localStorage !== null)) {

                        if (name) {
                            localStorage.setItem(name + '_left', location_x);
                            localStorage.setItem(name + '_top', location_y);
                        }

                    }

                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);
                }


            }
        }
    };
}]);

Services.filter('length', [(): any => {
    return (s: string, limit: number): string => {
        let result = s;
        if (s) {
            if (s.length > limit) {
                result = s.slice(0, limit) + "...";
            }
        }
        return result;
    };
}]);

Services.provider('HtmlEdit', [function (): void {
    this.$get = () => {
        return {
            toHtml: (object: any, init: string): string => {
                return HtmlEdit.Render.toHtml(object, init);
            },
            fromHtml: (html: string, callback: (errors, doc) => void): void => {
                HtmlEdit.Render.fromHtml(html, callback);
            },
        }
    }
}
]);

// ShapeEditProvider
Services.provider('ShapeEdit', [function (): void {

    let _self: any = this;

    _self.Handlers = new ShapeEdit.EventHandlers();
    _self.Plugins = new ShapeEdit.Plugins();

    _self.pagesize = 40;

    _self.query = {};
    _self.option = {limit: _self.pagesize, skip: 0};
    _self.count = 0;

    _self.IsOpen = false;

    _self.input = {};

    _self.ratio = 1;

    _self.scale = 1;

    _self.object = null;

    this.configure = (options) => {
        _self.Wrapper = <HTMLCanvasElement>document.getElementById(options.wrapper);
        _self.CanvasElement = <HTMLCanvasElement>document.getElementById(options.canvas);
        if (_self.CanvasElement) {
            _self.CanvasElement.width = options.width;
            _self.CanvasElement.height = options.height;
            _self.Canvas = new ShapeEdit.Canvas(_self.CanvasElement, _self.Handlers, _self.Plugins, null, true);
            //this.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.CanvasElement.width, _self.CanvasElement.height);
        }
    };

    this.adjust = (element: any, outerwidth: number, outerheight: number, innerwidth: number, innerheight: number, scale: number): void => {
        element.width = innerwidth;
        element.height = innerheight;
        element.style.marginLeft = ((outerwidth - innerwidth) / 2) + "px";
        element.style.marginRight = ((outerwidth - innerwidth) / 2) + "px";
        element.style.marginTop = ((outerheight - innerheight) / 2) + "px";
        element.style.marginBottom = ((outerheight - innerheight) / 2) + "px";

        let width: number = (outerwidth / innerwidth);
        let height: number = (outerheight / innerheight);
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

            Load: (value: any) => {
                _self.object = {};
                try {
                    _self.object = JSON.parse(value);
                } catch (e) {

                }
                _self.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.object.width, _self.object.height, _self.scale);
                ShapeEdit.Canvas.Load(_self.Canvas, _self.object, _self.Handlers);


                _self.IsOpen = true;
                _self.Canvas.isdirty = false;
                _self.Canvas.Draw();
                //    _self.Canvas.Animate();
            },


            IsDirty: (): boolean => {
                return _self.Canvas.isdirty;
            },

            Save: (): any => {
                return ShapeEdit.Canvas.Save(_self.Canvas);
            },

            Clear: (): void => {
                _self.IsOpen = true;
            },

            Draw: (): void => {
                _self.Canvas.Draw();
            },

            GetScale: (): number => {
                return _self.scale;
            },

            SetScale: (scale: number): void => {
                _self.scale = scale;
                _self.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.object.width, _self.object.height, _self.scale);
                _self.Canvas.Draw();
                //     _self.Canvas.Animate();
            },

            ToTop: (): void => {
                _self.Canvas.ToTop();
            },

            ToBottom: (): void => {
                _self.Canvas.ToBottom();
            },

            Selected: (): any => {
                _self.Canvas.Selected();
            },

            Add: (shape: any): void => {
                _self.Canvas.Add(shape);
            },

            DeleteSelected: (): void => {
                _self.Canvas.DeleteSelected();
            },
            Lock: (): void => {
                _self.Canvas.Lock();
            },
            UnLockAll: (): void => {
                _self.Canvas.UnLockAll();
            },
            Group: (): void => {
                _self.Canvas.Group();
            },
            Ungroup: (): void => {
                _self.Canvas.Ungroup();
            },
            Copy: (): void => {
                _self.Canvas.Copy();
            },
            Paste: (): void => {
                _self.Canvas.Paste();
            },
            Snap: (): void => {
                _self.Canvas.Snap();
            },
            SetMode: (mode: any): void => {
                _self.Canvas.SetMode(mode);
            },
            SetCurrentLocation: (loc: any): void => {
                _self.Canvas.SetCurrentLocation(loc);
            },
            CurrentLocation: (): any => {
                return _self.Canvas.CurrentLocation();
            },
            SetCurrentSize: (size: any): void => {
                _self.Canvas.SetCurrentSize(size);
            },
            CurrentSize: (): any => {
                return _self.Canvas.CurrentSize();
            },
            SetCurrentFillColor: (color: any): void => {
                _self.Canvas.SetCurrentFillColor(color);
            },
            CurrentFillColor: (): any => {
                return _self.Canvas.CurrentFillColor();
            },
            SetCurrentStrokeColor: (color): void => {
                _self.Canvas.SetCurrentStrokeColor(color);
            },
            CurrentStrokeColor: (): any => {
                return _self.Canvas.CurrentStrokeColor();
            },
            SetCurrentStrokeWidth: (width): void => {
                _self.Canvas.SetCurrentStrokeWidth(width);
            },
            CurrentStrokeWidth: (): number => {
                return _self.Canvas.CurrentStrokeWidth();
            },
            SetCurrentFontStyle: (style: string): void => {
                if (_self.Canvas) {
                    _self.Canvas.SetCurrentFontStyle(style);
                }
            },
            CurrentFontStyle: (): string => {
                return _self.Canvas.CurrentFontStyle();
            },
            SetCurrentFontVariant(variant: string): void {
                _self.Canvas.SetCurrentFontVariant(variant);
            },
            CurrentFontVariant: (): string => {
                return _self.Canvas.CurrentFontVariant();
            },
            SetCurrentFontWeight: (weight: string): void => {
                if (_self.Canvas) {
                    _self.Canvas.SetCurrentFontWeight(weight);
                }
            },
            CurrentFontWeight: (): string => {
                return _self.Canvas.CurrentFontWeight();
            },
            SetCurrentFontSize: (size): void => {
                if (_self.Canvas) {
                    _self.Canvas.SetCurrentFontSize(size);
                }
            },
            CurrentFontSize: (): number => {
                return _self.Canvas.CurrentFontSize();
            },
            SetCurrentFontKeyword: (keyword): void => {
                _self.Canvas.SetCurrentFontKeyword(keyword);
            },
            CurrentFontKeyword: (): string => {
                return _self.Canvas.CurrentFontKeyword();
            },
            SetCurrentFontFamily: (family: string[]): void => {
                _self.Canvas.SetCurrentFontFamily(family);
            },
            CurrentFontFamily: (): string[] => {
                return _self.Canvas.CurrentFontFamily();
            },
            SetCurrentPath: (path: string): void => {
                _self.Canvas.SetCurrentPath(path);
            },
            CurrentPath: (): string => {
                return _self.Canvas.CurrentPath();
            },
            SetCurrentAlign: (align: string): void => {
                if (_self.Canvas) {
                    _self.Canvas.SetCurrentAlign(align);
                }
            },
            CurrentAlign: (): string => {
                return _self.Canvas.CurrentAlign();
            },
            SetCurrentText: (text: string): void => {
                if (_self.Canvas) {
                    _self.Canvas.SetCurrentText(text);
                }
            },
            CurrentText: (): string => {
                return _self.Canvas.CurrentText();
            },
            CurrentType: (): string => {
                return _self.Canvas.CurrentType();
            },
            SetCurrentShapesAlign: (align: number): void => {
                _self.Canvas.SetCurrentShapesAlign(align);
            },
            DeselectAll: (): void => {
                _self.Canvas.DeselectAll();
            },
            SelectedCount: (): number => {
                return _self.Canvas.SelectedCount();
            },
            onTick: (callback: (shape: ShapeEdit.BaseShape, context: any) => any) => {
                _self.Plugins.on("tick", callback);
            },
            onDraw: (callback: (shape: ShapeEdit.BaseShape, context: any) => void) => {
                _self.Plugins.on("draw", callback);
            },
            onNew: (callback: (shape: ShapeEdit.BaseShape) => void) => {
                _self.Handlers.on("new", callback);
            },
            onDelete: (callback: (shape: ShapeEdit.BaseShape) => void) => {
                _self.Handlers.on("delete", callback);
            },
            onSelect: (callback: (shape: ShapeEdit.BaseShape, context: any) => void) => {
                _self.Handlers.on("select", callback);
            },
            onDeselect: (callback: (shape: ShapeEdit.BaseShape, context: any) => void) => {
                _self.Handlers.on("deselect", callback);
            },
            onMove: (callback: (shape: ShapeEdit.BaseShape) => void) => {
                _self.Handlers.on("move", callback);
            },
            onResize: (callback: (shape: ShapeEdit.BaseShape) => void) => {
                _self.Handlers.on("resize", callback);
            },
            onDeformation: (callback: (shape: ShapeEdit.BaseShape) => void) => {
                _self.Handlers.on("deformation", callback);
            },
            onChange: (callback: () => void) => {
                _self.Handlers.on("change", callback);
            },
            onKeydown: (callback: (shape: ShapeEdit.BaseShape, e: any) => void) => {
                _self.Handlers.on("keydown", callback);
            },
            onDrop: (callback: (shape: ShapeEdit.BaseShape, e: any) => void) => {
                _self.Handlers.on("drop", callback);
            },
            onResizeWindow: (callback: (wrapper: any, inner: any) => void): void => {
                let resizeTimer: any;
                let interval: number = Math.floor(1000 / 60 * 10);
                window.addEventListener('resize', (event: any): void => {
                    if (resizeTimer !== false) {
                        clearTimeout(resizeTimer);
                    }
                    resizeTimer = setTimeout((): void => {
                        if (_self.object) {
                            callback(_self.Wrapper, _self.object);
                            _self.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.object.width, _self.object.height, _self.scale);
                            _self.Canvas.Draw();
                            //      _self.Canvas.Animate();
                        }
                    }, interval);
                });
            }
        }
    }
}
]);