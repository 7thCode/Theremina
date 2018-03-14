/**!
 * Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 * This software is released under the MIT License.
 * //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

namespace App {

    const fs: any = require("graceful-fs");
    const path: any = require("path");
    const express: any = require("express");

    let config_seed: any = undefined;
    let config_seed_file: any = fs.openSync(process.cwd() + "/config/systems/config.json", "r");
    if (config_seed_file) {
        try {
            config_seed = JSON.parse(fs.readFileSync(process.cwd() + "/config/systems/config.json", "utf8"));
        } finally {
            fs.closeSync(config_seed_file);
        }
    }

    if (config_seed) {

        let install: any = () => {
            const app: any = express();
            const router: IRouter = express.Router();

            app.set("views", path.join(__dirname, "views"));
            app.set("view engine", "pug");

            const bodyParser: any = require("body-parser");
            app.use(bodyParser.json({limit: "50mb"}));
            app.use(bodyParser.urlencoded({limit: "50mb", extended: true}));

            app.use(express.static(path.join(__dirname, "public")));

            const core: any = require(process.cwd() + "/gs");
            const share: any = core.share;
            const config: any = share.config;

            app.use("/", require("./server/utility/installer/api"));
            app.use("/", require("./server/utility/installer/pages"));

            // catch 404 and forward to error handler
            app.use((req, res, next): void => {
                let err = new Error('Not Found');
                next(err);
            });

            Serve(config, app);
        };

        let normal = () => {



            // initialize
            const morgan: any = require("morgan");
            morgan.format("original", "[:date] :method :url :status :response-time ms");

            const _ = require("lodash");

            const mongoose: any = require("mongoose");
            mongoose.Promise = global.Promise;

            const favicon: any = require("serve-favicon");

            const cookieParser: any = require("cookie-parser");
            const bodyParser: any = require("body-parser");

            // passport
            const passport: any = require("passport");
            const LocalStrategy: any = require("passport-local").Strategy;
            const FacebookStrategy: any = require("passport-facebook").Strategy;
            const TwitterStrategy: any = require("passport-twitter").Strategy;
            const InstagramStrategy: any = require("passport-instagram").Strategy;
            const LineStrategy: any = require("passport-line").Strategy;
            // const GooglePlusStrategy: any = require('passport-google-plus');
            // passport

            console.log("Hundred");

            const app: any = express();

            // helmet
            const helmet: any = require("helmet");
            app.use(helmet());
            app.use(helmet.hidePoweredBy({setTo: "JSF/1.2"}));  // impersonation
            // helmet
            /*
                    const minifyhtml = require('express-minify-html');
                    app.use(minifyhtml({
                        override:      true,
                        exception_url: false,
                        htmlMinifier: {
                            removeComments:            true,
                            collapseWhitespace:        true,
                            collapseBooleanAttributes: true,
                            removeAttributeQuotes:     true,
                            removeEmptyAttributes:     false,
                            minifyJS:                  false
                        }
                    }));
            */

            const core: any = require(process.cwd() + "/gs");
            const share: any = core.share;
            const config: any = share.config;
            const Cipher: any = share.Cipher;
            const event: any = share.Event;

            if (config.compression) {

                // compression result
                const compression: any = require("compression");
                app.use(compression());
                // compression result

                let minify: any = require("express-minify");
                let uglifyjs: any = require("uglify-es");
                app.use(minify({
                    coffeeScriptMatch: false,
                    sassMatch: false,
                    uglifyJsModule: uglifyjs,
                }));
            }

            // passport
            const session: any = require("express-session");

            if (config.csrfsecret) {
                const csrf: any = require("csurf");
                app.use(session({secret: config.csrfsecret}));
                app.use(csrf({cookie: true}));
                app.use((req, res, next) => {
                    res.locals.csrftoken = req.csrfToken();
                    next();
                });
            }

            // view engine setup
            app.set('views', path.join(__dirname, 'views'));
            app.set('view engine', 'pug');
            // view engine setup

            // result settings
            app.use(bodyParser.json({limit: '50mb'}));
            app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
            app.use(cookieParser());
            // result settings

            const services_config = share.services_config;
            const plugins_config = share.plugins_config;
            const applications_config = share.applications_config;

            const logger = share.logger;

            if (config.status !== 'production') {
                app.use(morgan('original', {immediate: true}));
            } else {
                const rotatestream = require('logrotate-stream');
                app.use(morgan('combined', {
                    stream: rotatestream({
                        file: __dirname + '/logs/access.log',
                        size: '100k',
                        keep: 3
                    })
                }));
            }

            app.use(express.static(path.join(__dirname, 'public')));

            let definition = {account_content: {}};
            fs.open(share.Models('applications/accounts/definition.json'), 'ax+', 384, (error, fd) => {
                if (!error) {
                    fs.close(fd, (error) => {
                        definition = JSON.parse(fs.readFileSync(share.Models('applications/accounts/definition.json'), 'utf-8'));
                    });
                }
            });

            const MongoStore = require('connect-mongo')(session);

            const options = {useMongoClient: true, keepAlive: 1, connectTimeoutMS: 1000000, reconnectTries: 30, reconnectInterval: 2000};

            // const options = {keepAlive: 300000, connectTimeoutMS: 1000000};

            if (config.db.user) {
                mongoose.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name, options)
                    .catch(error => {
                        logger.fatal('catch Mongoose exeption. ', error.stack);
                        process.exit(0);
                    });
            }

            mongoose.connection.on('connected', () => {

                app.use(session({
                    name: config.sessionname,
                    secret: config.sessionsecret,
                    resave: false,
                    rolling: true,
                    saveUninitialized: true,
                    cookie: {
                        maxAge: 365 * 24 * 60 * 60 * 1000
                    },
                    store: new MongoStore({
                        mongooseConnection: mongoose.connection,
                        ttl: 365 * 24 * 60 * 60,
                        clear_interval: 60 * 60
                    })
                }));

                // passport
                app.use(passport.initialize());
                app.use(passport.session());
                // passport

                let load_module: any = (root: string, modules: any): void => {
                    if (modules) {
                        modules.forEach((module) => {
                            let path = root + module.path;
                            let name = module.name;
                            app.use("/" + name, require(path + name + "/api"));
                            app.use("/" + name, require(path + name + "/pages"));
                        });
                    }
                };

                console.log("V1");

                load_module("./server", config.modules);
                load_module("./server", services_config.modules);
                load_module("./server", plugins_config.modules);
                load_module("./server", applications_config.modules);

                console.log("VR");
                // root

                let load_root_module: any = (root: string, modules: any): void => {
                    if (modules) {
                        modules.forEach((module) => {
                            let path = root + module.path;
                            let name = module.name;
                            app.use("/", require(path + name + "/api"));
                            app.use("/", require(path + name + "/pages"));
                        });
                    }
                };

                load_root_module("./server", applications_config.root_modules);

                /*
                if (applications_config.services) {
                    _.forEach(applications_config.services, (service) => {
                        app.use("/", require(service.lib));
                    });
                }
                */

                if (config.db.backup) {
                    share.Scheduler.Add({
                        timing: config.db.backup, name: "backup", job: () => {
                            share.Command.Backup(config.db);
                        }
                    });
                }

                let cache_root = path.join(process.cwd(), "tmp");
                if (config.cache_root) {
                    cache_root = config.cache_root;
                }
                const CacheModule: any = require(share.Server("systems/common/cache/cache"));
                const cache:any = new CacheModule.Cache(cache_root);

                // passport
                const Account: any = core.LocalAccount;
                passport.use(new LocalStrategy(Account.authenticate()));

                passport.serializeUser((user, done): void => {
                    switch (user.provider) {
                        case "facebook":
                        case "twitter":
                        case "instagram":
                        case "googleplus":
                        case "line":
                            let objectid: any = new mongoose.Types.ObjectId; // Create new id
                            user.username = user.id;
                            user.userid = user.id;
                            user.enabled = true;
                            user.passphrase = objectid.toString();
                            user.publickey = Cipher.PublicKey(user.passphrase);
                            user.local = definition.account_content;
                            break;
                        case "local":
                            break;
                        default:
                    }
                    done(null, user);
                });

                passport.deserializeUser((obj, done): void => {
                    done(null, obj);
                });

                if (config.facebook) {
                    passport.use(new FacebookStrategy(config.facebook.key, (accessToken, refreshToken, profile, done): void => {
                            process.nextTick((): void => {
                                done(null, profile);
                            });
                        }
                    ));
                }

                if (config.twitter) {
                    passport.use(new TwitterStrategy(config.twitter.key, (accessToken, refreshToken, profile, done): void => {
                            process.nextTick((): void => {
                                done(null, profile);
                            });
                        }
                    ));
                }

                if (config.instagram) {
                    passport.use(new InstagramStrategy(config.instagram.key, (accessToken, refreshToken, profile, done): void => {
                            process.nextTick((): void => {
                                done(null, profile);
                            });
                        }
                    ));
                }

                if (config.line) {
                    passport.use(new LineStrategy(config.line.key, (accessToken, refreshToken, profile, done): void => {
                            process.nextTick((): void => {
                                done(null, profile);
                            });
                        }
                    ));
                }

                if (config.googleplus) {
                    //          passport.use(new GooglePlusStrategy(config.googleplus.key, (accessToken, refreshToken, profile, done): void => {
                    //                  process.nextTick((): void => {
                    //                      done(null, profile);
                    //                  })
                    //              }
                    //          ));
                }
                // passport

                const auth: any = core.auth;
                auth.create_init_user(config.initusers);
                auth.create_init_user(services_config.initusers);
                auth.create_init_user(plugins_config.initusers);
                auth.create_init_user(applications_config.initusers);

                const file: any = core.file;
                file.create_init_files(config.systems.userid, config.initfiles, (error, result) => {
                    file.create_init_files(config.systems.userid, services_config.initfiles, (error, result) => {
                        file.create_init_files(config.systems.userid, plugins_config.initfiles, (error, result) => {
                            file.create_init_files(config.systems.userid, applications_config.initfiles, (error, result) => {

                            });
                        });
                    });
                });

                const resource: any = core.resource;
                resource.create_init_resources(config.systems.userid, config.initresources, (error, result) => {
                    resource.create_init_resources(config.systems.userid, services_config.initresources, (error, result) => {
                        resource.create_init_resources(config.systems.userid, plugins_config.initresources, (error, result) => {
                            resource.create_init_resources(config.systems.userid, applications_config.initresources, (error, result) => {

                            });
                        });
                    });
                });

                // services
                const FormsController: any = require(share.Server("services/forms/controllers/forms_controller"));
                const form: any = new FormsController.Form();
                form.create_init_forms(applications_config.initforms);
                // services

                // DAV
                // //   if (config.dav) {
                //       let jsDAV = require("cozy-jsdav-fork/lib/jsdav");
                //       let jsDAV_Locks_Backend_FS = require("cozy-jsdav-fork/lib/DAV/plugins/locks/fs");
                //       let jsDAV_Auth_Backend_File = require("cozy-jsdav-fork/lib/DAV/plugins/auth/file");
                //       jsDAV.createServer({
                //           node: path.join(__dirname, 'public'),
                //           locksBackend: jsDAV_Locks_Backend_FS.new(path.join(__dirname, 'public/lock')),
                //           authBackend: jsDAV_Auth_Backend_File.new(path.join(__dirname, 'htdigest')),
                //           realm: "jsdavtest"
                //       }, 8001);
                //       require('cozy-jsdav-fork/lib/CalDAV/plugin');
                //   }
                // DAV

                // Slack Bot
                /*
                 if (config.slack) {
                 const Botkit = require('botkit');

                 const controller = Botkit.slackbot({
                 debug: false
                 });

                 controller.spawn({
                 token: config.slack.token
                 }).startRTM(function (err) {
                 if (err) {
                 throw new Error(err);
                 }
                 });

                 controller.hears('', ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
                 bot.reply(message, 'なーに？');
                 });
                 }
                 */
                // slack Bot

                let server: any = Serve(config, app);
                let Socket: any = require('./server/systems/common/sio');
                let io = new Socket.IO(server);
                io.wait(config, event);

                // mailReceiver
                if (config.receiver) {
                    const MailerModule: any = require('./server/systems/common/mailer');
                    let receiver = new MailerModule.MailReceiver();
                    receiver.connect(config.receiver,
                        (error) => {
                            let a = error;
                        },
                        (message, body): void => {
                            let a = message;
                            let subject = body.subject;
                            let text = body.text;

                            event.emitter.emit('mail', {message: message, body: body});
                        });
                }
                // mailReceiver

                // error handlers
                app.use((req, res, next): void => {
                    let err: any = new Error('Not Found');
                    err.status = 404;
                    next(err);
                });

                if (app.get('env') === 'development') {
                    app.use((err, req, res, next): void => {
                        res.status(err.status || 500);
                        res.render('error', {
                            message: err.message,
                            status: err.status
                        });
                    });
                }

                app.use((err, req, res, next): void => {
                    if (req.xhr) {
                        res.status(500).send(err);
                    } else {
                        res.status(err.status || 500);
                        res.render('error', {
                            message: err.message,
                            error: {}
                        });
                    }
                });
            });

            mongoose.connection.on('error', (error) => {
                logger.fatal('Mongoose default connection error: ' + error);
                process.exit(0);
            });

            mongoose.connection.on('disconnected', () => {
                logger.fatal('Mongoose default connection disconnected');
                process.exit(0);
            });

            event.emitter.on('socket', (data): void => {

            });

            event.emitter.on('mail', (mail): void => {
                //       let a = mail;
            });

            process.on('SIGINT', (): void => { // for pm2 cluster.
                mongoose.connection.close(() => {
                    logger.info('Stop by SIGINT.');
                    process.exit(0);
                });
            });

            process.on('message', (msg): void => {  // for pm2 cluster on windows.
                if (msg == 'shutdown') {
                    logger.info('Stop by shutdown.');
                    setTimeout(function () {
                        process.exit(0);
                    }, 1500);
                }
            });
        };

        let maintenance: any = () => {

            const app: any = express();
            const router: IRouter = express.Router();

            app.set('views', path.join(__dirname, 'views'));
            app.set('view engine', 'pug');

            const bodyParser = require('body-parser');
            app.use(bodyParser.json({limit: '50mb'}));
            app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

            app.use(express.static(path.join(__dirname, 'public')));


            const core = require(process.cwd() + '/gs');
            const share: any = core.share;
            const config: any = share.config;

            app.use("/", require("./server/utility/maintenance/api"));
            app.use("/", require("./server/utility/maintenance/pages"));

            // catch 404 and forward to error handler
            app.use((req, res, next): void => {
                let err = new Error('Not Found');
                next(err);
            });

            Serve(config, app);

        };

        switch (config_seed.mode) {
            case 0:
                install();
                break;
            case  1:
                normal();
                break;
            case  2:
                maintenance();
                break;
            default:
        }
    }

    function Serve(config, app: any): any {
        let debug = require('debug')('a:server');
        let http = require('http');

        let port = normalizePort(process.env.PORT || config.port);
        app.set('port', port);

        let server = http.createServer(app);

        function normalizePort(val) {
            let port = parseInt(val, 10);

            if (isNaN(port)) {
                // named pipe
                return val;
            }

            if (port >= 0) {
                // port number
                return port;
            }

            return false;
        }

        function onError(error) {
            if (error.syscall !== 'listen') {
                throw error;
            }

            let bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

            switch (error.code) {
                case 'EACCES':
                    console.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        function onListening() {
            let addr = server.address();
            let bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
            debug('Listening on ' + bind);

            process.send = process.send || function () {
            };  // for pm2 cluster.
            process.send('ready');
        }

        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);

        console.log("V2");

        return server;
    }

}