import React, { useEffect,useState,useMemo } from 'react'
import '../staticCss/chat.css'
import Header from '../components/Chatify/Header'
import Sidebar from '../components/Chatify/Sidebar'
import Chatmenu from '../components/Chatify/Chatmenu'
import Searchuser from '../components/Chatify/Searchuser';
import Profile from '../components/Chatify/Profile'
import axios from 'axios'
import { Alert } from '@mui/material'
import {io} from 'socket.io-client';
const Chat =  () => {
  const [getId,setGetid]=useState();
  const [chat,setChat]=useState([]);
  const [user,setUser]=useState();
  const token=sessionStorage.getItem('jwt');
  const [searchBox,setSearchBox]=useState(false);
  const [searchBoxstyle,setSearchBoxstyle] = useState();
  const [showAlert, setAlert] = useState(null);
  const [msg, setMsg] = useState("");
  const [profileStyle,setProfileStyle]=useState({'display':'none'});
  const [profilePageopen,setProfilePageopen]=useState(false);

     //initialing socket.io circuit
  const socket=useMemo(()=>{
    return io(`${process.env.REACT_APP_BACKEND}`,{
      withCredentials:true, 
    })
  },[])


  useEffect(() => {
    if (searchBox) {
      setSearchBoxstyle({
        'display': 'block',
        'width': '25%',
        'height': '100%',
        'margin': '0px auto',
        'margin-left':'1.5rem',
        'padding':'0.2rem 0.5rem',
        'background':'#252837',
      });
    } else {
      setSearchBoxstyle({ 'display': 'none' });
    }
  }, [searchBox]);

  useEffect(()=>{
    const instance=axios.create({
      baseURL:`${process.env.REACT_APP_BACKEND}/api/chat`,
      withCredentials:true,
      headers:{
        'Content-Type':'application/json',
        'Accept':'application/json',
        'Authorization':`${token}`
      }
    })
    const fetchChat=async ()=>{
      try{
      const res=await instance.get('/fetchChat')
      setChat(res.data.formattedChats);
      setUser(res.data.user);
      }
      catch(err){
        console.log(err);
        setAlert(false);
        setMsg(err.response.data);
        if(err.response.status===301){
          window.location.href = '/';
        }
      }
    }
    fetchChat();
  },[])


  return (
    <React.Fragment>
    {showAlert !== null ? !showAlert ? <Alert variant="filled" severity="warning" className='alert_prop'>
                {msg}
            </Alert> : "" : ""}
    <Header user={user} setProfilePageopen={setProfilePageopen}/>
    {profilePageopen? <Profile user={user} style={profileStyle}/>:""}
   
    <div className='chat_window'>
        <Sidebar chat={chat} setGetid={setGetid} setSearchBox={setSearchBox} user={user} socket={socket}/>
        <Chatmenu chat={chat} getId={getId} user={user} socket={socket}/>
        <Searchuser searchBoxstyle={searchBoxstyle} user={user} />
    </div>
    </React.Fragment>
  )
}

export default Chat