/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Socket;
(function (Socket) {
    // Socket.IO
    const socketio = require('socket.io');
    const _ = require("lodash");
    class IO {
        constructor(server) {
            this.sio = null;
            this.socket = null;
            this.clients = [];
            this.sio = socketio.listen(server);
        }
        wait(event) {
            this.sio.sockets.on('connection', (socket) => {
                this.socket = socket;
                _.forEach(this.sio.sockets.connected, (client, id) => {
                    this.clients.push(client);
                });
                socket.on('server', (data) => {
                    event.emitter.emit('socket', data);
                    // all client except self
                    // socket.broadcast.emit('client', {value: data.value});
                    // callback
                    this.sio.sockets.connected[socket.id].emit('client', { value: socket.id });
                });
                socket.on("disconnect", () => {
                    this.socket = null;
                });
            });
        }
    }
    Socket.IO = IO;
    //function sio_emitter() {
    //    var emitter = require('socket.io-emitter')("localhost:6379");
    //    emitter.of('/chat').to(socketId).emit('other_process', 'private message');
    //}
})(Socket = exports.Socket || (exports.Socket = {}));
module.exports = Socket;
//# sourceMappingURL=sio.js.map