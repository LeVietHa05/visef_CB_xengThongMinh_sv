const option = {
    allowEIO3: true,
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"],
        credentials: true,
    },
}

const io = require("socket.io")(option);

const socketapi = {
    io: io
}

let deviceStatus = "offline";
io.on("connection", (socket) => {
    let deviceID = "";
    lastPong = Date.now();
    console.log("[INFO] new connection: [" + socket.id + "]");
    socket.on("message", (data) => {
        deviceID = data.deviceID ? data.deviceID : "web";
        if (deviceID == "esp32") deviceStatus = "online";
        console.log(`message from ${data.deviceID ? data.deviceID : 'web'} via socket id: ${socket.id} on topic message`);
        socket.broadcast.emit("message", data);
    });

    socket.on("/web/control", (data) => {
        deviceID = data.deviceID ? data.deviceID : "web";
        console.log(`message from ${data.deviceID ? data.deviceID : 'web'} via socket id: ${socket.id} on topic /web/modeChange`);
        //data will be 2, 3, 4 meaning there will be 3 buttons
        socket.broadcast.emit("/esp/control", data);
    })

    socket.on("/esp/control", (data) => {
        deviceID = data.deviceID ? data.deviceID : "web";
        if (deviceID == "esp32") deviceStatus = "online";
        console.log(`message from ${data.deviceID ? data.deviceID : 'web'} via socket id: ${socket.id} on topic /esp/control`);
        socket.broadcast.emit("/web/control", data);
    })

    socket.on("/esp/measure", (data) => {
        deviceID = data.deviceID ? data.deviceID : "web";
        if (deviceID == "esp32") deviceStatus = "online";
        console.log(`message from ${data.deviceID ? data.deviceID : 'web'} via socket id: ${socket.id} on topic /es/measure`)
        socket.broadcast.emit("/web/measure", data);
    })

    //     socket.on("/esp/pong", (data) => {
    //         lastPong = Date.now();
    //     })
    // 
    //     setInterval(() => {
    //         if (Date.now - lastPong > 5000 && deviceID == "esp32") {
    //             console.log("[" + socket.id + "] is offline");
    //             deviceStatus = "offline";
    //         }
    //         socket.broadcast.emit("deviceStatus", deviceStatus);
    //     }, 1000)
    /**************************** */
    //xu ly chung
    socket.on("reconnect", function () {
        console.log("[" + socket.id + "] reconnect.");
    });
    socket.on("disconnect", () => {
        console.log("[" + socket.id + "] disconnect.");
        socket.broadcast.emit("deviceStatus", "offline");
    });
    socket.on("connect_error", (err) => {
        console.log(err.stack);
    });
})
module.exports = socketapi;