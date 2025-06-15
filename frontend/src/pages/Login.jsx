import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Lock, LogIn, MessageCircle, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { setUser } from '../redux/userslice';
import { useDispatch } from 'react-redux';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const [data, setData] = useState(null);
    const [loggedIn, setLoggedIn] = useState(null);
    const [errMsg, setErrMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (data !== null) {
            sessionStorage.setItem('jwt', data.user.token);
        }
    }, [data]);

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
            const res = await instance.post('/login', {
                email,
                password,
            });
            console.log(res.data);
            setData(res.data);
            setLoggedIn(true);
            setTimeout(() => {
                window.location.href = '/chat';
            }, 1500);
        } catch (err) {
            setLoggedIn(false);
            console.log(err);
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
                            {loggedIn ? 'Successfully logged in' : errMsg}
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
                            <div className="p-3 rounded-2xl bg-blue-500/20">
                                <MessageCircle className="w-8 h-8 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Chatify</h1>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">Sign in to continue your conversations</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
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
                                className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <NavLink 
                                to="/signup" 
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300 hover:underline"
                            >
                                Create Account
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;