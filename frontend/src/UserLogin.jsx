import React, { useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        try {
            await api.post('/auth/send-otp', { phone });
            setStep(2);
        } catch (error) {
            alert('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await api.post('/auth/verify-otp', { phone, code: otp });
            login(res.data.token);
            navigate('/dashboard');
        } catch (error) {
            alert('Invalid OTP');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">User Login</h2>
                {step === 1 ? (
                    <>
                        <input
                            type="text"
                            placeholder="Phone Number"
                            className="w-full p-2 border rounded mb-4"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <button
                            onClick={handleSendOtp}
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                            Send OTP
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            className="w-full p-2 border rounded mb-4"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            onClick={handleVerifyOtp}
                            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                        >
                            Verify OTP
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserLogin;
