let Peer = require('simple-peer');
let socket = io();

const video = document.querySelector('video'); // select video element
let client = {} // will have everything related to other person

//get stream
navigator.mediaDevices.getUserMedia({video: true, audio:true})   //will ask browser for user permission
.then(stream =>{
    socket.emit('NewClient');
    video.srcObject = stream;
    video.play();

    function InitPeer(type){
        let peer = new Peer({initiator: (type == 'init')? true : false, stream: stream, trickle:false});
        peer.on('stream', function(stream){
            CreateVideo(stream);
        });

        peer.on('close', function(){
            document.getElementById("peerVideo").remove();
            peer.destroy();
        });
        return peer;
    }

    // to make offer
    function MakePeer(){
        client.gotAnswer = false;
        let peer = InitPeer('init');
        peer.on('signal', function(data){
            if(!client.gotAnswer){
                socket.emit('Offer', data);
            }
        })
        client.peer = peer;
    }

    //to get offer
    function FrontAnswer(offer){
        let peer = InitPeer('notinit'); 
        peer.on('signal', function(data){
            socket.emit('Answer', data);
        })
        peer.signal(offer);
    }

    function SignalAnswer(answer) {
        client.gotAnswer = true
        let peer = client.peer
        peer.signal(answer)
    }

    function CreateVideo(stream) {
        let video = document.createElement('video')
        video.id = 'peerVideo'
        video.srcObject = stream
        video.setAttribute('class', 'embed-responsive-item')
        document.querySelector('#peerDiv').appendChild(video)
        video.play()

    }

    function SessionActive() {
        document.write('Session Active. Please come back later')
    }

    socket.on('BackOffer', FrontAnswer)
    socket.on('BackAnswer', SignalAnswer)
    socket.on('SessionActive', SessionActive)
    socket.on('CreatePeer', MakePeer)

})
.catch(err => document.write(err));



