// console.log("JS script connected")
// const APP_CERTIFICATE='2174656558174fef9dfe5dd27be2a077'

// create constants
const APP_ID= 'a37d5f87bc2f4c40a42eb73fca6a8f4a'              
// const CHANNEL='main'
const CHANNEL= sessionStorage.getItem('room')
const TOKEN= sessionStorage.getItem('token')
let UID=Number(sessionStorage.getItem('UID'))
let NAME=sessionStorage.getItem('name')
// const UID= '230'

// mode: optimization algo :: webrtc or live
const client = AgoraRTC.createClient({mode : 'rtc', codec: 'vp8' }) 

// create variables
let localTracks=[]  //array  :: [0] -> voice, [1] -> video
let remoteUsers={}  // key:value pairs


// create function 
let joinAndDisplayLocalStream = async () =>{
    // change room-name
    document.getElementById('room-name').innerText = CHANNEL

    //event listener
    client.on('user-published', handleUserJoined)    
    client.on('user-left', handleUserLeft)

    // UID= await client.join(APP_ID, CHANNEL, TOKEN, null)    // join() method ->  to join the channel
    try {
        await client.join(APP_ID, CHANNEL, TOKEN, UID)
    }
    catch(error){
        console.error(error)
        window.open('/', '_self')
    }

    localTracks =await AgoraRTC.createMicrophoneAndCameraTracks()

    let member= await createMember()
    
    // [back tics i.e. ( ` ) ] for template action contd.
    // in order to use `${}` functionality anywhere
    let player =`<div class="video-container" id="user-container-${UID}" style="order:-1;">
                    <div class="username-wrapper"><span class="user-name">${member['name']}</span></div>
                    <div class="video-player" id="user-${UID}"></div>
                </div>`

    document.getElementById("video-streams").insertAdjacentHTML("beforeend", player)

    localTracks[1].play(`user-${UID}`)  //  [1]-> video :: returns a <video> tag

    await client.publish([localTracks[0], localTracks[1]])  // publish() method ->  publish on channel
}

// event handler
let handleUserJoined = async (user, mediaType) =>{
    // add remote-user to remoteUsers{}
    remoteUsers[user.uid]=user
    // subscribe method() -> Subscribes to the audio and/or video tracks of a remote user.
    await client.subscribe(user, mediaType)

    if(mediaType=== 'video'){
        let player= document.getElementById(`user-container-${user.uid}`)
        // if it already exists remove and add brand new
        if(player !=null){
            player.remove()
        }

        let member=await getMember(user)

        player =`<div class="video-container" id="user-container-${user.uid}" style="order:1;">
                    <div class="username-wrapper"><span class="user-name">${member['name']}</span></div>
                    <div class="video-player" id="user-${user.uid}"></div>                
                </div>`
        document.getElementById('video-streams').insertAdjacentHTML("beforeend", player)                

        user.videoTrack.play(`user-${user.uid}`)        
    }

    if(mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) =>{
    delete remoteUsers[user.uid]    
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for(let i=0; i< localTracks.length; i++){
        localTracks[i].stop
        localTracks[i].close
    }

    await client.leave()
    sessionStorage.setItem('user: status1', 'request for leaving')
    await deleteMember()
    sessionStorage.setItem('user: status2', 'left')
    window.open('/', '_self')
}

// e -> event 
let toggleCamera = async (e) =>{    
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor='#fff'        
    }
    else{
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor='rgb(255, 80, 80, 1)'        
    }
}

let toggleMic = async (e) =>{    
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor='#fff'        
    }
    else{
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor='rgb(255, 80, 80, 1)'        
    }
}

let createMember = async () =>{
    let response=await fetch('/create_member/', {
        method: 'POST', 
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({'name': NAME, 'room_name':CHANNEL, 'UID':UID})        
    })

    let data=await response.json()
    return data
}

let getMember = async (user) =>{    
    let response= await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let data=await response.json()
    return data
}

let deleteMember = async () =>{
    let response=await fetch('/delete_member/', {
        method: 'POST', 
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({'name': NAME, 'room_name':CHANNEL, 'UID':UID})        
    })
    let data=await response.json()            
    sessionStorage.setItem('error: report', data)    
}

// __main__
joinAndDisplayLocalStream()

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('cam-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
window.addEventListener('beforeunload', deleteMember)