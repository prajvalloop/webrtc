import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Room from './Room'

type Props = {}

const Landing = (props: Props) => {
  const [name,setName]=useState<string | null>(null)
  const [localVideoTrack,setLocalVideoTrack]=useState<MediaStreamTrack | null>(null)
  const [localAudioTrack,setLocalAudioTrack]=useState<MediaStreamTrack | null>(null)
  const [joined,setJoined]=useState<boolean>(false)
  const videoRef=useRef<HTMLVideoElement | null> (null)

  const getCam=async()=>{
    const streams=await window.navigator.mediaDevices.getUserMedia({
      video:true,
      audio:true
    })
    const videoTrack=streams.getVideoTracks()[0]
    const audioTrack=streams.getAudioTracks()[0]
    setLocalAudioTrack(audioTrack)
    setLocalVideoTrack(videoTrack)

    if(videoRef.current){
      videoRef.current.srcObject=new MediaStream([videoTrack])
    }
    
  }
  useEffect(()=>{
    if(videoRef.current){
        getCam()
    }
    
  },[videoRef])
  if(!joined){
    return (
      <div>
          <video autoPlay ref={videoRef}></video>
          <input onChange={(e)=>setName(e.target.value)} type='text'/>
          <button onClick={()=>setJoined(true)} >Join</button>
          {/* <Link to={`/room?name=${name}`}>Join</Link> */}
      </div>
    )
  }
  else{
    return (
    <Room name={name} localVideoTrack={localVideoTrack} localAudioTrack={localAudioTrack} />
    )
  }
 
}

export default Landing