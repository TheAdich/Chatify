import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';





// get token
async function generateToken(tokenServerUrl, userID) {
  // Obtain the token interface provided by the App Server
  return await fetch(
    `${tokenServerUrl}/access_token?userID=${userID}&expired_ts=7200`,
    {
      method: 'GET',
    }
  ).then((res) => res.json());
}

function randomID(len) {
  let result = '';
  if (result) return result;
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

function getUrlParams(url) {
  url = url || window.location.href;
  let urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr);
}

export default function VideoRoom() {

  const [recording, setRecording] = React.useState(false);
  const [recordingURL, setRecordingURL] = React.useState(null);
  const audioChunks = React.useRef([]);
  const mediaRecorder = React.useRef(null);
  const [hasJoinedRoom, setHasJoinedRoom] = React.useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, {
          type: 'audio/wav',
        });
        const url=URL.createObjectURL(audioBlob)
        
        downLoadRecording(url)
      }
      mediaRecorder.current.start();
      setRecording(true);
    } catch (err) {
      console.log(err);
    }
  }

  const endRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      
      mediaRecorder.current.stop();
      setRecording(false);
    }
  }

  const downLoadRecording = (url) => {
    if (url) {
      console.log(url);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-recording-${new Date().toISOString()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }



  const roomID = getUrlParams().get('roomID') || randomID(5);
  let myMeeting = async (element) => {
    const userID = randomID(5);
    const userName = randomID(5);
    // generate token
    generateToken('https://nextjs-token.vercel.app/api', userID).then((res) => {
      const token = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        1484647939,
        res.token,
        roomID,
        userID,
        userName
      );
      // create instance object from token
      const zp = ZegoUIKitPrebuilt.create(token);

      
      

      // start the call
      zp.joinRoom({
        container: element,
       
        sharedLinks: [
          {
            name: 'Personal link',
            url:
              window.location.origin +
              window.location.pathname +
              '?roomID=' +
              roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
      });
    });
    
  };

  return (
    <React.Fragment>
      <div
        className="myCallContainer"
        ref={myMeeting}
        style={{ width: '90vw', height: '100vh', margin: '0 auto' }}
      ></div>
      {!recording ?
        <button onClick={startRecording} style={{ 'position': 'absolute', 'width': 'fit-content', 'top': 10, 'right': 10, 'cursor': 'pointer', 'backgroundColor': `${recording ? 'red' : 'green'}`, 'border': 'none', 'outline': 'none', 'fontSize': '0.8rem', 'padding': '0.5rem 0.5rem', 'borderRadius': '1rem' }}>Start Recording</button> :
        <button onClick={endRecording} style={{ 'position': 'absolute', 'width': 'fit-content', 'top': 10, 'right': 10, 'cursor': 'pointer', 'backgroundColor': `${recording ? 'red' : 'green'}`, 'border': 'none', 'outline': 'none', 'fontSize': '0.8rem', 'padding': '0.5rem 0.5rem', 'borderRadius': '1rem' }}> End Recording</button>}
      
      
      <button style={{ 'position': 'absolute', 'width': 'fit-content', 'top': 10, 'left': 10, 'cursor': 'pointer', 'backgroundColor': 'green', 'border': 'none', 'outline': 'none', 'fontSize': '1.2rem', 'padding': '0.5rem 0.5rem', 'borderRadius': '1rem' }} onClick={() => window.location.href = '/chat'}>Back</button>
    </React.Fragment>

  );
}
