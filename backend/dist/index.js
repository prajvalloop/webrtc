"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserManager_1 = require("./managers/UserManager");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});
const userManager = new UserManager_1.UserManager();
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on("user", ({ name }) => {
        userManager.addUser(name, socket);
    });
});
app.get('/', (req, res) => {
    console.log("hello");
    return res.json({ msg: 'hello' });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});
