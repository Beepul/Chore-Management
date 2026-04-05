import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
    const {user} = useAuth()

    if(user) return <Navigate to={'/dashboard'} replace />
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800">

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-8 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Manage Household Chores
            <span className="text-[#227F74]"> Smarter</span>
          </h2>

          <p className="text-lg text-gray-600 mb-8 leading-8">
            ChoreMaster helps families and house members stay organized by
            assigning chores, tracking progress, and managing household tasks in
            one simple place.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="bg-[#227F74] text-white px-6 py-3 rounded-md text-lg hover:bg-[#1c695f] transition"
            >
              Create Account
            </Link>

            <Link
              to="/login"
              className="border border-[#227F74] text-[#227F74] px-6 py-3 rounded-md text-lg hover:bg-[#227F74] hover:text-white transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border">
          <img
            src="/logo.png"
            alt="ChoreMaster"
            className="w-40 mx-auto mb-6"
          />

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#E8F6F3] border">
              <h3 className="font-semibold text-lg mb-1">Assign Chores</h3>
              <p className="text-sm text-gray-600">
                Easily assign chores to household members.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F4F8FB] border">
              <h3 className="font-semibold text-lg mb-1">Track Progress</h3>
              <p className="text-sm text-gray-600">
                Keep track of pending, ongoing, and completed tasks.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#FFF7ED] border">
              <h3 className="font-semibold text-lg mb-1">Manage Members</h3>
              <p className="text-sm text-gray-600">
                Invite and organize members inside your household.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose ChoreMaster?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-3 text-[#227F74]">
              Household Management
            </h3>
            <p className="text-gray-600 leading-7">
              Create and manage your household with an organized structure.
            </p>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-3 text-[#227F74]">
              Chore Assignment
            </h3>
            <p className="text-gray-600 leading-7">
              Assign chores and even create sub-chores for better task division.
            </p>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-3 text-[#227F74]">
              Easy Tracking
            </h3>
            <p className="text-gray-600 leading-7">
              Monitor progress and see who is responsible for what.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} ChoreMaster. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;