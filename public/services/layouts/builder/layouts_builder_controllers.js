/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
/// <reference path="../../../systems/common/shape_edit/shape_edit.ts" />
/// <reference path="../../../systems/common/shape_edit/server_canvas.ts" />
/// <reference path="../../../systems/common/shape_edit/adaptor.ts" />
"use strict";
let BuilderControllers = angular.module('BuilderControllers', ['ui.bootstrap', 'ui.ace']);
BuilderControllers.controller('BuilderController', ["$scope", '$document', '$log', '$window', "$compile", '$uibModal', 'ShapeEdit', 'TemplateService',
    ($scope, $document, $log, $window, $compile, $uibModal, ShapeEdit, TemplateService) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
            alert(message);
        };
        let alert = (message) => {
            let modalInstance = $uibModal.open({
                controller: 'AlertDialogController',
                templateUrl: '/common/dialogs/alert_dialog',
                resolve: {
                    items: () => {
                        return message;
                    }
                }
            });
            modalInstance.result.then((answer) => {
            }, () => {
            });
        };
        $document.on('drop dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
        window.addEventListener('beforeunload', (event) => {
            if ($scope.opened) {
                if (ShapeEdit.IsDirty()) {
                    event.returnValue = '';
                    return '';
                }
            }
        }, false);
        window.addEventListener("keydown", (event) => {
            ShapeEdit.Canvas.onKeyDown(event);
        });
        window.addEventListener("keyup", (event) => {
            ShapeEdit.Canvas.onKeyUp(event);
        });
        let EditClear = () => {
            _.each(ShapeEdit.Input, function (element, id) {
                ShapeEdit.Wrapper.removeChild(element);
                delete ShapeEdit.Input[id];
            });
        };
        /*
                WebFont.load({
                    google: {
                        families: ['Pacifico::latin']
                    },
                    loading: function () {
                        // ロードが開始されたとき
                        let a = 1;
                    },
                    active: function () {
                        // Web Fontが使用可能になったとき
                        let a = 1;
                    },
                    inactive: function () {
                        // ブラウザがサポートしていないとき
                        let a = 1;
                    },
                    fontloading: function (fontFamily, fontDescription) {
                        // fontFamilyのロードが開始されたとき
                        let a = 1;
                    },
                    fontactive: function (fontFamily, fontDescription) {
                        let a = 1;
                    },
                    fontinactive: function (fontFamily, fontDescription) {
                        // fontFamilyをブラウザがサポートしていないとき
                        let a = 1;
                    }
                });
        */
        let Font_Display = () => {
            $scope.fontfills = ShapeEdit.CurrentFillColor().RGB();
            $scope.fontsize = ShapeEdit.CurrentFontSize();
            $scope.FontKeyword = ShapeEdit.CurrentFontKeyword();
            $scope.FontWeight = ShapeEdit.CurrentFontWeight();
            $scope.FontVariant = ShapeEdit.CurrentFontVariant();
            $scope.FontStyle = ShapeEdit.CurrentFontStyle();
            $scope.FontFamily = ShapeEdit.CurrentFontFamily()[0];
            $scope.path = ShapeEdit.CurrentPath();
        };
        let Select = (shape) => {
            let loc = shape.Location();
            $scope.x = loc.x;
            $scope.y = loc.y;
            let size = shape.Size();
            $scope.w = size.w;
            $scope.h = size.h;
            let property = shape.Property();
            let fields = property.description["field"];
            $scope.fields = fields;
            $scope.strokewidth = shape.StrokeWidth();
            $scope.fills = shape.FillColor().RGB();
            $scope.strokefills = shape.StrokeColor().RGB();
            $scope.fontsize = shape.FontSize();
            $scope.FontKeyword = shape.FontKeyword();
            $scope.FontWeight = shape.FontWeight();
            $scope.FontVariant = shape.FontVariant();
            $scope.FontStyle = shape.FontStyle();
            $scope.FontFamily = shape.FontFamily()[0];
            $scope.path = property.path;
        };
        let Deselect = () => {
            /*         $scope.x = 0;
                     $scope.y = 0;
                     $scope.w = 0;
                     $scope.h = 0;
         
                     $scope.fields = null;
                     $scope.fills = null;
                     $scope.strokewidth = 0;
                     $scope.strokefills = null;
                     $scope.fontsize = 0;
                     $scope.FontKeyword = "";
                     $scope.FontWeight = 0;
                     $scope.FontVariant = null;
                     $scope.FontStyle = 0;
                     $scope.path = "";
                     */
        };
        let aceOption = {
            onLoad: (_ace) => {
                _ace.setTheme("ace/theme/monokai");
                _ace.getSession().setMode("ace/mode/javascript");
            }
        };
        let changeText = () => {
            ShapeEdit.SetCurrentText($scope.text);
        };
        let IsOpen = () => {
            return ShapeEdit.IsOpen;
        };
        let SetScale = (scale) => {
            ShapeEdit.SetScale(scale);
        };
        let ToTop = () => {
            ShapeEdit.ToTop();
        };
        let ToBottom = () => {
            ShapeEdit.ToBottom();
        };
        let Lock = () => {
            ShapeEdit.Lock();
        };
        let UnLockAll = () => {
            ShapeEdit.UnLockAll();
        };
        let Group = () => {
            ShapeEdit.Group();
        };
        let Ungroup = () => {
            ShapeEdit.Ungroup();
        };
        let Copy = () => {
            ShapeEdit.Copy();
        };
        let Paste = () => {
            ShapeEdit.Paste();
        };
        let SetAlign = (align) => {
            ShapeEdit.SetCurrentShapesAlign(align);
        };
        let Create = () => {
            let modalRegist = $uibModal.open({
                controller: 'BuilderCreateDialogController',
                templateUrl: '/layouts/builder/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((layout) => {
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
            }, () => {
            });
        };
        let Open = () => {
            let modalRegist = $uibModal.open({
                controller: 'BuilderOpenDialogController',
                templateUrl: '/layouts/builder/dialogs/open_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((layout) => {
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
            }, () => {
            });
        };
        let Update = () => {
            if (TemplateService.current_layout) {
                progress(true);
                TemplateService.current_layout.content.text = ShapeEdit.Serialize();
                TemplateService.Put(TemplateService.current_layout, (result) => {
                    progress(false);
                }, error_handler);
            }
        };
        //
        let UpdateAs = () => {
            let modalRegist = $uibModal.open({
                controller: 'BuilderSaveAsDialogController',
                templateUrl: '/layouts/builder/dialogs/saveas_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((layout) => {
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
            }, () => {
            });
        };
        let Delete = () => {
            if (TemplateService.current_layout) {
                let modalRegist = $uibModal.open({
                    controller: 'BuilderDeleteConfirmController',
                    templateUrl: '/layouts/builder/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: () => {
                            return TemplateService.current_layout;
                        }
                    }
                });
                modalRegist.result.then((content) => {
                    progress(true);
                    TemplateService.Delete((result) => {
                        TemplateService.current_layout = null;
                        progress(false);
                        ShapeEdit.Clear();
                        $scope.opened = false;
                    }, error_handler);
                }, () => {
                });
            }
        };
        let PrintPNG = () => {
            let width, height;
            ShapeEdit.Snap();
            switch (TemplateService.format.layout) {
                case "portrait":
                    width = TemplateService.format.size[0];
                    height = TemplateService.format.size[1];
                    break;
                case "landscape":
                    width = TemplateService.format.size[1];
                    height = TemplateService.format.size[0];
                    break;
                default:
            }
            Canvas2Image.saveAsPNG(ShapeEdit.CanvasElement, width, height);
        };
        let PrintPDF = () => {
            progress(true);
            TemplateService.current_layout.content.text = ShapeEdit.Serialize();
            TemplateService.current_layout.content.format = TemplateService.format;
            TemplateService.PrintPDF(TemplateService.current_layout, (result) => {
                progress(false);
                $window.location.href = "/layouts/download/pdf";
            }, error_handler);
        };
        let PrintSVG = () => {
            progress(true);
            TemplateService.current_layout.content.text = ShapeEdit.Serialize();
            TemplateService.PrintSVG(TemplateService.current_layout, (result) => {
                progress(false);
                $window.location.href = "/layouts/download/svg";
            }, error_handler);
        };
        let ChangeEditMode = (mode) => {
            switch (mode) {
                case 'move':
                    ShapeEdit.SetMode(ShapeEdit.Mode.move);
                    break;
                case 'draw':
                    ShapeEdit.SetMode(ShapeEdit.Mode.draw);
                    break;
                case 'bezierdraw':
                    ShapeEdit.SetMode(ShapeEdit.Mode.bezierdraw);
                    break;
                default:
                    break;
            }
        };
        let changeLocationX = (x) => {
            let loc = ShapeEdit.CurrentLocation();
            loc.x = x;
            ShapeEdit.SetCurrentLocation(loc);
        };
        let changeLocationY = (y) => {
            let loc = ShapeEdit.CurrentLocation();
            loc.y = y;
            ShapeEdit.SetCurrentLocation(loc);
        };
        let changeSizeW = (w) => {
            let size = ShapeEdit.CurrentSize();
            size.w = w;
            ShapeEdit.SetCurrentSize(size);
        };
        let changeSizeH = (h) => {
            let size = ShapeEdit.CurrentSize();
            size.h = h;
            ShapeEdit.SetCurrentSize(size);
        };
        let strokewidthChange = (stroke) => {
            let color = null;
            ShapeEdit.SetCurrentStrokeWidth(stroke);
        };
        let pathChange = (path) => {
            ShapeEdit.SetCurrentPath(path);
        };
        let changeFontStyle = (fontstyle) => {
            ShapeEdit.SetCurrentFontStyle(fontstyle);
            Font_Display();
        };
        // 太さ   normal、bold、lighter、bolder、または100〜900の9段階
        let changeFontWeigt = (fontweight) => {
            ShapeEdit.SetCurrentFontWeight(fontweight);
            Font_Display();
        };
        // font names
        let changeFontAlign = (FontAlign) => {
            ShapeEdit.SetCurrentAlign(FontAlign);
            Font_Display();
        };
        let fontsizeChange = (fontsize) => {
            ShapeEdit.SetCurrentFontSize(fontsize);
            Font_Display();
        };
        let labelChange = (label, index) => {
            if (label) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].label = label;
                }
            }
        };
        let modeChange = (mode, index) => {
            if (mode) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].mode = mode;
                }
            }
        };
        let typeChange = (type, index) => {
            if (type) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].type = type;
                }
            }
        };
        let requiredChange = (required, index) => {
            if (required) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate.required = (required == "true");
                }
            }
        };
        let maxlengthChange = (maxlength, index) => {
            if (maxlength) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate["ng-maxlength"] = Number(maxlength);
                }
            }
        };
        let minlengthChange = (minlength, index) => {
            if (minlength) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate["ng-minlength"] = Number(minlength);
                }
            }
        };
        let optionsChange = (options, index) => {
            if (options) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].options = options;
                }
            }
        };
        let onChangeChange = (onChange, index) => {
            if (onChange) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].events = { onChange: onChange };
                }
            }
        };
        let lookupChange = (lookup, index) => {
            if (lookup) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].lookup = lookup;
                }
            }
        };
        let AddText = () => {
            var obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 30),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, 'テキスト', [], '', new ShapeEdit.RGBAColor(80, 80, 80, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 0, new ShapeEdit.Font("normal", "normal", "normal", 24, "sans-serif", ["noto"]), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            var text = new ShapeEdit.Text(ShapeEdit.Canvas, obj);
            ShapeEdit.Add(text);
        };
        let AddBox = () => {
            var obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 0, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            var box = new ShapeEdit.Box(ShapeEdit.Canvas, obj);
            ShapeEdit.Add(box);
        };
        let AddOval = () => {
            var obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 0, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            var rect = new ShapeEdit.Oval(ShapeEdit.Canvas, obj);
            ShapeEdit.Add(rect);
        };
        let AddBezier = () => {
            let obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 1, new ShapeEdit.Font("", "", "", 18, "sans-serif", []), "", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            let context = new ShapeEdit.Bezier(ShapeEdit.Canvas, obj);
            context.bezierCurveTo(310.17, 147.19, 310.17, 97.81, 271.5, 67.35);
            context.bezierCurveTo(232.84, 36.88, 170.16, 36.88, 131.5, 67.35);
            context.bezierCurveTo(92.83, 97.81, 92.83, 147.19, 131.5, 177.65);
            context.bezierCurveTo(170.16, 208.12, 232.84, 208.12, 271.5, 177.65);
            context.ResizeRectangle();
            ShapeEdit.Add(context);
        };
        let AddImage = () => {
            var obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 200, 200),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '/systems/files/files/blank.png', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 1, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            var image = new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj);
            ShapeEdit.Add(image);
        };
        let DeleteSelected = () => {
            ShapeEdit.DeleteSelected();
        };
        let SelectedCount = () => {
            return ShapeEdit.SelectedCount();
        };
        ShapeEdit.onTick((shape, context) => {
            return context;
        });
        ShapeEdit.onDraw((shape, context) => {
        });
        ShapeEdit.onNew((shape) => {
            switch (shape.type) {
                case "Text":
                    {
                        shape.Property().description["field"] = {
                            text: {
                                label: "text",
                                type: "text",
                                mode: "static",
                                validate: { required: true, "ng-maxlength": 50, "ng-minlength": 10 },
                                options: [],
                                events: { onChange: "" },
                                lookup: ""
                            },
                            color: {
                                label: "color",
                                type: "color",
                                mode: "static",
                                validate: { required: true, "ng-maxlength": 7, "ng-minlength": 7 },
                                options: [],
                                events: { onChange: "" },
                                lookup: ""
                            }
                        };
                    }
                    break;
                case "Box":
                case "Oval":
                case "Polygon":
                case "Bezier":
                case "Shapes":
                    {
                        shape.Property().description["field"] = {
                            color: {
                                label: "color",
                                type: "color",
                                mode: "static",
                                validate: { required: true, "ng-maxlength": 7, "ng-minlength": 7 },
                                options: [],
                                events: { onChange: "" },
                                lookup: ""
                            }
                        };
                    }
                    break;
                case "ImageRect": {
                    shape.Property().description["field"] = {
                        text: {
                            label: "text",
                            type: "text",
                            mode: "static",
                            validate: { required: true, "ng-maxlength": 50, "ng-minlength": 10 },
                            options: [],
                            events: { onChange: "" },
                            lookup: ""
                        }
                    };
                }
            }
        });
        ShapeEdit.onResizeWindow((wrapper, inner) => {
        });
        ShapeEdit.onSelect((shape, context) => {
            // for inPlace text input
            if (ShapeEdit.SelectedCount() === 1) {
                if (shape.Parent().IsRoot()) {
                    switch (shape.type) {
                        case "Text":
                            $scope.$evalAsync(// $apply
                            function ($scope) {
                                let id = shape.ID();
                                $scope.id = id;
                                $scope.text = shape.Property().text;
                                Select(shape);
                                $scope.SelectType = "Text";
                            });
                            break;
                        case "Box":
                        case "Oval":
                        case "Polygon":
                        case "Bezier":
                        case "Shapes":
                            {
                                $scope.$evalAsync(// $apply
                                function ($scope) {
                                    let id = shape.ID();
                                    $scope.id = id;
                                    Select(shape);
                                    $scope.SelectType = "Shape";
                                });
                            }
                            break;
                        case "ImageRect":
                            {
                                $scope.$evalAsync(// $apply
                                function ($scope) {
                                    let id = shape.ID();
                                    $scope.id = id;
                                    Select(shape);
                                    $scope.SelectType = "Image";
                                });
                            }
                            break;
                        default:
                    }
                }
            }
            else {
                EditClear(); // for inPlace text input
            }
        });
        ShapeEdit.onDelete((shape) => {
            $scope.id = null;
            Deselect();
            $scope.SelectType = "";
            $scope.SelectImage = false;
        });
        ShapeEdit.onDeselect((shape, context) => {
            $scope.$evalAsync(// $apply
            function ($scope) {
                $scope.id = null;
                Deselect();
                $scope.SelectType = "";
                $scope.SelectImage = false;
            });
        });
        ShapeEdit.onMove((shape) => {
            $scope.$evalAsync(// $apply
            function ($scope) {
                let loc = shape.Location();
                $scope.x = loc.x;
                $scope.y = loc.y;
            });
        });
        ShapeEdit.onResize((shape) => {
            $scope.$evalAsync(// $apply
            function ($scope) {
                let size = shape.Size();
                $scope.w = size.w;
                $scope.h = size.h;
            });
        });
        ShapeEdit.onDeformation((shape) => {
            $scope.$evalAsync(// $apply
            function ($scope) {
                let size = shape.Size();
                $scope.w = size.w;
                $scope.h = size.h;
            });
        });
        ShapeEdit.onChange(() => {
        });
        ShapeEdit.onKeydown((shape, e) => {
        });
        ShapeEdit.onDrop((shape, e) => {
            if (e.dataTransfer.files.length == 0) {
                var url = e.dataTransfer.getData('url');
                if (url != "") {
                    // to localpath
                    //     let parser = document.createElement('a');
                    //     parser.href = url;
                    //     let localpath = parser.pathname;
                    let image = new Image();
                    image.crossOrigin = 'Anonymous';
                    // for url load error detect.
                    //image.setAttribute('crossOrigin', 'anonymous');
                    image.onload = (ex) => {
                        let w = ex.target.width;
                        let h = ex.target.height;
                        let obj = {
                            rectangle: new ShapeEdit.Rectangle(e.offsetX - (w / 2), e.offsetY - (h / 2), w, h),
                            property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], url, new ShapeEdit.RGBAColor(255, 255, 255, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 9, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "", "miter", {
                                "category": "",
                                "type": "meter"
                            })
                        };
                        ShapeEdit.Add(new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj));
                    };
                    image.onerror = () => {
                    };
                    image.src = url;
                }
            }
            else {
                let file = e.dataTransfer.files[0];
                let reader = new FileReader();
                reader.onload = ((theFile) => {
                    return (ex) => {
                        let img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.onload = () => {
                            let w = img.width;
                            let h = img.height;
                            let url = ex.target.result;
                            let obj = {
                                rectangle: new ShapeEdit.Rectangle(e.offsetX - (w / 2), e.offsetY - (h / 2), w, h),
                                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], url, new ShapeEdit.RGBAColor(255, 255, 255, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 9, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "", "miter", {
                                    "category": "",
                                    "type": "meter"
                                })
                            };
                            ShapeEdit.Add(new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj));
                        };
                        img.src = ex.target.result;
                    };
                })(file);
                reader.readAsDataURL(file);
            }
        });
        $scope.opened = false;
        $scope.IsOpen = IsOpen;
        $scope.editmode = "move";
        $scope.changeText = changeText;
        $scope.aceOption = aceOption;
        $scope.SetScale = SetScale;
        $scope.ToTop = ToTop;
        $scope.ToBottom = ToBottom;
        $scope.Lock = Lock;
        $scope.UnLockAll = UnLockAll;
        $scope.Group = Group;
        $scope.Ungroup = Ungroup;
        $scope.Copy = Copy;
        $scope.Paste = Paste;
        $scope.SetAlign = SetAlign;
        $scope.Create = Create;
        $scope.Open = Open;
        $scope.Update = Update;
        $scope.UpdateAs = UpdateAs;
        $scope.Delete = Delete;
        $scope.PrintPNG = PrintPNG;
        $scope.PrintPDF = PrintPDF;
        $scope.PrintSVG = PrintSVG;
        $scope.ChangeEditMode = ChangeEditMode;
        $scope.strokewidthChange = strokewidthChange;
        $scope.pathChange = pathChange;
        $scope.changeLocationX = changeLocationX;
        $scope.changeLocationY = changeLocationY;
        $scope.changeSizeW = changeSizeW;
        $scope.changeSizeH = changeSizeH;
        $scope.changeFontStyle = changeFontStyle;
        $scope.changeFontWeigt = changeFontWeigt;
        $scope.changeFontAlign = changeFontAlign;
        $scope.fontsizeChange = fontsizeChange;
        $scope.labelChange = labelChange;
        $scope.modeChange = modeChange;
        $scope.typeChange = typeChange;
        $scope.requiredChange = requiredChange;
        $scope.maxlengthChange = maxlengthChange;
        $scope.minlengthChange = minlengthChange;
        $scope.optionsChange = optionsChange;
        $scope.onChangeChange = onChangeChange;
        $scope.lookupChange = lookupChange;
        $scope.AddText = AddText;
        $scope.AddBox = AddBox;
        $scope.AddOval = AddOval;
        $scope.AddBezier = AddBezier;
        $scope.AddImage = AddImage;
        $scope.DeleteSelected = DeleteSelected;
        $scope.SelectedCount = SelectedCount;
        $scope.$watch('fills', (color_string) => {
            if (color_string) {
                let color = new ShapeEdit.RGBAColor(0, 0, 0, 1);
                color.SetRGB(color_string);
                ShapeEdit.SetCurrentFillColor(color);
                Font_Display();
            }
        });
        $scope.$watch('strokefills', (color_string) => {
            if (color_string) {
                let color = new ShapeEdit.RGBAColor(0, 0, 0, 0);
                color.SetRGB(color_string);
                ShapeEdit.SetCurrentStrokeColor(color);
                Font_Display();
            }
        });
        $scope.$watch('FontVariant', (FontVariant) => {
            if (FontVariant) {
                ShapeEdit.SetCurrentFontVariant(FontVariant);
                Font_Display();
            }
        });
        $scope.$watch('FontWeight', (fontweight) => {
            if (fontweight) {
                ShapeEdit.SetCurrentFontWeight(fontweight);
                Font_Display();
            }
        });
        $scope.$watch('FontKeyword', (FontKeyword) => {
            if (FontKeyword) {
                ShapeEdit.SetCurrentFontKeyword(FontKeyword);
                Font_Display();
            }
        });
        $scope.$watch('FontFamily', (FontFamily) => {
            if (FontFamily) {
                ShapeEdit.SetCurrentFontFamily([FontFamily]);
                Font_Display();
            }
        });
        Font_Display();
    }]);
BuilderControllers.controller('BuilderCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'TemplateService', 'ShapeEdit', 'items',
    ($scope, $log, $uibModalInstance, TemplateService, ShapeEdit, items) => {
        $scope.dpi = 800;
        $scope.ratio = 1.414;
        $scope.margintop = 72;
        $scope.marginbottom = 72;
        $scope.marginleft = 72;
        $scope.marginright = 72;
        $scope.layout = "portrait";
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            progress(true);
            let short = $scope.dpi;
            TemplateService.format.size = [short, short * $scope.ratio];
            TemplateService.format.margins.top = $scope.margintop;
            TemplateService.format.margins.bottom = $scope.marginbottom;
            TemplateService.format.margins.left = $scope.marginleft;
            TemplateService.format.margins.right = $scope.marginright;
            TemplateService.format.layout = $scope.layout;
            TemplateService.format.info.Title = $scope.title;
            TemplateService.format.info.Subject = $scope.subject;
            TemplateService.format.info.Author = $scope.author;
            let cover_letter = {
                "type": "Canvas",
                "shapes": {
                    "type": "Shapes",
                    "locked": "false",
                    "rectangle": {
                        "type": "Size",
                        "location": { "type": "Location", "x": 0, "y": 0, "miter": 0 },
                        "size": { "type": "Size", "w": 0, "h": 0 }
                    },
                    "property": {
                        "type": "ShapeProperty",
                        "text": "",
                        "textwidth": [],
                        "path": "",
                        "fillstyle": { "type": "RGBAColor", "r": 0, "g": 0, "b": 0, "a": 0 },
                        "strokestyle": { "type": "RGBAColor", "r": 0, "g": 0, "b": 0, "a": 0 },
                        "strokewidth": 0,
                        "font": {
                            "style": "",
                            "variant": "",
                            "weight": "",
                            "size": 0,
                            "keyword": "sans-serif",
                            "family": []
                        },
                        "align": "",
                        "linejoin": "miter",
                        "description": {}
                    },
                    "shapes": []
                },
                "width": 0,
                "height": 0
            };
            switch (TemplateService.format.layout) {
                case "portrait":
                    cover_letter.width = TemplateService.format.size[0];
                    cover_letter.height = TemplateService.format.size[1];
                    break;
                case "landscape":
                    cover_letter.width = TemplateService.format.size[1];
                    cover_letter.height = TemplateService.format.size[0];
                    break;
                default:
            }
            let content = {
                title: $scope.title,
                subtitle: $scope.subject,
                text: JSON.stringify(cover_letter),
                format: TemplateService.format,
            };
            TemplateService.Create($scope.title, content, (result) => {
                TemplateService.current_layout = result;
                TemplateService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
                progress(false);
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);
BuilderControllers.controller('BuilderOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ShapeEdit', 'TemplateService',
    ($scope, $log, $uibModalInstance, $uibModal, items, ShapeEdit, TemplateService) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        let EditClear = () => {
            _.each(ShapeEdit.Input, function (element, id) {
                ShapeEdit.Wrapper.removeChild(element);
                delete ShapeEdit.Input[id];
            });
        };
        let Count = () => {
            TemplateService.Count((result) => {
                $scope.count = result;
            }, error_handler);
        };
        let Query = () => {
            TemplateService.Query((value) => {
                $scope.layouts = value;
                TemplateService.Over((hasnext) => { $scope.over = !hasnext; });
                TemplateService.Under((hasprev) => { $scope.under = !hasprev; });
            }, error_handler);
        };
        let Next = () => {
            progress(true);
            TemplateService.Next((result) => {
                if (result) {
                    $scope.layouts = result;
                }
                TemplateService.Over((hasnext) => { $scope.over = !hasnext; });
                TemplateService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            TemplateService.Prev((result) => {
                if (result) {
                    $scope.layouts = result;
                }
                TemplateService.Over((hasnext) => { $scope.over = !hasnext; });
                TemplateService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Get = (layout) => {
            progress(true);
            TemplateService.Get(layout._id, (result) => {
                TemplateService.current_layout = result;
                TemplateService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
                //        EditClear();
                progress(false);
                $uibModalInstance.close(result);
            }, error_handler);
        };
        let hide = () => {
            $uibModalInstance.close();
        };
        let cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = () => Query;
        Count();
        Query();
    }]);
BuilderControllers.controller('BuilderSaveAsDialogController', ['$scope', '$log', '$uibModalInstance', 'TemplateService', 'ShapeEdit', 'items',
    ($scope, $log, $uibModalInstance, TemplateService, ShapeEdit, items) => {
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            //       let short = 525;
            progress(true);
            if (TemplateService.current_layout) {
                progress(true);
                TemplateService.current_layout.content.text = ShapeEdit.Serialize();
                TemplateService.PutAs($scope.title, TemplateService.current_layout, (result) => {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            }
        };
    }]);
BuilderControllers.controller('BuilderDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.title = items.content.title;
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            $uibModalInstance.close({});
        };
    }]);
//# sourceMappingURL=layouts_builder_controllers.js.map