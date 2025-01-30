import React, { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'


const URL="http://localhost:3000"
const Room = ({name,localAudioTrack,localVideoTrack}: {name:string | null,localAudioTrack:MediaStreamTrack | null,localVideoTrack:MediaStreamTrack | null}) => {
    const [searchParams,setSearchParams] =useSearchParams()
    // const name=searchParams.get('name')
    const [lobby,setLobby]=useState<boolean | null>(null)
    const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
    const [remoteVideoTrack,setRemoteVideoTrack]=useState<MediaStreamTrack | null>(null)
    const [remoteAudioTrack,setRemoteAudioTrack]=useState<MediaStreamTrack | null>(null)
    const [remoteMediaStream , setRemoteMediaStream]=useState<MediaStream | null> (null)
    const remoteVideoRef=useRef<HTMLVideoElement | null>(null)
    const localVideoRef=useRef<HTMLVideoElement | null>(null)
    useEffect(()=>{
        console.log("hello call")
        const socket=io(URL)
        socket.emit("user",{name:name})
        socket.on("lobby",()=>{
            setLobby(true)
        })
        socket.on('send-offer',async({roomId})=>{
            setLobby(false)
            // alert("send offer please")
            const pc=new RTCPeerConnection()
            setSendingPc(pc)
            if(localAudioTrack) pc.addTrack(localAudioTrack)
            if(localVideoTrack) pc.addTrack(localVideoTrack)
            pc.onicecandidate=async(e)=>{
                console.log("candiates--->",e.candidate)
                if(e.candidate) {
                    socket.emit("add-ice-candidate",{
                        candidate:e.candidate,
                        type:"sender",
                        roomId
                    })
                }
            }
            pc.onnegotiationneeded=async()=>{
                const sdp=await pc.createOffer()
                //@ts-ignore
                console.error("firreeeeee")
                pc.setLocalDescription(sdp)
                socket.emit("offer",{roomId,sdp:sdp})
            }
           
            
        })
        
        socket.on("offer", async ({ roomId, sdp }) => {
            setLobby(false);
          
            // 1) Create the PeerConnection and install event listeners first
            const pc = new RTCPeerConnection();
          
            // Give yourself a place for incoming media
            const inboundStream = new MediaStream();
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = inboundStream;
            }
          
            
          
            // For ICE candidates
            pc.onicecandidate = (e) => {
              console.log("Candidate →", e.candidate);
              if (e.candidate) {
                socket.emit("add-ice-candidate", {
                  candidate: e.candidate,
                  type: "receiver",
                  roomId,
                });
              }
            };
            pc.ontrack = (event) => {
                // event.track.kind will tell you if it's audio or video
                console.log("Received track:", event.track.kind);
            
                // If you want to add the single track:
                inboundStream.addTrack(event.track);
            
                // Or, if you prefer, you can do:
                // event.streams[0].getTracks().forEach((t) => inboundStream.addTrack(t));
            
                remoteVideoRef.current?.play();
              };
          
            // 2) Now set the remote description from the offer
            await pc.setRemoteDescription(sdp);
          
            // 3) Create your answer and set local description
            const localAnswer = await pc.createAnswer();
            await pc.setLocalDescription(localAnswer);
            
            // 4) Finally, send the answer back to the offerer
            socket.emit("answer", { roomId, sdp: localAnswer });
          
            // Keep references if you need them
            setRemoteMediaStream(inboundStream);
            setReceivingPc(pc);
          });
          
        socket.on("answer",({roomId,sdp})=>{
            setLobby(false)
            console.log("your answer")
            setSendingPc((pc)=>{
                if(pc){
                    pc.setRemoteDescription(sdp)
                }
                return pc
            })
            // alert("Heres is your answer")

            console.log(`roomId--->${roomId} sdp--------->${sdp}`)
        })
        socket.on("add-ice-candidate",({candidate,type})=>{
            if(type==="sender"){
                setReceivingPc(pc=>{
                    pc?.addIceCandidate(candidate)
                    return pc
                })
            }   
            else{
                setSendingPc(pc=>{
                    pc?.addIceCandidate(candidate)
                    return pc
                })
            }
        })
    },[name])
    useEffect(()=>{
        console.log("call")
        if(localVideoRef.current && localVideoTrack){
            console.log("hellooooooooo---->",localVideoTrack)

            localVideoRef.current.srcObject=new MediaStream([localVideoTrack])
        }
    },[])
    // if(lobby) return <div>Waiting for other user to join</div>
    return (
    <div>
        <div>hi {name}</div>
        {lobby ? "Waiting for others user to join":null}
        <video autoPlay height={400} width={400} ref={localVideoRef} />
        <video autoPlay height={400} width={400} ref={remoteVideoRef} />
    
    </div>
   
  )
}

export default Room