import { RoomManager } from './RoomManager';
import { Socket } from "socket.io";

export interface User{
    name:string,
    socket:Socket
}
export class UserManager{
    private users:User[]
    private queue:string[]
    private roomManager:RoomManager
    constructor(){
        this.users=[]
        this.queue=[]
        this.roomManager=new RoomManager()
    }
    addUser(name:string,socket:Socket){
        this.users.push({name:name,socket:socket})
        this.queue.push(socket.id)
        socket.emit("lobby")
        this.clearQueue()
        this.initHandlers(socket)
    }

    removeUser(socketId:string){
        this.users=this.users.filter(x=>x.socket.id!==socketId)
    }
    clearQueue(){
        if(this.queue.length<2){
            return 
        }
        const id1=this.queue.pop()
        const id2=this.queue.pop()
        const user1=this.users.find((x)=>{
            return x.socket.id===id1
        })
        const user2=this.users.find((x)=>{
            return x.socket.id===id2
        })
        console.log("user1--->",user1)
        console.log("user2--->",user2)
        if(!user1 || !user2) return
        const room=this.roomManager.createRoom(user1,user2)
            
    }
    initHandlers(socket:Socket){
        socket.on("offer",({sdp,roomId}:{sdp:string,roomId:string})=>{
            this.roomManager.onOffer(roomId,sdp,socket.id)
        })
        socket.on("answer",({sdp,roomId}:{sdp:string,roomId:string})=>{
            this.roomManager.onAnswer(roomId,sdp,socket.id)
        })
        socket.on("add-ice-candidate",({candidate,roomId,type})=>{
            this.roomManager.onIceCandidates(roomId,socket.id,candidate,type)
        })
    }

}