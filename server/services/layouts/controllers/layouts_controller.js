/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LayoutsModule;
(function (LayoutsModule) {
    var fs = require('graceful-fs');
    var _ = require('lodash');
    //   const mongoose = require('mongoose');
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var config = share.config;
    var Wrapper = share.Wrapper;
    // const logger = share.logger;
    var ShapeEditModule = core.ShapeEditModule;
    var ServerModule = core.ServerModule;
    var AdaptorModule = core.AdaptorModule;
    var services_config = share.services_config;
    var LayoutModel = require(share.Models("/services/layouts/layout"));
    var builder_userid = config.systems.userid; // template maker user id
    var webfonts = services_config.webfonts || [];
    var Layout = /** @class */ (function () {
        function Layout() {
        }
        /**
         * @param request
         * @returns userid
         */
        Layout.userid = function (request) {
            return request.user.userid;
        };
        Layout.namespace = function (request) {
            var result = "";
            if (request.user) {
                if (request.user.data) {
                    result = request.user.data.namespace;
                }
            }
            return result;
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.create_template = function (request, response) {
            Layout.create(request, response, 1);
        };
        /**
         * @param request
         * @param requestQ
         * @param response
         * @returns none
         */
        Layout.prototype.create_layout = function (request, response) {
            Layout.create(request, response, 2);
        };
        /**
         * @param request
         * @param response
         * @param layout_type
         * @returns none。
         *
         * nameがキー
         */
        Layout.create = function (request, response, layout_type) {
            var number = 2000;
            var userid = Layout.userid(request);
            var namespace = request.body.namespace;
            var name = request.body.name;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, LayoutModel, { $and: [{ name: name }, { type: layout_type }, { namespace: namespace }, { userid: userid }] }, function (response, exists) {
                        if (!exists) {
                            var layout = new LayoutModel();
                            layout.userid = userid;
                            layout.name = name;
                            layout.namespace = namespace;
                            layout.content = request.body.content;
                            layout.open = true;
                            layout.type = layout_type;
                            Wrapper.Save(response, number, layout, function (response, object) {
                                Wrapper.SendSuccess(response, object);
                            });
                        }
                        else {
                            Wrapper.SendWarn(response, 1, "already", { code: 1, message: "already" });
                        }
                    });
                }
                else {
                    Wrapper.SendError(response, 3, "article name must not contain '/'", { code: 3, message: "article name must not contain '/'" });
                }
            }
            else {
                Wrapper.SendWarn(response, 1, "no name", { code: 1, message: "no name" });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.put_template = function (request, response) {
            Layout.put(request, response, 1);
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.put_layout = function (request, response) {
            Layout.put(request, response, 2);
        };
        /**
         * @param request
         * @param response
         * @param layout_type
         * @returns none
         *
         * nameが同じレイアウトがなければ新規。
         * あれば更新。
         */
        Layout.put = function (request, response, layout_type) {
            var number = 2000;
            var userid = Layout.userid(request);
            var namespace = Layout.namespace(request);
            var name = request.body.name;
            if (name) {
                Wrapper.FindOne(response, number, LayoutModel, { $and: [{ name: name }, { type: layout_type }, { namespace: namespace }, { userid: userid }] }, function (response, exists) {
                    if (!exists) {
                        var layout = new LayoutModel();
                        layout.userid = userid;
                        layout.name = name;
                        layout.content = request.body.content;
                        layout.open = true;
                        layout.type = layout_type;
                        Wrapper.Save(response, number, layout, function (response, object) {
                            Wrapper.SendSuccess(response, object);
                        });
                    }
                    else {
                        var id = request.params.id;
                        Wrapper.FindOne(response, number, LayoutModel, { $and: [{ _id: id }, { type: layout_type }, { namespace: namespace }, { userid: userid }] }, function (response, layout) {
                            if (layout) {
                                layout.content = request.body.content;
                                layout.open = true;
                                layout.type = layout_type;
                                Wrapper.Save(response, number, layout, function (response, object) {
                                    Wrapper.SendSuccess(response, object);
                                });
                            }
                            else {
                                Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                            }
                        });
                    }
                });
            }
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.delete_template = function (request, response) {
            Layout.delete(request, response, 1);
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.delete_layout = function (request, response) {
            Layout.delete(request, response, 2);
        };
        /**
         * @param request
         * @param response
         * @param layout_type
         * @returns none
         */
        Layout.delete = function (request, response, layout_type) {
            var number = 2200;
            var userid = Layout.userid(request);
            var namespace = Layout.namespace(request);
            var id = request.params.id;
            Wrapper.FindOne(response, number, LayoutModel, { $and: [{ _id: id }, { type: layout_type }, { namespace: namespace }, { userid: userid }] }, function (response, layout) {
                if (layout) {
                    Wrapper.Remove(response, number, layout, function (response) {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.delete_own = function (request, response) {
            var number = 2300;
            var userid = Layout.userid(request);
            var namespace = Layout.namespace(request);
            Wrapper.Delete(response, number, LayoutModel, { $and: [{ namespace: namespace }, { userid: userid }] }, function (response) {
                Wrapper.SendSuccess(response, {});
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.namespaces = function (userid, callback) {
            var number = 1400;
            LayoutModel.find({ userid: userid }, { "namespace": 1, "_id": 0 }, {}).then(function (pages) {
                var result = [];
                _.forEach(pages, function (page) {
                    if (page.namespace) {
                        result.push(page.namespace);
                    }
                });
                callback(null, _.uniqBy(result));
            }).catch(function (error) {
                callback(error, null);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.get_template = function (request, response) {
            var number = 2400;
            var userid = Layout.userid(request);
            var namespace = Layout.namespace(request);
            var id = request.params.id;
            Wrapper.FindOne(response, number, LayoutModel, { $and: [{ _id: id }, { type: 1 }, { $or: [{ userid: userid }, { userid: builder_userid }] }] }, function (response, layout) {
                if (layout) {
                    Wrapper.SendSuccess(response, layout);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.get_layout = function (request, response) {
            var number = 2500;
            var userid = Layout.userid(request);
            var namespace = Layout.namespace(request);
            var id = request.params.id;
            Wrapper.FindOne(response, number, LayoutModel, { $and: [{ _id: id }, { type: 2 }, { namespace: namespace }, { userid: userid }] }, function (response, layout) {
                if (layout) {
                    Wrapper.SendSuccess(response, layout);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.get_template_query = function (request, response) {
            var number = 2600;
            var userid = Layout.userid(request);
            var namespace = Layout.namespace(request);
            // request.params.namespace;
            //   let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //   let option: any = JSON.parse(decodeURIComponent(request.params.option));
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, LayoutModel, { $and: [{ type: 1 }, { namespace: namespace }, { $or: [{ userid: userid }, { userid: builder_userid }] }, query] }, {}, option, function (response, layouts) {
                var _layouts = [];
                _.forEach(layouts, function (layout) {
                    if (layout.content) {
                        layout.content.text = "";
                        layout.content.format = {};
                        _layouts.push(layout);
                    }
                });
                Wrapper.SendSuccess(response, _layouts);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.get_layout_query = function (request, response) {
            var number = 2700;
            var userid = Layout.userid(request);
            var namespace = Layout.namespace(request);
            //    let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //    let option: any = JSON.parse(decodeURIComponent(request.params.option));
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, LayoutModel, { $and: [{ type: 2 }, { namespace: namespace }, { userid: userid }, query] }, {}, option, function (response, layouts) {
                var _layouts = [];
                _.forEach(layouts, function (layout) {
                    if (layout.content) {
                        layout.content.text = "";
                        layout.content.format = {};
                        _layouts.push(layout);
                    }
                });
                Wrapper.SendSuccess(response, _layouts);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.get_template_count = function (request, response) {
            var number = 2800;
            var userid = Layout.userid(request);
            // let query: any = JSON.parse(decodeURIComponent(request.params.query));
            var query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, number, LayoutModel, { $and: [{ type: 1 }, { $or: [{ userid: userid }, { userid: builder_userid }] }, query] }, function (response, count) {
                Wrapper.SendSuccess(response, count);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.get_layout_count = function (request, response) {
            var number = 2900;
            var userid = Layout.userid(request);
            var namespace = "";
            //    let query: any = JSON.parse(decodeURIComponent(request.params.query));
            var query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, number, LayoutModel, { $and: [{ type: 2 }, { namespace: namespace }, { userid: userid }, query] }, function (response, count) {
                Wrapper.SendSuccess(response, count);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.get_template_svg = function (request, response) {
            Layout.get_svg(request, response, 1);
        };
        /**
         * public
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.get_layout_svg = function (request, response) {
            Layout.get_svg(request, response, 2);
        };
        /**
         * @param request
         * @param response
         * @param userid
         * @param name
         * @param layout_type
         * @returns none
         */
        Layout.get_svg = function (request, response, layout_type) {
            var number = 3000;
            var namespace = Layout.namespace(request);
            // layout_type
            //     1   --- system template
            //   other --- own
            var userid = request.params.userid;
            var name = request.params.name;
            var query = { $and: [{ name: name }, { type: layout_type }, { namespace: namespace }, { userid: userid }] };
            switch (layout_type) {
                case 1:
                    query = { $and: [{ name: name }, { type: layout_type }, { namespace: namespace }, { $or: [{ userid: userid }, { userid: builder_userid }] }] };
                    break;
                default:
            }
            Wrapper.FindOne(response, number, LayoutModel, query, function (response, layout) {
                if (layout) {
                    var document_1 = Wrapper.Parse(layout.content.text);
                    var handlers = new ShapeEditModule.EventHandlers();
                    var plugins = new ShapeEditModule.Plugins();
                    var servercanvas = new ServerModule.StubCanvas(document_1.width, document_1.height);
                    var adaptor_1 = new AdaptorModule.SVGAdaptor(document_1.width, document_1.height, false, webfonts);
                    var canvas = new ShapeEditModule.Canvas(servercanvas, null, plugins, adaptor_1, false);
                    ShapeEditModule.Canvas.Load(canvas, document_1, handlers);
                    response.contentType('image/svg+xml');
                    canvas.ToSVG(function (error) {
                        response.send(adaptor_1.Write());
                    });
                }
                else {
                    response.status(404).send("");
                }
            });
        };
        ;
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.layout_svg = function (request, response) {
            //const number: number = 3100;
            var tmp_path = '/tmp/' + request.sessionID;
            var tmp_file = '/noname.svg';
            var layout = request.body.content;
            if (layout) {
                var handlers_1 = new ShapeEditModule.EventHandlers();
                var plugins_1 = new ShapeEditModule.Plugins();
                var document_2 = Wrapper.Parse(layout.content.text);
                var servercanvas_1 = new ServerModule.StubCanvas(document_2.width, document_2.height);
                var original_mask_1 = process.umask(0);
                fs.mkdir(tmp_path, '0777', function () {
                    var adaptor = new AdaptorModule.SVGAdaptor(document_2.width, document_2.height, true, webfonts);
                    var canvas = new ShapeEditModule.Canvas(servercanvas_1, null, plugins_1, adaptor, false);
                    ShapeEditModule.Canvas.Load(canvas, document_2, handlers_1);
                    canvas.ToSVG(function (error) {
                        if (!error) {
                            fs.writeFile(tmp_path + tmp_file, adaptor.Write(), function (error) {
                                process.umask(original_mask_1);
                                Wrapper.SendSuccess(response, {});
                            });
                        }
                        else {
                            process.umask(original_mask_1);
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                });
            }
            else {
                response.status(404).send("");
            }
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.layout_pdf = function (request, response) {
            //const number: number = 3200;
            var tmp_path = '/tmp/' + request.sessionID;
            var tmp_file = '/noname.pdf';
            var layout = request.body.content;
            var format = request.body.content.content.format;
            if (layout) {
                var handlers_2 = new ShapeEditModule.EventHandlers();
                var plugins_2 = new ShapeEditModule.Plugins();
                var document_3 = Wrapper.Parse(layout.content.text);
                var servercanvas_2 = new ServerModule.StubCanvas(document_3.width, document_3.height);
                var original_mask_2 = process.umask(0);
                fs.mkdir(tmp_path, '0777', function () {
                    //{size: 'A4', margin: 0, layout: 'portrait'}
                    var adaptor = new AdaptorModule.PDFAdaptor(tmp_path, format);
                    var canvas = new ShapeEditModule.Canvas(servercanvas_2, null, plugins_2, adaptor, false);
                    ShapeEditModule.Canvas.Load(canvas, document_3, handlers_2);
                    canvas.ToPDF(function (error) {
                        if (!error) {
                            var writer = fs.createWriteStream(tmp_path + tmp_file);
                            doc.pipe(writer);
                            writer.on('finish', function () {
                                process.umask(original_mask_2);
                                Wrapper.SendSuccess(response, {});
                            });
                            doc.end();
                        }
                        else {
                            process.umask(original_mask_2);
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                    var doc = adaptor.Write();
                });
            }
            else {
                response.status(404).send("");
            }
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.download_pdf = function (request, response) {
            var delete_folder_recursive = function (path) {
                fs.readdirSync(path).forEach(function (file) {
                    var curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) {
                        delete_folder_recursive(curPath);
                    }
                    else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };
            var tmp_path = '/tmp/' + request.sessionID;
            var tmp_file = '/noname.pdf';
            response.download(tmp_path + tmp_file, function (error) {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, function (error) {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Layout.prototype.download_svg = function (request, response) {
            var delete_folder_recursive = function (path) {
                fs.readdirSync(path).forEach(function (file) {
                    var curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) {
                        delete_folder_recursive(curPath);
                    }
                    else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };
            var tmp_path = '/tmp/' + request.sessionID;
            var tmp_file = '/noname.svg';
            response.download(tmp_path + tmp_file, function (error) {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, function (error) {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        };
        return Layout;
    }());
    LayoutsModule.Layout = Layout;
})(LayoutsModule = exports.LayoutsModule || (exports.LayoutsModule = {}));
module.exports = LayoutsModule;
//# sourceMappingURL=layouts_controller.js.map