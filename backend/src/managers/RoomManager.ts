import { User } from './UserManager';
let GLOBAL_ROOM_ID=1
interface Room
{
    user1:User,
    user2:User
}
export class RoomManager{
    private rooms:Map<string,Room>
    constructor(){
        this.rooms=new Map<string,Room>()
    }
    createRoom(user1:User,user2:User){
        console.log("creating room")
        const roomId=this.generate()
        this.rooms.set(roomId.toString(),{
            user1,user2
        })
        user1.socket.emit("send-offer",{
            
            roomId:roomId.toString()
        })
        user2.socket.emit("send-offer",{
            
            roomId:roomId.toString()
        })

    }
    onOffer(roomId:string,sdp:string,senderSocketid:string){
        const room=this.rooms.get(roomId)
        if(!room) return 
        const receivingUser=room.user1.socket.id===senderSocketid?room.user2:room.user1
        // const user2=this.rooms.get(roomId)?.user2
        
        receivingUser?.socket.emit("offer",{
            sdp,
            roomId
        })
        
    }
    onAnswer(roomId:string,sdp:string,senderSocketid:string){
        const room=this.rooms.get(roomId)
        if(!room) return 

        const receivingUser=room.user1.socket.id===senderSocketid?room.user2:room.user1
        receivingUser?.socket.emit("answer",{
            sdp,
            roomId
        })
        
    }
    onIceCandidates(roomId:string,senderSocketid:string,candidate:any,type:"sender"| "receiver"){
        const room=this.rooms.get(roomId)
        if(!room) return 
        const receivingUser=room.user1.socket.id===senderSocketid?room.user2:room.user1
        receivingUser.socket.emit("add-ice-candidate",({candidate}))
    }
    generate(){
        return GLOBAL_ROOM_ID++
    }
}