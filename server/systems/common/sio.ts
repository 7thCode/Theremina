/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace Socket {

    // Socket.IO
    const socketio = require('socket.io');
    const _ = require("lodash");

    export class IO {

        public sio:any = null;
        public socket:any = null;
        public clients = [];

        constructor(server) {
            this.sio = socketio.listen(server);
        }

        public wait(event):void {

            this.sio.sockets.on('connection', (socket) => {

                this.socket = socket;

                _.forEach(this.sio.sockets.connected, (client: any, id: string): void => {
                    this.clients.push(client);
                });

                socket.on('server', (data) => {

                    event.emitter.emit('socket',data);

                    // all client except self
                    // socket.broadcast.emit('client', {value: data.value});

                    // callback
                    this.sio.sockets.connected[socket.id].emit('client', {value: socket.id});
                });

                socket.on("disconnect", () => {
                    this.socket = null;
                });
            });

        }
    }

//function sio_emitter() {
//    var emitter = require('socket.io-emitter')("localhost:6379");

//    emitter.of('/chat').to(socketId).emit('other_process', 'private message');

//}

}

module.exports = Socket;
