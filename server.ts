// tcp (transfer)
/*
 let transfer_port:number = 3000;

 let tcp = require('net');

 let server: any = tcp.createServer((conn: any): void => {

 conn.on('data', (data: any): void => {
 console.log("" + data);
 conn.write('server -> Repeating: ' + data);
 });

 conn.on('close', (): void => {

 });

 }).listen(transfer_port);

 */



// udp (handshake)

let os = require('os');

let udp = require("dgram");

let directory = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

let handshake_receive_port: number = 41234;

let init = () => {
    let interfaces = os.networkInterfaces();
    for (let dev in interfaces) {
        interfaces[dev].forEach((details) => {
            if (!details.internal) {
                switch (details.family) {
                    case "IPv4":
                        directory[details.address.split(".")[3] * 1] = 1;
                        break;
                    case "IPv6":
                        break;
                }
            }
        });
    }
};

let poll = () => {
    let handshake_callback_port: number = 1234;
    let local_network = "255.255.255.255";
    let poller = udp.createSocket("udp4");
    let message = new Buffer("HANDSHAKE");

    poller.on("error", (error: any): void => {
        poller.close();
    });

    poller.on("message", (buffer: any, rinfo: any): void => {
        directory = JSON.parse(buffer);


  //      console.log("Resp " + JSON.stringify(directory));


        poller.close();
    });

    poller.bind(handshake_callback_port, (): void => {
        poller.setBroadcast(true);
        poller.send(message, 0, message.length, handshake_receive_port, local_network, (error: any): void => {
        });
    });
};

let select = () => {

    let selector = udp.createSocket("udp4");

    selector.on("error", (error: any): void => {
        selector.close();
    });

    selector.on("message", (message: string, rinfo: any): void => {

        if (message == "HANDSHAKE") {
            directory[rinfo.address.split(".")[3] * 1] = 1;


   //         console.log("Recv " + JSON.stringify(directory));


            let buffer = JSON.stringify(directory);
            selector.send(buffer, 0, buffer.length, rinfo.port, rinfo.address, (error: any): void => {
            });
        }
    });

    selector.bind(handshake_receive_port);
};


init();

poll();

select();