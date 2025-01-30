"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");
class UserManager {
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager_1.RoomManager();
    }
    addUser(name, socket) {
        this.users.push({ name: name, socket: socket });
        this.queue.push(socket.id);
        socket.emit("lobby");
        this.clearQueue();
        this.initHandlers(socket);
    }
    removeUser(socketId) {
        this.users = this.users.filter(x => x.socket.id !== socketId);
    }
    clearQueue() {
        if (this.queue.length < 2) {
            return;
        }
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        const user1 = this.users.find((x) => {
            return x.socket.id === id1;
        });
        const user2 = this.users.find((x) => {
            return x.socket.id === id2;
        });
        console.log("user1--->", user1);
        console.log("user2--->", user2);
        if (!user1 || !user2)
            return;
        const room = this.roomManager.createRoom(user1, user2);
    }
    initHandlers(socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        });
        socket.on("answer", ({ sdp, roomId }) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        });
        socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });
    }
}
exports.UserManager = UserManager;
