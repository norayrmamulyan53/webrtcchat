var getUserMedia = require('getusermedia')
var Peer = require('simple-peer')

getUserMedia({ video: true, audio: true }, function(err, stream) {
  if (err) return console.error(err)


  window.addEventListener('click', () => {
    navigator.mediaDevices.getDisplayMedia()
      .then(displayStream => {

        stream.addTrack(displayStream.getTracks()[0])

        var Peer = require('simple-peer')
        var peer = new Peer({
          initiator: location.hash === '#init',
          trickle: false,
          stream: stream,
          config: {
            'iceServers': [
              { url: 'stun:stun.l.google.com:19302' },
              { url: 'stun:stun1.l.google.com:19302' },
            ]
          }
        })

        peer.on('signal', function(data) {
          console.log("signal")
          document.getElementById('yourId').value = JSON.stringify(data)
        })

        document.getElementById('connect').addEventListener('click', function() {
          console.log("connect button clicked", document.getElementById('otherId'))
          var otherId = JSON.parse(document.getElementById('otherId').value)
          peer.signal(otherId)
        })

        document.getElementById('send').addEventListener('click', function() {
          console.log("send button")
          var yourMessage = document.getElementById('yourMessage').value
          peer.send(yourMessage)
        })

        peer.on('data', function(data) {
          console.log("data")
          document.getElementById('messages').textContent += data + '\n'
        })

        peer.on('stream', function(stream) {
          const tracks = stream.getTracks();
          const clonedStream = stream.clone()

          clonedStream.removeTrack(clonedStream.getTracks()[1])
          clonedStream.removeTrack(clonedStream.getTracks()[0])
          console.log(tracks)
          var video = document.createElement('video')
          document.body.appendChild(video)

          video.srcObject = stream
          video.play()

          window.stream = stream
          const displayVideo = document.createElement('video')
          displayVideo.srcObject = clonedStream
          document.body.appendChild(displayVideo)
          displayVideo.play()
        })
      })
  }, { once: true })

})