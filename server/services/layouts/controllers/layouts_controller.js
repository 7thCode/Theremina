/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LayoutsModule;
(function (LayoutsModule) {
    const fs = require('graceful-fs');
    const _ = require('lodash');
    const mongoose = require('mongoose');
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;
    const ShapeEditModule = core.ShapeEditModule;
    const ServerModule = core.ServerModule;
    const AdaptorModule = core.AdaptorModule;
    const services_config = share.services_config;
    const LayoutModel = require(share.Models("/services/layouts/layout"));
    const builder_userid = config.systems.userid; // template maker user id
    const webfonts = services_config.webfonts;
    class Layout {
        constructor() {
        }
        /**
         * @param request
         * @returns userid
         */
        static userid(request) {
            return request.user.userid;
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        create_template(request, response) {
            Layout.create(request, response, 1);
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        create_layout(request, response) {
            Layout.create(request, response, 2);
        }
        /**
         * @param request
         * @param response
         * @param layout_type
         * @returns none。
         *
         * nameがキー
         */
        static create(request, response, layout_type) {
            const number = 2000;
            let userid = Layout.userid(request);
            let name = request.body.name;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, LayoutModel, { $and: [{ name: name }, { type: layout_type }, { userid: userid }] }, (response, exists) => {
                        if (!exists) {
                            let layout = new LayoutModel();
                            layout.userid = userid;
                            layout.name = name;
                            layout.content = request.body.content;
                            layout.open = true;
                            layout.type = layout_type;
                            Wrapper.Save(response, number, layout, (response, object) => {
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
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        put_template(request, response) {
            Layout.put(request, response, 1);
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        put_layout(request, response) {
            Layout.put(request, response, 2);
        }
        /**
         * @param request
         * @param response
         * @param layout_type
         * @returns none
         *
         * nameが同じレイアウトがなければ新規。
         * あれば更新。
         */
        static put(request, response, layout_type) {
            const number = 2000;
            let userid = Layout.userid(request);
            let name = request.body.name;
            if (name) {
                Wrapper.FindOne(response, number, LayoutModel, { $and: [{ name: name }, { type: layout_type }, { userid: userid }] }, (response, exists) => {
                    if (!exists) {
                        let layout = new LayoutModel();
                        layout.userid = userid;
                        layout.name = name;
                        layout.content = request.body.content;
                        layout.open = true;
                        layout.type = layout_type;
                        Wrapper.Save(response, number, layout, (response, object) => {
                            Wrapper.SendSuccess(response, object);
                        });
                    }
                    else {
                        let id = request.params.id;
                        Wrapper.FindOne(response, number, LayoutModel, { $and: [{ _id: id }, { type: layout_type }, { userid: userid }] }, (response, layout) => {
                            if (layout) {
                                layout.content = request.body.content;
                                layout.open = true;
                                layout.type = layout_type;
                                Wrapper.Save(response, number, layout, (response, object) => {
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
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        delete_template(request, response) {
            Layout.delete(request, response, 1);
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        delete_layout(request, response) {
            Layout.delete(request, response, 2);
        }
        /**
         * @param request
         * @param response
         * @param layout_type
         * @returns none
         */
        static delete(request, response, layout_type) {
            const number = 2200;
            let userid = Layout.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, LayoutModel, { $and: [{ _id: id }, { type: layout_type }, { userid: userid }] }, (response, layout) => {
                if (layout) {
                    Wrapper.Remove(response, number, layout, (response) => {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        delete_own(request, response) {
            const number = 2300;
            let userid = Layout.userid(request);
            Wrapper.Delete(response, number, LayoutModel, { userid: userid }, (response) => {
                Wrapper.SendSuccess(response, {});
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_template(request, response) {
            const number = 2400;
            let userid = Layout.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, LayoutModel, { $and: [{ _id: id }, { type: 1 }, { $or: [{ userid: userid }, { userid: builder_userid }] }] }, (response, layout) => {
                if (layout) {
                    Wrapper.SendSuccess(response, layout);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_layout(request, response) {
            const number = 2500;
            let userid = Layout.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, LayoutModel, { $and: [{ _id: id }, { type: 2 }, { userid: userid }] }, (response, layout) => {
                if (layout) {
                    Wrapper.SendSuccess(response, layout);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_template_query(request, response) {
            const number = 2600;
            let userid = Layout.userid(request);
            //   let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //   let option: any = JSON.parse(decodeURIComponent(request.params.option));
            let query = Wrapper.Decode(request.params.query);
            let option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, LayoutModel, { $and: [{ type: 1 }, { $or: [{ userid: userid }, { userid: builder_userid }] }, query] }, {}, option, (response, layouts) => {
                let _layouts = [];
                _.forEach(layouts, (layout) => {
                    if (layout.content) {
                        layout.content.text = "";
                        layout.content.format = {};
                        _layouts.push(layout);
                    }
                });
                Wrapper.SendSuccess(response, _layouts);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_layout_query(request, response) {
            const number = 2700;
            let userid = Layout.userid(request);
            //    let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //    let option: any = JSON.parse(decodeURIComponent(request.params.option));
            let query = Wrapper.Decode(request.params.query);
            let option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, LayoutModel, { $and: [{ type: 2 }, { userid: userid }, query] }, {}, option, (response, layouts) => {
                let _layouts = [];
                _.forEach(layouts, (layout) => {
                    if (layout.content) {
                        layout.content.text = "";
                        layout.content.format = {};
                        _layouts.push(layout);
                    }
                });
                Wrapper.SendSuccess(response, _layouts);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_template_count(request, response) {
            const number = 2800;
            let userid = Layout.userid(request);
            // let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, number, LayoutModel, { $and: [{ type: 1 }, { $or: [{ userid: userid }, { userid: builder_userid }] }, query] }, (response, count) => {
                Wrapper.SendSuccess(response, count);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_layout_count(request, response) {
            const number = 2900;
            let userid = Layout.userid(request);
            //    let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, number, LayoutModel, { $and: [{ type: 2 }, { userid: userid }, query] }, (response, count) => {
                Wrapper.SendSuccess(response, count);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_template_svg(request, response) {
            let userid = Layout.userid(request);
            let name = request.params.name;
            Layout.get_svg(request, response, userid, name, 1);
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_layout_svg(request, response) {
            let userid = Layout.userid(request);
            let name = request.params.name;
            Layout.get_svg(request, response, userid, name, 2);
        }
        /**
         * @param request
         * @param response
         * @param userid
         * @param name
         * @param layout_type
         * @returns none
         */
        static get_svg(request, response, userid, name, layout_type) {
            const number = 3000;
            // layout_type
            //     1   --- system template
            //   other --- own
            let query = { $and: [{ name: name }, { type: layout_type }, { userid: userid }] };
            switch (layout_type) {
                case 1:
                    query = { $and: [{ name: name }, { type: layout_type }, { $or: [{ userid: userid }, { userid: builder_userid }] }] };
                    break;
                default:
            }
            Wrapper.FindOne(response, number, LayoutModel, query, (response, layout) => {
                if (layout) {
                    let document = Wrapper.Parse(layout.content.text);
                    let handlers = new ShapeEditModule.EventHandlers();
                    let plugins = new ShapeEditModule.Plugins();
                    let servercanvas = new ServerModule.StubCanvas(document.width, document.height);
                    let adaptor = new AdaptorModule.SVGAdaptor(document.width, document.height, false, webfonts);
                    let canvas = new ShapeEditModule.Canvas(servercanvas, null, plugins, adaptor, false);
                    ShapeEditModule.Canvas.Load(canvas, document, handlers);
                    response.contentType('image/svg+xml');
                    canvas.ToSVG((error) => {
                        response.send(adaptor.Write());
                    });
                }
                else {
                    response.status(404).send("");
                }
            });
        }
        ;
        /**
         * @param request
         * @param response
         * @returns none
         */
        layout_svg(request, response) {
            //const number: number = 3100;
            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/noname.svg';
            let layout = request.body.content;
            if (layout) {
                let handlers = new ShapeEditModule.EventHandlers();
                let plugins = new ShapeEditModule.Plugins();
                let document = Wrapper.Parse(layout.content.text);
                let servercanvas = new ServerModule.StubCanvas(document.width, document.height);
                let original_mask = process.umask(0);
                fs.mkdir(tmp_path, '0777', () => {
                    let adaptor = new AdaptorModule.SVGAdaptor(document.width, document.height, true, webfonts);
                    let canvas = new ShapeEditModule.Canvas(servercanvas, null, plugins, adaptor, false);
                    ShapeEditModule.Canvas.Load(canvas, document, handlers);
                    canvas.ToSVG((error) => {
                        if (!error) {
                            fs.writeFile(tmp_path + tmp_file, adaptor.Write(), (error) => {
                                process.umask(original_mask);
                                Wrapper.SendSuccess(response, {});
                            });
                        }
                        else {
                            process.umask(original_mask);
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                });
            }
            else {
                response.status(404).send("");
            }
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        layout_pdf(request, response) {
            //const number: number = 3200;
            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/noname.pdf';
            let layout = request.body.content;
            let format = request.body.content.content.format;
            if (layout) {
                let handlers = new ShapeEditModule.EventHandlers();
                let plugins = new ShapeEditModule.Plugins();
                let document = Wrapper.Parse(layout.content.text);
                let servercanvas = new ServerModule.StubCanvas(document.width, document.height);
                let original_mask = process.umask(0);
                fs.mkdir(tmp_path, '0777', () => {
                    //{size: 'A4', margin: 0, layout: 'portrait'}
                    let adaptor = new AdaptorModule.PDFAdaptor(tmp_path, format);
                    let canvas = new ShapeEditModule.Canvas(servercanvas, null, plugins, adaptor, false);
                    ShapeEditModule.Canvas.Load(canvas, document, handlers);
                    canvas.ToPDF((error) => {
                        if (!error) {
                            let writer = fs.createWriteStream(tmp_path + tmp_file);
                            doc.pipe(writer);
                            writer.on('finish', () => {
                                process.umask(original_mask);
                                Wrapper.SendSuccess(response, {});
                            });
                            doc.end();
                        }
                        else {
                            process.umask(original_mask);
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                    let doc = adaptor.Write();
                });
            }
            else {
                response.status(404).send("");
            }
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        download_pdf(request, response) {
            let delete_folder_recursive = function (path) {
                fs.readdirSync(path).forEach(function (file) {
                    let curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) {
                        delete_folder_recursive(curPath);
                    }
                    else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };
            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/noname.pdf';
            response.download(tmp_path + tmp_file, (error) => {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, (error) => {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        download_svg(request, response) {
            let delete_folder_recursive = function (path) {
                fs.readdirSync(path).forEach(function (file) {
                    let curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) {
                        delete_folder_recursive(curPath);
                    }
                    else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };
            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/noname.svg';
            response.download(tmp_path + tmp_file, (error) => {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, (error) => {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        }
    }
    LayoutsModule.Layout = Layout;
})(LayoutsModule = exports.LayoutsModule || (exports.LayoutsModule = {}));
module.exports = LayoutsModule;
//# sourceMappingURL=layouts_controller.js.map