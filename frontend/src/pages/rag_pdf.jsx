import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileText, X, Send, MessageSquare, User, Bot, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';



function RagPdf() {
    const [documents, setDocuments] = useState([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [notification, setNotification] = useState(null);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const getAllUploadedDocs = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND}/api/pdf/getAllUploadedDocs`, {
                    headers: {
                        'Authorization': sessionStorage.getItem('jwt')
                    }
                })
                console.log(res.data);
                if (res.data && res.data.length > 0) {
                    const formattedDocs = res.data.map(doc => ({
                        id: doc.file_uniq_id,
                        name: doc.file_name,
                    }));
                    setDocuments(formattedDocs);
                }

            }
            catch (err) {
                console.log(err);
            }
        }
        getAllUploadedDocs();
    }, [])


    useEffect(() => {
        const getRagChatMessages = async () => {
            if (!selectedDocumentId) return;
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND}/api/pdf/getRagChatMessages?id=${selectedDocumentId}`, {
                    headers: {
                        'Authorization': sessionStorage.getItem('jwt')
                    }
                });


                setMessages(res.data.chats.map(msg => ({
                    type: msg.type,
                    content: msg.content,
                })));

            } catch (err) {
                console.log(err);
            }
        }
        getRagChatMessages();
    }, [selectedDocumentId])

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const handleFileUpload = useCallback(async (file) => {
        setIsUploading(true);

        try {
            // Simulate upload process
            console.log(file);
            const formData = new FormData();
            formData.append('pdf', file);



            const res = await axios.post(`${process.env.REACT_APP_BACKEND}/api/pdf/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': sessionStorage.getItem('jwt')
                }
            })

            if (res.status === 200) {
                const file_uniq_id = res.data.file_uniq_id;
                const file_name = res.data.file_name;
                const newDocument = {
                    id: file_uniq_id,
                    name: file_name,
                };

                setDocuments(prev => [...prev, newDocument]);
                setSelectedDocumentId(newDocument.id);
                setIsUploading(false);
                setMessages([]);

                showNotification('Document uploaded successfully!', 'success');

            }




        } catch (error) {
            setIsUploading(false);
            showNotification('Failed to upload document', 'error');
        }
    }, []);

    const handleDocumentSelect = useCallback((documentId) => {
        setSelectedDocumentId(documentId);
        setMessages([]);
    }, []);

    const handleDocumentRemove = useCallback((documentId) => {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        if (selectedDocumentId === documentId) {
            setSelectedDocumentId(null);
            setMessages([]);
        }
        showNotification('Document removed', 'success');
    }, [selectedDocumentId]);

    const handleSendMessage = useCallback(async (messageContent) => {
        if (!selectedDocumentId) return;

        const payload = {
            question: messageContent,
            file_uniq_id: selectedDocumentId
        }

        setMessages(prev => [
            ...prev,
            {

                type: 'user',
                content: messageContent,

            }])



        try {
            // Simulate AI response
            setIsLoading(true);
            const res = await axios.post(`${process.env.REACT_APP_BACKEND}/api/pdf/ask`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionStorage.getItem('jwt')
                }
            })



            const botMessage = {

                type: 'bot',
                content: `${res.data.answer}`,

            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            showNotification('Failed to get response', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [selectedDocumentId]);

    // File Upload Handlers
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        const pdfFile = files.find(file => file.type === 'application/pdf');

        if (pdfFile) {
            handleFileUpload(pdfFile);
        } else {
            showNotification('Please upload a PDF file', 'error');
        }
    }, [handleFileUpload]);

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            handleFileUpload(file);
        } else if (file) {
            showNotification('Please upload a PDF file', 'error');
        }
    }, [handleFileUpload]);

    // Chat Handlers
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputMessage.trim() && !isLoading && selectedDocumentId) {
            handleSendMessage(inputMessage.trim());
            setInputMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }



    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleInputChange = (e) => {
        setInputMessage(e.target.value);

        // Auto-resize textarea
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    };

    const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);

    // Chat Message Component
    const ChatMessage = ({ message }) => {
        const isUser = message.type === 'user';

        return (
            <div className={`h-fit  flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
                <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`
            flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center
            ${isUser
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 ml-3'
                            : 'bg-white/10 mr-3'
                        }
          `}>
                        {isUser ? (
                            <User className="w-5 h-5 text-white" />
                        ) : (
                            <Bot className="w-5 h-5 text-blue-400" />
                        )}
                    </div>

                    <div className={`
            px-6 py-4 rounded-2xl backdrop-blur-lg border
            ${isUser
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-500/20 text-white'
                            : 'bg-white/5 border-white/10 text-white'
                        }
          `}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen overflow-y-scroll bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Toast Notification */}
            {notification && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl backdrop-blur-lg border transition-all duration-500 transform ${notification.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-100'
                    : 'bg-red-500/10 border-red-500/20 text-red-100'
                    }`}>
                    <div className="flex items-center gap-3">
                        {notification.type === 'success' ? (
                            <Check className="w-5 h-5 text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}

                


                <div className="text-center mb-12">

                   


                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-blue-500/20">
                            <MessageSquare className="w-8 h-8 text-blue-400" />
                        </div>
                        <NavLink to='/chat'>
                        <h1 className="text-4xl font-bold text-white">Chatify PDF Chatbot</h1>
                        </NavLink>
                    </div>
                    <p className="text-gray-400 text-lg">Upload your PDF documents and ask intelligent questions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - Upload & Documents */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-6 shadow-2xl">
                            {/* File Upload */}
                            <div className="mb-8">
                                <div
                                    className={`
                    relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
                    ${isDragOver
                                            ? 'border-blue-500/50 bg-blue-500/10'
                                            : 'border-white/20 hover:border-white/30'
                                        }
                    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                  `}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploading}

                                        name='pdf'
                                    />

                                    <div className="flex flex-col items-center space-y-4">
                                        {isUploading ? (
                                            <div className="p-4 rounded-2xl bg-blue-500/20">
                                                <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-2xl bg-blue-500/20">
                                                <Upload className="w-8 h-8 text-blue-400" />
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-lg font-semibold text-white mb-2">
                                                {isUploading ? 'Uploading...' : 'Upload PDF Document'}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                Drag and drop your PDF file here, or click to browse
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document Selector */}
                            {documents.length === 0 ? (
                                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                                    <div className="p-3 rounded-2xl bg-gray-500/20 w-fit mx-auto mb-3">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-400">No documents uploaded yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        Your Documents
                                    </h3>

                                    <div className="space-y-3 overflow-y-scroll max-h-[300px]">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className={`
                          group relative flex items-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer
                          ${selectedDocumentId === doc.id
                                                        ? 'border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-purple-600/10'
                                                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                                    }
                        `}
                                                onClick={() => handleDocumentSelect(doc.id)}
                                            >
                                                <div className="p-2 bg-blue-500/20 rounded-xl mr-4">
                                                    <FileText className="w-5 h-5 text-blue-400" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-white truncate">{doc.name}</p>

                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDocumentRemove(doc.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-xl transition-all duration-200"
                                                >
                                                    <X className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Chat Interface */}
                    <div className="min-h-screen lg:col-span-2">
                        <div className="min-h-screen flex">
                            {!selectedDocument ? (
                                <div className="flex-1 flex items-center justify-center bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10">
                                    <div className="text-center">
                                        <div className="p-6 rounded-2xl bg-blue-500/20 w-fit mx-auto mb-6">
                                            <MessageSquare className="w-16 h-16 text-blue-400" />
                                        </div>
                                        <p className="text-2xl font-semibold text-white mb-3">Select a Document</p>
                                        <p className="text-gray-400">Choose a document to start asking questions</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 max-h-[700px] overflow-y-scroll flex flex-col bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl">
                                    {/* Chat Header */}
                                    <div className="px-6 py-5 border-b border-white/10">
                                        <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                                            <Bot className="w-5 h-5 text-blue-400" />
                                            Chat with: <span className="text-blue-400">{selectedDocument.name}</span>
                                        </h3>
                                        <p className="text-sm text-gray-400 mt-1">Ask questions about your document</p>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1  p-6 space-y-4">
                                        {messages.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="p-4 rounded-2xl bg-blue-500/20 w-fit mx-auto mb-4">
                                                    <MessageSquare className="w-12 h-12 text-blue-400" />
                                                </div>
                                                <p className="text-gray-400 text-lg">Start a conversation about your document</p>
                                            </div>
                                        ) : (
                                            messages.map((message, id) => (
                                                <ChatMessage key={id} message={message} />
                                            ))
                                        )}

                                        {isLoading && (
                                            <div className="flex justify-start mb-4">
                                                <div className="flex">
                                                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mr-4">
                                                        <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                                    </div>
                                                    <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-lg">
                                                        <p className="text-sm text-gray-300">Thinking...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className="p-6 border-t border-white/10">
                                        <form onSubmit={handleSubmit} className="flex space-x-4">
                                            <div className="flex-1 relative">
                                                <textarea
                                                    ref={textareaRef}
                                                    value={inputMessage}
                                                    onChange={handleInputChange}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Ask a question about your document..."
                                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-400 backdrop-blur-lg transition-all duration-300"
                                                    rows={1}
                                                    style={{ minHeight: '56px' }}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!inputMessage.trim() || isLoading || !selectedDocument}
                                                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                                            >
                                                {isLoading ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Send className="w-5 h-5" />
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RagPdf;