"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLOBAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        console.log("creating room");
        const roomId = this.generate();
        this.rooms.set(roomId.toString(), {
            user1, user2
        });
        user1.socket.emit("send-offer", {
            roomId: roomId.toString()
        });
        user2.socket.emit("send-offer", {
            roomId: roomId.toString()
        });
    }
    onOffer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        // const user2=this.rooms.get(roomId)?.user2
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", {
            sdp,
            roomId
        });
    }
    onAnswer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("answer", {
            sdp,
            roomId
        });
    }
    onIceCandidates(roomId, senderSocketid, candidate, type) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.emit("add-ice-candidate", ({ candidate }));
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;
