import 'regenerator-runtime/runtime'
const getUserMedia = require('getusermedia')
const Peer = require('simple-peer')

const getCameraStream = async() => new Promise((resolve, reject) => {
  getUserMedia({ video: true, audio: true }, (err, stream) => {
    if (err) return reject(err)
    resolve(stream)
  })
})

const DEFAULT_PEER_OPTIONS = {
  initiator: location.hash === '#init',
  trickle: false,
  config: {
    'iceServers': [
      { url: 'stun:stun.l.google.com:19302' },
      { url: 'stun:stun1.l.google.com:19302' },
    ]
  }
}


const getDisplayStreamTrack = async() => {
  try {
    const displayStream = await navigator.mediaDevices.getDisplayMedia()
    return displayStream.getTracks()[0]
  } catch {
    return null
  }
}

async function main() {
  try {
    const cameraStream = await getCameraStream()
    const displayStreamTrack = await getDisplayStreamTrack()
    if (displayStreamTrack) {
      cameraStream.addTrack(displayStreamTrack)
    }
    const peer = new Peer({
      ...DEFAULT_PEER_OPTIONS,
      stream: cameraStream,
    })

    peer.on('signal', data => {
      console.log("signal")
      document.getElementById('yourId').value = JSON.stringify(data)
    })

    document.getElementById('connect').addEventListener('click', () => {
      console.log("connect button clicked", document.getElementById('otherId'))
      var otherId = JSON.parse(document.getElementById('otherId').value)
      peer.signal(otherId)
    })

    document.getElementById('send').addEventListener('click', () => {
      console.log("send button")
      var yourMessage = document.getElementById('yourMessage').value
      peer.send(yourMessage)
    })

    peer.on('data', data => {
      console.log("data")
      document.getElementById('messages').textContent += data + '\n'
    })

    peer.on('stream', function(stream) {
      const peerCameraVideo = document.querySelector('.peercamera')
      const peerDisplayVideo = document.querySelector('.peerdisplay')

      const clonedStream = stream.clone()


      clonedStream.removeTrack(clonedStream.getTracks()[1])
      clonedStream.removeTrack(clonedStream.getTracks()[0])


      peerCameraVideo.srcObject = stream
      peerCameraVideo.play()

      peerDisplayVideo.srcObject = clonedStream
      peerDisplayVideo.play()
    })

  } catch (err) {
    console.error('error', err)
  }
}

window.addEventListener('click', main, { once: true })