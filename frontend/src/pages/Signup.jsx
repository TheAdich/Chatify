import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, MessageCircle, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(null);
    const [errMsg, setErrMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const instance = axios.create({
            baseURL: `${process.env.REACT_APP_BACKEND}/api/user`,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        try {
            const res = await instance.post('/register', {
                name,
                email,
                password,
            });
            console.log(res.data);
            setLoggedIn(true);
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (err) {
            console.log(err);
            setLoggedIn(false);
            setErrMsg(err.response.data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (loggedIn !== null) {
            const timer = setTimeout(() => {
                setLoggedIn(null);
                setErrMsg('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [loggedIn, errMsg]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
            {/* Toast Notification */}
            {loggedIn !== null && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl backdrop-blur-lg border transition-all duration-500 transform ${
                    loggedIn 
                        ? 'bg-green-500/10 border-green-500/20 text-green-100' 
                        : 'bg-red-500/10 border-red-500/20 text-red-100'
                }`}>
                    <div className="flex items-center gap-3">
                        {loggedIn ? (
                            <Check className="w-5 h-5 text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-medium">
                            {loggedIn ? 'Successfully registered!' : errMsg}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Container */}
            <div className="w-full max-w-md">
                {/* Glassmorphism Card */}
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-purple-500/20">
                                <MessageCircle className="w-8 h-8 text-purple-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Chatify</h1>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Join Chatify</h2>
                        <p className="text-gray-400">Create your account to start chatting</p>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Input */}
                        <div>
                            <label htmlFor="name" className="flex items-center gap-2 text-white font-medium mb-3">
                                <User className="w-4 h-4" />
                                Username
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your username"
                                className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                required
                            />
                        </div>

                        {/* Email Input */}
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
                                className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="flex items-center gap-2 text-white font-medium mb-3">
                                <Lock className="w-4 h-4" />
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <NavLink 
                                to="/" 
                                className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300 hover:underline"
                            >
                                Sign In
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;