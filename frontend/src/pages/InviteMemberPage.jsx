import React, { useState } from "react";
import axiosInstance from "../axiosConfig";

const InviteMemberPage = () => {
  const [email, setEmail] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setJoinLink("");

    try {
      const response = await axiosInstance.post("/api/invitation/invite", {
        email,
      });

      setMessage(response.data.message || "Invitation created successfully");
      setJoinLink(response.data.data.joinLink);
      setEmail("");
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to create invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      alert("Invitation link copied");
    } catch (error) {
      alert("Failed to copy link");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-2">Invite Member</h1>
      <p className="text-gray-600 mb-6">
        Enter the member’s email to generate an invitation link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Member Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter member email"
            className="w-full border rounded-md p-3 outline-none focus:ring-2 focus:ring-[#227F74]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#227F74] text-white px-5 py-3 rounded-md hover:bg-[#1d6c62] disabled:opacity-60"
        >
          {loading ? "Creating..." : "Invite Member"}
        </button>
      </form>

      {message && (
        <div className="mt-4 text-sm font-medium text-gray-700">{message}</div>
      )}

      {joinLink && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <p className="font-medium mb-2">Invitation Link</p>
          <div className="break-all text-sm text-gray-700 mb-3">{joinLink}</div>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
};

export default InviteMemberPage;