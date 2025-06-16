import React, { useState } from 'react';
import { User, Upload, Save, ArrowLeft, Camera, Mail, FileText, Check, AlertCircle } from 'lucide-react';
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { v4 } from "uuid";
import axios from 'axios';

const Profile = ({ user,setProfilePageopen }) => {
    const token = sessionStorage.getItem('jwt');
    const [username, setUsername] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [pic, setPic] = useState(null);
    const [imageUrl, setImageUrl] = useState(user.pic);
    const [bio, setBio] = useState(user.bio || '');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showAlert, setAlert] = useState(null);
    const [msg, setMsg] = useState("");

    const uploadFile = () => {
        if (pic === null) return;
        setIsUploading(true);
        const imageRef = ref(storage, `userprofile/${pic.name + v4()}`);
        const uploadTask = uploadBytesResumable(imageRef, pic);
        
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                setIsUploading(false);
                setAlert(false);
                setMsg('Image upload failed!');
                setTimeout(() => setAlert(null), 4000);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    setImageUrl(url);
                    setIsUploading(false);
                    setPic(null);
                    setUploadProgress(0);
                    setAlert(true);
                    setMsg('Image uploaded successfully!');
                    setTimeout(() => setAlert(null), 4000);
                });
            }
        );
    };

    const updateChanges = async () => {
        if (!username.trim()) {
            setAlert(false);
            setMsg('Username cannot be empty');
            setTimeout(() => setAlert(null), 4000);
            return;
        }

        setIsSaving(true);
        const data = {
            name: username,
            email: email,
            bio: bio,
            pic: imageUrl
        };

        const instance = axios.create({
            baseURL: `${process.env.REACT_APP_BACKEND}/api/user`,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        });

        try {
            const res = await instance.put('/updateuser', data);
            console.log(res.data);
            setAlert(true);
            setMsg('Profile updated successfully!');
            setTimeout(() => {
                window.location.href = '/chat';
            }, 1000);
        } catch (err) {
            console.log(err);
            setAlert(false);
            setMsg('Failed to update profile');
            setTimeout(() => setAlert(null), 4000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 p-20 md:p-6 mb-10">

            {/* Toast Notification */}
            {showAlert !== null && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl backdrop-blur-lg border transition-all duration-500 transform ${
                    showAlert 
                        ? 'bg-green-500/10 border-green-500/20 text-green-100' 
                        : 'bg-red-500/10 border-red-500/20 text-red-100'
                }`}>
                    <div className="flex items-center gap-3">
                        {showAlert ? (
                            <Check className="w-5 h-5 text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-medium">{msg}</span>
                    </div>
                </div>
            )}

            <div className="h-full max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() =>setProfilePageopen(false)}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-105"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Edit Profile</h1>
                        <p className="text-gray-400">Update your personal information and preferences</p>
                    </div>
                </div>

                <div className="h-full grid lg:grid-cols-2 gap-">
                    {/* Profile Picture Section */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-blue-500/20">
                                <Camera className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Profile Picture</h2>
                                <p className="text-gray-400 text-sm">Upload a new profile image</p>
                            </div>

                            
                        </div>


                        

                        <div className="text-center space-y-6">
                            {/* Current Profile Picture */}
                            <div className="relative inline-block">
                                {imageUrl ? (
                                    <img 
                                        src={imageUrl} 
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full border-4 border-white/20 object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white/20">
                                        <User className="w-16 h-16 text-white" />
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-blue-500/20 border-2 border-gray-900">
                                    <Camera className="w-4 h-4 text-blue-400" />
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-4">
                                <input 
                                    type="file" 
                                    onChange={(e) => setPic(e.target.files[0])}
                                    className="hidden"
                                    id="profile-upload"
                                    accept="image/*"
                                />
                                <label 
                                    htmlFor="profile-upload"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white cursor-pointer transition-all duration-300 hover:scale-105"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>{pic ? pic.name : 'Choose Image'}</span>
                                </label>

                                {pic && (
                                    <button 
                                        onClick={uploadFile}
                                        disabled={isUploading}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/20 text-blue-400 disabled:text-gray-400 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                <span>Upload Image</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                {isUploading && uploadProgress > 0 && (
                                    <div className="w-full">
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-2">{Math.round(uploadProgress)}% uploaded</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={updateChanges}
                                    disabled={isSaving || !username.trim()}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => window.location.href = '/chat'}
                                    className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300 hover:scale-105"
                                >
                                    Cancel
                                </button>
                            </div>

                            
                        </div>
                    </div>

                    {/* Profile Information Section */}
                    <div className="bg-white/5 h-full backdrop-blur-lg rounded-3xl border border-white/10 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-purple-500/20">
                                <User className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                                <p className="text-gray-400 text-sm">Update your profile details</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="flex items-center gap-2 text-white font-medium mb-3">
                                    <User className="w-4 h-4" />
                                    Username <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                    maxLength={30}
                                />
                                <p className="text-gray-500 text-sm mt-2">{username.length}/30 characters</p>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="flex items-center gap-2 text-white font-medium mb-3">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label htmlFor="bio" className="flex items-center gap-2 text-white font-medium mb-3">
                                    <FileText className="w-4 h-4" />
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Write something about yourself..."
                                    rows={4}
                                    className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-vertical"
                                    maxLength={200}
                                />
                                <p className="text-gray-500 text-sm mt-2">{bio.length}/200 characters</p>
                            </div>

                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;