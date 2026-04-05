import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, redirect, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, user, authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      if (response.status === 200) {
        const token = response.data.data.token;
        localStorage.setItem("token", token);

        const myData = await axiosInstance.get("/api/auth/profile");
        login(myData.data.data);
        navigate('/dashboard')
      }
    } catch (error) {
      alert('Login failed. Please try again. ' + error?.response?.data.message);
    }
  };

  if(authLoading){
    return <div>Loading...</div>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button type="submit" className="w-full bg-[#227F74] text-white p-2 rounded-md hover:bg-[#1c695f] hover:text-white transition">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
