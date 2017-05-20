/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

'use strict';

const fs: any = require('graceful-fs');
const path: any = require('path');
const express: any = require('express');

let config_seed = null;
let config_seed_file = fs.openSync(process.cwd() + "/config/systems/config.json", 'r');
if (config_seed_file) {
    try {
        config_seed = JSON.parse(fs.readFileSync(process.cwd() + "/config/systems/config.json", 'utf8'));
    } finally {
        fs.closeSync(config_seed_file);
    }
}

if (config_seed) {

    let install = () => {
        const app = express();
        const router = express.Router();

        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');

        const bodyParser = require('body-parser');
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

        app.use(express.static(path.join(__dirname, 'public')));

        const core = require(process.cwd() + '/core');
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
        const morgan = require('morgan');
        morgan.format("original", "[:date] :method :url :status :response-time ms");

        const compression = require('compression');

        const Q: any = require('q');
        const _ = require("lodash");

        const mongoose: any = require("mongoose");
        mongoose.Promise = Q.Promise;

        const favicon = require('serve-favicon');

        const cookieParser = require('cookie-parser');
        const bodyParser = require('body-parser');

        // passport
        const passport: any = require('passport');
        const LocalStrategy: any = require('passport-local').Strategy;
        const FacebookStrategy: any = require('passport-facebook').Strategy;
        const TwitterStrategy: any = require('passport-twitter').Strategy;
        const InstagramStrategy: any = require('passport-instagram').Strategy;
        const LineStrategy: any = require('passport-line').Strategy;
        //const GooglePlusStrategy: any = require('passport-google-plus');
        // passport

        const app = express();

        // helmet
        const helmet = require('helmet');
        app.use(helmet());
        app.use(helmet.hidePoweredBy({setTo: 'JSF/1.2'})); // Impersonation
        // helmet

        // compression result
        app.use(compression());
        // compression result

        //passport
        const session = require('express-session');

        // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');
        // view engine setup

        // result settings
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
        app.use(cookieParser());
        // result settings

        const core = require(process.cwd() + '/core');
        const share: any = core.share;
        const config: any = share.config;
        const Cipher: any = share.Cipher;
        const event: any = share.Event;

        const services_config = share.services_config;
        const plugins_config = share.plugins_config;
        const applications_config = share.applications_config;

        const logger = share.logger;

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

        const options = {server: {socketOptions: {connectTimeoutMS: 1000000}}};

        if (config.db.user) {
            mongoose.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name, options);
        } else {
            mongoose.connect("mongodb://" + config.db.address + "/" + config.db.name, options);
        }

        process.on('uncaughtException', (error: any): void => {
            console.log(error);
            logger.error('Stop.   ' + error);
        });

        process.on('exit', (code: number): void => {
            logger.info('Stop.   ' + code);
        });

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

        //passport
        app.use(passport.initialize());
        app.use(passport.session());
        //passport

        let load_module_sync = (root) => {
            try {
                let list = fs.readdirSync(root);
                if (list) {
                    _.forEach(list, (name) => {
                        let stat = fs.lstatSync(root + name);
                        if (stat.isDirectory()) {
                            if (name != "common") {
                                if (name != "front") {
                                    if (name.substr(1,1) != "_") {
                                        try {
                                            app.use("/" + name, require(root + name + "/api"));
                                            app.use("/" + name, require(root + name + "/pages"));
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            } catch (e) {
                console.log(e);
            }
        };

        load_module_sync("./server/systems/");
        load_module_sync("./server/services/");
        load_module_sync("./server/plugins/");
        load_module_sync("./server/applications/");

        // root
        if (applications_config.services) {
            _.forEach(applications_config.services, (service) => {
                app.use("/", require(service.lib));
            });
        }

        if (config.db.backup) {
            share.Scheduler.Add({
                timing: config.db.backup, name: "backup", job: () => {
                    share.Command.Backup(config.db);
                }
            });
        }

        if (process.env.NODE_ENV !== 'production') {
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

        // passport
        const Account = core.LocalAccount;
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
                    })
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
        auth.create_init_user();
        //auth.create_init_page();

        const file: any = core.file;
        file.create_init_files();

        const resource: any = core.resource;
        resource.create_init_resources(config.initresources);
        resource.create_init_resources(services_config.initresources);
        resource.create_init_resources(plugins_config.initresources);
        resource.create_init_resources(applications_config.initresources);

        // DAV
        if (config.dav) {
            let jsDAV = require("cozy-jsdav-fork/lib/jsdav");
            let jsDAV_Locks_Backend_FS = require("cozy-jsdav-fork/lib/DAV/plugins/locks/fs");
            let jsDAV_Auth_Backend_File = require("cozy-jsdav-fork/lib/DAV/plugins/auth/file");
            jsDAV.createServer({
                node: path.join(__dirname, 'public'),
                locksBackend: jsDAV_Locks_Backend_FS.new(path.join(__dirname, 'public/lock')),
                authBackend: jsDAV_Auth_Backend_File.new(path.join(__dirname, 'htdigest')),
                realm: "jsdavtest"
            }, 8001);
            require('cozy-jsdav-fork/lib/CalDAV/plugin');
        }
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
        // Slack Bot

        event.emitter.on('mail', (mail) => {
            //       let a = mail;
        });

        // MailReceiver
        if (config.receiver) {
            const MailerModule: any = require('./server/systems/common/mailer');
            let receiver = new MailerModule.MailReceiver();
            receiver.connect(config.receiver,
                (error) => {
                    let a = error;
                },
                (message, body) => {
                    let a = message;
                    let subject = body.subject;
                    let text = body.text;

                    event.emitter.emit('mail', {message: message, body: body});
                });
        }
        // MailReceiver

        // error handlers
        app.use((req, res, next): void => {
            let err = new Error('Not Found');
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
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });

        event.emitter.on('socket', (data) => {

        });

        let server = Serve(config, app);
        let Socket = require('./server/systems/common/sio');
        let io = new Socket.IO(server);
        io.wait(config, event);

        //   event.emitter.on('auth', (param) => {
        //      io.emit(param);
        //  });

    };

    let maintenance = () => {

        const app = express();
        const router = express.Router();

        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');

        const bodyParser = require('body-parser');
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

        app.use(express.static(path.join(__dirname, 'public')));


        const core = require(process.cwd() + '/core');
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

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

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
    }

    return server;
}