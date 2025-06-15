import React, { useState, useEffect, useMemo, useRef } from 'react'
import axios from 'axios'
import Loading from '../../Loader/Loading';
import { useNavigate } from 'react-router-dom';
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { v4 } from "uuid";
import { Bounce, toast, ToastContainer } from 'react-toastify';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { 
  Send, 
  Paperclip, 
  Upload, 
  Settings, 
  User, 
  Users, 
  Image as ImageIcon,
  ExternalLink,
  AlertTriangle,
  Clock
} from 'lucide-react';

const Chatmenu = ({ chat, getId, user, socket }) => {
    const admin = user;
    const navigateTo = useNavigate();
    const [data, setdata] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = sessionStorage.getItem('jwt');
    const [msg, setmsg] = useState("");
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [displayMsg, setDisplayMsg] = useState([]);
    const chatDisplayRef = useRef(null);
    const [throttlingError, setThrottlingError] = useState(false);
    const [MsgTimeStamps, setMsgTimeStamps] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    //firebase functionality 
    const uploadFile = () => {
        if (file == null) return;
        setIsUploading(true);
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
                setIsUploading(false);
                toast.error('Upload failed!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "dark",
                });
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    console.log(url);
                    setmsg(url);
                    setIsUploading(false);
                    setFile(null);
                    setUploadProgress(0);
                    toast.success('File uploaded successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        theme: "dark",
                    });
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
        else {
            toast.warn('Only admin can edit group details!', {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
            });
        }
    }

    const MSG_LIMIT = 5;
    const coolDownPeriod = 10000

    const postMessage = async (e) => {
        e.preventDefault();
        const now = Date.now();
        setMsgTimeStamps(MsgTimeStamps.filter((e) => now - e <= coolDownPeriod));
        console.log(MsgTimeStamps);
        if (MsgTimeStamps.length >= MSG_LIMIT) {
            setThrottlingError('true');
            toast.warn('Rate Limit Exceed! Try again after 5-10 sec', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
            return;
        }
        setMsgTimeStamps((prev) => [...prev, now]);
        setThrottlingError(false);
        
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
        <div className="w-full flex flex-col h-full bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {throttlingError && <ToastContainer />}
            
            {/* Chat Header */}
            {data && (
                <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {data.pic ? (
                                <img 
                                    src={data.pic} 
                                    alt="Chat"
                                    className="w-12 h-12 rounded-full border-2 border-white/20"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                    {data.isGroupChat ? (
                                        <Users className="w-6 h-6 text-white" />
                                    ) : (
                                        <User className="w-6 h-6 text-white" />
                                    )}
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    {data.chatName || "Username"}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {data.isGroupChat ? `${data.users?.length || 0} members` : ''}
                                </p>
                            </div>
                        </div>
                        
                        {data.isGroupChat && (
                            <button
                                onClick={() => redirectTorename(data)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300 hover:scale-105"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden md:inline">Edit Group</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* File Upload Section */}
            {getId !== undefined && (
                <div className="bg-white/5 border-b border-white/10 p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input 
                                type="file" 
                                name="photo" 
                                onChange={(e) => setFile(e.target.files[0])}
                                className="hidden"
                                id="file-upload"
                                accept="image/*"
                            />
                            <label 
                                htmlFor="file-upload"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white cursor-pointer transition-all duration-300 hover:scale-105"
                            >
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm">{file ? file.name : 'Choose file'}</span>
                            </label>
                        </div>
                        
                        {file && (
                            <button 
                                type="button" 
                                onClick={uploadFile}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/20 text-blue-400 disabled:text-gray-400 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                                        <span className="text-sm">Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        <span className="text-sm">Upload</span>
                                    </>
                                )}
                            </button>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <ImageIcon className="w-4 h-4" />
                            <span>Images only</span>
                        </div>
                    </div>
                    
                    {isUploading && uploadProgress > 0 && (
                        <div className="mt-3">
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{Math.round(uploadProgress)}% uploaded</p>
                        </div>
                    )}
                </div>
            )}

            {/* Chat Messages */}
            {getId !== undefined ? (
                <div 
                    className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                    ref={chatDisplayRef}
                >
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loading />
                        </div>
                    ) : data && displayMsg.length > 0 ? (
                        displayMsg.map((e, ind) => (
                            <PhotoProvider key={ind}>
                                <div 
                                    className={`flex ${admin.name === e.sender.name ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                            admin.name === e.sender.name 
                                                ? 'bg-blue-500/20 border border-blue-500/20 text-white' 
                                                : 'bg-white/5 border border-white/10 text-white'
                                        }`}
                                    >
                                        <p className="text-xs text-gray-400 mb-1 font-medium">
                                            {e.sender.name}
                                        </p>
                                        
                                        {!e.message ? (
                                            e.msgType === 'media' ? (
                                                <div className="space-y-2">
                                                    <PhotoView src={e.content}>
                                                        <img 
                                                            src={e.content} 
                                                            className="w-full h-auto rounded-xl cursor-pointer hover:opacity-90 transition-opacity duration-300" 
                                                            alt="Media" 
                                                        />
                                                    </PhotoView>
                                                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                                                        <ImageIcon className="w-4 h-4" />
                                                        <span>Click to view full image</span>
                                                    </div>
                                                </div>
                                            ) : e.msgType === 'text' ? (
                                                <p className="text-white break-words">{e.content}</p>
                                            ) : (
                                                <a 
                                                    href={e.content} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-300 break-all"
                                                >
                                                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                                    <span>{e.content}</span>
                                                </a>
                                            )
                                        ) : null}
                                        
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDateTime(e.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </PhotoProvider>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-400 text-lg">No messages yet</p>
                                <p className="text-gray-500 text-sm">Start the conversation by sending a message</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-xl">Select a chat to start messaging</p>
                        <p className="text-gray-500 text-sm">Choose a conversation from the sidebar</p>
                    </div>
                </div>
            )}

            {/* Message Input */}
            {getId !== undefined && (
                <div className="bg-white/5 backdrop-blur-lg border-t border-white/10 p-4">
                    <form onSubmit={postMessage} className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                placeholder="Type your message..." 
                                value={msg} 
                                onChange={(e) => setmsg(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!msg.trim()}
                            className="p-3 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/20 text-blue-400 disabled:text-gray-400 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    )
}

export default Chatmenu