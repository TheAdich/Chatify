import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, User, Users, Clock } from 'lucide-react';

const Sidebar = ({ chat, setGetid, setSearchBox, user, socket }) => {
    const [socketid, setSocketid] = useState();

    useEffect(() => {
        socket.on('connect', () => {
            setSocketid(socket.id);
        });

        return () => {
            socket.off('welcomeEvent');
            socket.disconnect();
        };
    }, [socket]);

    const handleGetid = (e) => {
        setGetid(e._id);
        socket.emit('joinChat', e._id);
    };

    const handleUserSearch = () => {
        setSearchBox(prev => !prev);
    };

    const formatLastMessage = (message) => {
        if (!message) return "Type something to chat!";
        
        if (message.msgType === 'media') {
            return "📷 Photo";
        } else if (message.msgType === 'link') {
            return "🔗 Link";
        } else {
            return message.content.length > 25 
                ? message.content.slice(0, 25) + "..." 
                : message.content;
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="w-80 bg-white/5 backdrop-blur-lg border-r border-white/10 flex flex-col h-full">
            {/* Search Header */}
            <div className="p-6 border-b border-white/10">
                <button
                    onClick={handleUserSearch}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300 hover:scale-105 group"
                >
                    <Search className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                        Search for users
                    </span>
                </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Recent Chats ({chat.length})
                    </h2>
                    
                    {chat.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">No chats yet</p>
                            <p className="text-gray-500 text-sm">Search for users to start chatting</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {chat.map((chatItem) => (
                                <div
                                    key={chatItem._id}
                                    onClick={() => handleGetid(chatItem)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all duration-300 hover:scale-105 group"
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {chatItem.pic ? (
                                            <img 
                                                src={chatItem.pic} 
                                                alt={chatItem.chatName}
                                                className="w-12 h-12 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-2 border-white/20 group-hover:border-white/40 transition-all duration-300">
                                                {chatItem.isGroupChat ? (
                                                    <Users className="w-6 h-6 text-white" />
                                                ) : (
                                                    <User className="w-6 h-6 text-white" />
                                                )}
                                            </div>
                                        )}
                                        
                                        
                                    </div>

                                    {/* Chat Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-white font-medium truncate group-hover:text-blue-300 transition-colors duration-300">
                                                {chatItem.chatName}
                                            </h3>
                                            {chatItem.messages[0] && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(chatItem.messages[0].createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-400 text-sm truncate group-hover:text-gray-300 transition-colors duration-300">
                                                {formatLastMessage(chatItem.messages[0])}
                                            </p>
                                            
                                            {chatItem.isGroupChat && (
                                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                                    {chatItem.users?.length || 0} members
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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
    );
};

export default Sidebar;