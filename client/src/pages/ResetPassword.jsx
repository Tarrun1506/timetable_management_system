import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';
import {
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. No token provided.');
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await resetPassword(token, formData.password);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(result.message || 'Failed to reset password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-900 flex items-center justify-center px-4 bg-landing">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-gray-400 text-sm">Create a new secure password for your account</p>
                    </div>

                    {success ? (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-2xl text-green-300 flex flex-col items-center text-center">
                                <CheckCircle2 className="w-12 h-12 mb-3" />
                                <p className="font-semibold">Password Reset Successful!</p>
                                <p className="text-sm mt-1">Redirecting you to login...</p>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold transition-all hover:bg-blue-600"
                            >
                                Go to Login Now
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <div className="relative">
                                <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="New Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm New Password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !!error}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Resetting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Reset Password</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
