import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const AdminDashboardView = () => {
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    totalChores: 0,
    pendingChores: 0,
    completedChores: 0,
    recentChores: [],
    recentMembers: [],
    invitations: [],
  });

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/dashboard/admin");
      setDashboardData(response.data.data);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    if (status === "completed") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "in_progress") {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }

    if (status === "overdue" || status === "expired") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (status === "accepted") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 shadow-lg">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full"></div>

        <div className="relative">
          <p className="text-purple-100 font-medium mb-2">Welcome back, Admin</p>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {user?.household?.name}'s Dashboard
          </h1>

          <p className="text-purple-100 max-w-2xl">
            Manage your household members, chores, and invitations from one
            place.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Members
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-1">Total Members</p>
          <h2 className="text-4xl font-bold text-gray-800">
            {dashboardData.totalMembers}
          </h2>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">🧹</span>
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Chores
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-1">Total Chores</p>
          <h2 className="text-4xl font-bold text-gray-800">
            {dashboardData.totalChores}
          </h2>
        </div>

        <div className="bg-white border border-yellow-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
              Pending
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-1">Pending Chores</p>
          <h2 className="text-4xl font-bold text-gray-800">
            {dashboardData.pendingChores}
          </h2>
        </div>

        <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
              Done
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-1">Completed Chores</p>
          <h2 className="text-4xl font-bold text-gray-800">
            {dashboardData.completedChores}
          </h2>
        </div>
      </div>

      {/* Chores and Members */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* Recent Chores */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Recently Created Chores
              </h2>
              <p className="text-sm text-gray-500">
                Latest chores created in your household
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
          </div>

          {dashboardData.recentChores.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentChores.map((chore) => (
                <div
                  key={chore._id}
                  className="border border-gray-100 rounded-2xl p-4 bg-gradient-to-r from-purple-50 to-white hover:shadow-sm transition"
                >
                  <div className="flex justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {chore.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Category: {chore.category || "-"}
                      </p>
                    </div>

                    <span
                      className={`h-fit text-xs font-semibold px-3 py-1 rounded-full border capitalize ${getStatusBadge(
                        chore.status
                      )}`}
                    >
                      {chore.status?.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    Created: {new Date(chore.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50">
              <p className="text-gray-500">No recent chores found.</p>
            </div>
          )}
        </div>

        {/* Recent Members */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Recently Added Members
              </h2>
              <p className="text-sm text-gray-500">
                New members in your household
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
          </div>

          {dashboardData.recentMembers.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentMembers.map((member) => (
                <div
                  key={member._id}
                  className="border border-gray-100 rounded-2xl p-4 bg-gradient-to-r from-indigo-50 to-white hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {member.user?.fullname}
                      </p>
                      <p className="text-sm text-gray-500 break-all">
                        {member.user?.email}
                      </p>
                    </div>

                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 capitalize">
                      {member.role}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    Joined: {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50">
              <p className="text-gray-500">No recent members found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Invitations */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-purple-100 rounded-3xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Invitations</h2>
            <p className="text-sm text-gray-500">
              Track invited members and their invitation status
            </p>
          </div>

          <span className="bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
            {dashboardData.invitations?.length || 0} Invites
          </span>
        </div>

        {dashboardData.invitations && dashboardData.invitations.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {dashboardData.invitations.map((invitation) => (
              <div
                key={invitation._id}
                className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Invited Email</p>
                    <p className="font-semibold text-gray-800 break-all">
                      {invitation.email}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${getStatusBadge(
                      invitation.status
                    )}`}
                  >
                    {invitation.status}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium text-indigo-700 capitalize">
                      {invitation.role}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Invited At</span>
                    <span className="text-gray-700">
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {invitation.expiresAt && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Expires At</span>
                      <span className="text-gray-700">
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-purple-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✉️</span>
            </div>
            <p className="font-medium text-gray-700">No invitations found</p>
            <p className="text-sm text-gray-500">
              Invited members will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardView;