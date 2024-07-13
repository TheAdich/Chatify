import React, { useState, useEffect, useMemo, useRef } from 'react'
import '../../staticCss/chat.css'
import profile from '../../assets/profile.svg'
import testPic from '../../assets/sidebar.jpg';
import axios from 'axios'
import Loading from '../../Loader/Loading';
import { useNavigate } from 'react-router-dom';
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { v4 } from "uuid";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
const Chatmenu = ({ chat, getId, user, socket }) => {
    const admin = user;
    // console.log(admin);
    const navigateTo = useNavigate();
    const [data, setdata] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = sessionStorage.getItem('jwt');
    const [msg, setmsg] = useState("");
    const [file, setFile] = useState(null);
    //const [fileUrl, setFileUrl] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [displayMsg, setDisplayMsg] = useState([]);
    const chatDisplayRef = useRef(null);
    //firebase functionality 
    const uploadFile = () => {
        if (file == null) return;
        const fileRef = ref(storage, `userfile/${file.name + v4()}`);
        const uploadTask = uploadBytesResumable(fileRef, file);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    console.log(url);
                    //setFileUrl(url);
                    setmsg(url);
                    //postMessage(url);
                    alert('File sent successfully!');
                });
            }
        );
    }





    // Utility function to format time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);

        const optionsDate = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedDate = date.toLocaleDateString([], optionsDate);

        const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
        const formattedTime = date.toLocaleTimeString([], optionsTime);

        return `${formattedDate} ${formattedTime}`;
    };

    useEffect(() => {
        socket.on('getMessage', (msg) => {
            setDisplayMsg((prev) => [...prev, msg]);
            scrollToBottom();

        })
        return () => {
            socket.off('getMessage');
        }
    }, [socket])

    useEffect(() => {
        const fetchUserChat = async () => {
            const instance = axios.create({
                baseURL: `${process.env.REACT_APP_BACKEND}/api/chat`,
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `${token}`
                }
            })
            try {
                if (getId) {
                    const res = await instance.post('/userChat', { id: getId });
                    if (res.data) {
                        setDisplayMsg(res.data.messages);
                        setdata(res.data);
                    }
                    setLoading(false);

                }

            } catch (err) {
                console.log(err);
                setLoading(false);
            }
        }
        fetchUserChat();
    }, [getId])

    const scrollToBottom = () => {
        if (chatDisplayRef.current) {
            chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
        }
    };

    const redirectTorename = (data) => {
        if (data.groupAdmin === admin._id.toString()) {
            navigateTo(`/renamegroup?q=${data._id}`);
        }
        else alert('Only admin can edit grp details!');
    }


    const postMessage = async (e) => {
        e.preventDefault();
        function checkUrlOrText(msg) {
            var urlRegex = /(https?:\/\/[^\s]+)/g;
            var firebaseStorageRegex = /https:\/\/firebasestorage\.googleapis\.com\/[^\s]+/g;
            if (firebaseStorageRegex.test(msg)) {
                return 'media';
            } else if (urlRegex.test(msg)) {
                return 'link';
            } else {
                return 'text';
            }
        }
        const msgType = checkUrlOrText(msg);
        //console.log(msgType);

        const instance = axios.create({
            'baseURL': `${process.env.REACT_APP_BACKEND}/api/msg`,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        })
        try {
            console.log(file);
            const res = await instance.post('/postmessage', { id: getId, content: msg, msgType: msgType });
            // console.log(res.data);
            if (res.data) {
                console.log(res.data);
                setDisplayMsg((prevMsgs) => [...prevMsgs, res.data]);
                scrollToBottom();
                socket.emit('newMessage', { msg: res.data, room: getId });
            }
        } catch (err) {
            console.log(err);
        }
        setmsg("");
    }

    return (
        <div className='user_chat_window'>
            <div className='user_chat_header'>
                <img src={data ? data.pic : profile} style={{ width: '3.5vw', "marginLeft": "1rem", "borderRadius": "50%" }}></img>
                <p style={{ "marginLeft": "1rem", "fontSize": "1.2rem" }}>{data ? data.chatName : "Username"}</p>
                {data && data.isGroupChat === true ? <button className='edit_grp_btn' onClick={() => redirectTorename(data)}>Edit Group info</button> : ""}
            </div>
            {getId !== undefined ? <div style={{ marginLeft: '1rem', marginBottom: '0.4rem' , display:'flex'}}>
                <input type='file' name='photo' onChange={(e) => setFile(e.target.files[0])}></input>
                <button type='submit' onClick={uploadFile} className='edit_send_btn'>Upload</button>
                <p>Support only images!</p>
            </div> : ""}

            {getId !== undefined ? <div className='chat_display_section' ref={chatDisplayRef} style={{ display: 'flex', flexDirection: 'column' }}>
                {loading ? <Loading /> :
                    data && displayMsg.length > 0 ?
                        displayMsg.map((e, ind) => (
                            <PhotoProvider>
                            <div key={ind} className='msg_box' style={admin.name === e.sender.name ? { alignSelf: 'flex-end' } : {}}>
                                <p className='msg_box_senderName'>{e.sender.name}</p>
                                {!e.message ? (
                                    e.msgType === 'media' ? (
                                        <div style={{ cursor: 'pointer' }} >
                                            <PhotoView src={e.content}>
                                            <img src={e.content} style={{ display: 'block', width: '100%', height: '100%' }} alt="Media" />
                                            </PhotoView>
                                            <p style={{ backgroundColor: '#6586ff' }}>Media: Click to View</p>
                                        </div>
                                    ) : (
                                        e.msgType === 'text' ? (
                                            <p className='msg_box_message'>{e.content}</p>
                                        ) : (
                                            <a href={e.content} className='msg_box_message'>{e.content}</a>
                                        )
                                    )
                                ) : null}
                                <p className='msg_box_time'>{formatDateTime(e.createdAt)}</p>
                            </div></PhotoProvider>
                        )) : <div className='msg_box'><p>No messages yet</p></div>
                }
                {/*  */}
            </div> : "Click on chat to start conversation"}

            {getId !== undefined ?
                <div>
                    <form className='chat_type_box' onSubmit={(e) => postMessage(e)} encType='multipart/form-data'>
                        <input type='text' className='msg_post' placeholder='Type Something' value={msg} onChange={(e) => setmsg(e.target.value)}></input>
                        <button className='post_btn' type='submit' value='post'>Post</button>
                    </form>
                </div> : ""}
        </div>
    )
}

export default Chatmenu