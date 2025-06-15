import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Crown, Star, Zap, Shield, MessageCircle, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PaymentGateway = () => {
    const [amount, setAmount] = useState(99);
    const [user, setUser] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState('premium');
    const [customAmount, setCustomAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAlert, setAlert] = useState(null);
    const [msg, setMsg] = useState("");
    const token = sessionStorage.getItem('jwt');

    const plans = [
        {
            id: 'free',
            name: 'Free Support',
            price: 49,
            icon: <MessageCircle className="w-6 h-6" />,
            color: 'from-blue-500 to-cyan-500',
            features: [
                'Support app development',
                'Help maintain servers',
                'Show appreciation',
                'Basic contributor badge'
            ]
        },
        {
            id: 'premium',
            name: 'Premium Support',
            price: 99,
            icon: <Star className="w-6 h-6" />,
            color: 'from-purple-500 to-pink-500',
            popular: true,
            features: [
                'Priority feature requests',
                'Premium contributor badge',
                'Early access to new features',
                'Direct developer contact',
                'Custom themes (coming soon)'
            ]
        },
        {
            id: 'pro',
            name: 'Pro Supporter',
            price: 199,
            icon: <Crown className="w-6 h-6" />,
            color: 'from-yellow-500 to-orange-500',
            features: [
                'All Premium features',
                'Pro supporter badge',
                'Feature voting rights',
                'Beta testing access',
                'Monthly progress updates',
                'Custom emoji packs'
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 499,
            icon: <Shield className="w-6 h-6" />,
            color: 'from-green-500 to-emerald-500',
            features: [
                'All Pro features',
                'Enterprise supporter badge',
                'Direct influence on roadmap',
                'Private Discord channel',
                'Custom integrations',
                'Priority bug fixes',
                'Lifetime supporter status'
            ]
        }
    ];

    useEffect(() => {
        const instance = axios.create({
            baseURL: `${process.env.REACT_APP_BACKEND}/api/chat`,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        });

        const getUser = async () => {
            try {
                const res = await instance.get('/fetchChat');
                setUser(res.data.user);
            } catch (err) {
                console.log(err);
                if (err.response.status === 301) {
                    window.location.href = '/';
                }
            }
        };
        getUser();
    }, []);

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan.id);
        setAmount(plan.price);
        setCustomAmount('');
    };

    const handleCustomAmount = (value) => {
        setCustomAmount(value);
        setAmount(parseInt(value) || 0);
        setSelectedPlan('custom');
    };

    const handlePayment = async (paymentAmount) => {
        if (paymentAmount < 1) {
            setAlert(false);
            setMsg('Please enter a valid amount');
            setTimeout(() => setAlert(null), 4000);
            return;
        }

        setIsProcessing(true);
        
        try {
            const res_data = await axios.get(`${process.env.REACT_APP_BACKEND}/api/getkey`);
            const key = res_data.data.key;

            const res_order = await axios.post(`${process.env.REACT_APP_BACKEND}/api/payment/checkout`, { amount: paymentAmount });
            const order = res_order.data.order;

            const selectedPlanData = plans.find(p => p.id === selectedPlan);
            const planName = selectedPlanData ? selectedPlanData.name : 'Custom Support';

            const options = {
                key,
                amount: order.amount,
                currency: "INR",
                name: "Chatify",
                description: `${planName} - Thank you for supporting Chatify!`,
                image: "/vite.svg",
                order_id: order.id,
                callback_url: `${process.env.REACT_APP_BACKEND}/api/payment/verification`,
                prefill: {
                    name: user?.name || "Supporter",
                    email: user?.email || "supporter@chatify.com",
                    contact: "9999999999"
                },
                notes: {
                    "plan": planName,
                    "user_id": user?._id || "anonymous"
                },
                theme: {
                    "color": "#6366f1"
                }
            };

            const razor = new window.Razorpay(options);
            razor.open();
            
            setAlert(true);
            setMsg('Payment gateway opened successfully!');
            setTimeout(() => setAlert(null), 4000);
        } catch (error) {
            console.error('Payment error:', error);
            setAlert(false);
            setMsg('Failed to initiate payment. Please try again.');
            setTimeout(() => setAlert(null), 4000);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen overflow-y-scroll bg-gradient-to-br from-gray-900 via-black to-gray-900">
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

            {/* Header */}
            <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => window.location.href = '/chat'}
                            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-105"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <MessageCircle className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">Chatify</div>
                                <div className="text-gray-400 text-sm">Support & Premium Features</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 mb-6">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Support Chatify Development</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Help Us Build Better
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Your support helps us maintain servers, add new features, and keep Chatify free for everyone. 
                        Choose a support tier that works for you.
                    </p>
                </div>

                {/* Pricing Plans */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => handlePlanSelect(plan)}
                            className={`relative p-6 rounded-3xl border cursor-pointer transition-all duration-300 hover:scale-105 ${
                                selectedPlan === plan.id
                                    ? 'bg-white/10 border-white/30 ring-2 ring-blue-500/50'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
                                {plan.icon}
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                                <span className="text-gray-400">INR</span>
                            </div>

                            <ul className="space-y-2 mb-6">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className={`w-full py-3 px-4 rounded-2xl text-center font-medium transition-all duration-300 ${
                                selectedPlan === plan.id
                                    ? `bg-gradient-to-r ${plan.color} text-white`
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            }`}>
                                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Custom Amount Section */}
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-green-500/20">
                            <CreditCard className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Custom Support Amount</h2>
                            <p className="text-gray-400 text-sm">Enter any amount you'd like to contribute</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 items-end">
                        <div>
                            <label htmlFor="customAmount" className="block text-white font-medium mb-3">
                                Custom Amount (INR)
                            </label>
                            <input
                                id="customAmount"
                                type="number"
                                value={customAmount}
                                onChange={(e) => handleCustomAmount(e.target.value)}
                                placeholder="Enter amount (minimum ₹1)"
                                min="1"
                                className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                            />
                        </div>

                        <button
                            onClick={() => handlePayment(amount)}
                            disabled={isProcessing || amount < 1}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Pay ₹{amount}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Why Support Chatify?</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Server Maintenance</h3>
                            <p className="text-gray-400 text-sm">Keep our servers running smoothly and ensure 99.9% uptime for all users.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">New Features</h3>
                            <p className="text-gray-400 text-sm">Fund development of exciting new features like voice calls, file sharing, and more.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Free for Everyone</h3>
                            <p className="text-gray-400 text-sm">Your support helps us keep Chatify completely free for all users worldwide.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentGateway;