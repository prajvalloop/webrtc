import { UserManager } from './managers/UserManager';
import express from 'express'
import http from 'http'
import { Socket } from 'socket.io';
const app=express()
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
    cors:{
        origin:"*"
    }
});


const userManager=new UserManager()
io.on('connection', (socket:Socket) => {
  console.log('a user connected');
    socket.on("user",({name}:{name:string})=>{
        userManager.addUser(name,socket)
    })
});

app.get('/',(req:any,res:any)=>{
    console.log("hello")
    return res.json({msg:'hello'})
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});