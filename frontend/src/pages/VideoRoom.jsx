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
        style={{ width: '100vw', height: '100vh' }}
      ></div>
      <button style={{'position':'absolute', 'top':0, 'left':0, 'cursor':'pointer', 'backgroundColor':'green', 'border':'none', 'outline':'none', 'fontSize':'1.2rem', 'padding':'0.3rem 0.4rem', 'borderRadius':'1rem'}} onClick={()=> window.location.href='/chat'}>Back</button>
    </React.Fragment>

  );
}
