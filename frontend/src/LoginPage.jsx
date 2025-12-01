import React, { useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [role, setRole] = useState('user'); // 'user' or 'admin'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Phone/Creds, 2: OTP (for user)
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        // Validate phone number
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }
        try {
            await api.post('/auth/send-otp', { phone });
            setStep(2);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await api.post('/auth/verify-otp', { phone, code: otp });
            login(res.data.token);
            navigate('/');
        } catch (error) {
            alert('Invalid OTP');
        }
    };

    const handleAdminLogin = async () => {
        try {
            const res = await api.post('/admin/login', { username, password });
            login(res.data.token);
            navigate('/admin/dashboard');
        } catch (error) {
            alert('Invalid Credentials');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                    {role === 'user' ? 'Voter Login' : 'Admin Login'}
                </h2>

                <div className="flex justify-center mb-6">
                    <button
                        className={`px-4 py-2 rounded-l-lg ${role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => { setRole('user'); setStep(1); }}
                    >
                        Voter
                    </button>
                    <button
                        className={`px-4 py-2 rounded-r-lg ${role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setRole('admin')}
                    >
                        Admin
                    </button>
                </div>

                {role === 'user' ? (
                    <>
                        {step === 1 ? (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your phone number"
                                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleSendOtp}
                                    className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition duration-200"
                                >
                                    Send OTP
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">OTP</label>
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleVerifyOtp}
                                    className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition duration-200"
                                >
                                    Verify & Login
                                </button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full mt-2 text-blue-600 hover:underline text-sm text-center"
                                >
                                    Back to Phone Number
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                            <input
                                type="text"
                                placeholder="Admin Username"
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                            <input
                                type="password"
                                placeholder="Admin Password"
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleAdminLogin}
                            className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 transition duration-200"
                        >
                            Login as Admin
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
