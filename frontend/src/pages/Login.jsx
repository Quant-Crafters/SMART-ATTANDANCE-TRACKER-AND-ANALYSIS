import React, { useState } from 'react';
import { Mail, Lock, LogIn, Gauge } from 'lucide-react';
// import apiClient from '../api/client'; // Commented out real API for now
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await apiClient.post('/login', {
      email,
      password,
    });

    console.log('LOGIN RESPONSE:', response.data);

   const data =
  response.data?.data ||
  response.data;

const token =
  data?.token ||
  data?.access_token;

const user =
  data?.user;

if (!token) {
  throw new Error(
    'Login succeeded but no token was returned.'
  );
}

localStorage.setItem(
  'token',
  token
);

if (user) {
  localStorage.setItem(
    'user',
    JSON.stringify(user)
  );
}

navigate('/dashboard');
  } catch (err) {
    console.error('Login failed:', err);

    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Invalid email or password.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1c202a] rounded-2xl shadow-xl border border-gray-800/50 p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-900/20">
            <Gauge size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm">Sign in to Smart Attendance System</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#11131a] text-white rounded-xl pl-10 pr-4 py-3 border border-gray-700/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="admin@college.edu"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#11131a] text-white rounded-xl pl-10 pr-4 py-3 border border-gray-700/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-900/20 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Checking...</span>
            ) : (
              <>
                <LogIn size={20} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;