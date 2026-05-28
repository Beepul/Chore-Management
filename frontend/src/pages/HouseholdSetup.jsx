import React, { useState } from 'react'
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Navigate, redirect } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const HouseholdSetup = () => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const {user, authLoading, loadUser } = useAuth()

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if(!formData.name || !formData.description){
                throw new Error("Please fill out all the fields")
            }
            await axiosInstance.post('/api/household/setup', formData);
            await loadUser()
            alert('Household setup successful.');
            navigate('/dashboard')
        } catch (error) {
            alert(error.response?.data?.message || error.message || "Failed to create household");
        }
    }

    if(user.hasHousehold){
        return <Navigate to="/dashboard" replace />;
    }

    if(authLoading){
      return <div>Loading...</div>
    }

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Your household setup</h1>
        <input
          type="text"
          placeholder="Household name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button type="submit" className="w-full bg-[#227F74] text-white p-2 rounded">
          Submit
        </button>
      </form>
    </div>
  )
}

export default HouseholdSetup