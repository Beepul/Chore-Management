import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const MemberDashboardView = () => {
  const [dashboardData, setDashboardData] = useState({
    totalAssignedChores: 0,
    pendingChores: 0,
    inProgressChores: 0,
    completedChores: 0,
    assignedChores: [],
    upcomingChores: [],
  });

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/dashboard/member");
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

    if (status === "overdue") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-lg">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full"></div>

        <div className="relative">
          <p className="text-indigo-100 font-medium mb-2">
            Member Dashboard
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Hi, {user?.user?.fullname || "Member"} 👋
          </h1>

          <p className="text-indigo-100 max-w-2xl">
            Here is an overview of your assigned chores, upcoming tasks, and
            progress.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>

            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Assigned
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-1">Assigned Chores</p>
          <h2 className="text-4xl font-bold text-gray-800">
            {dashboardData.totalAssignedChores}
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

          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <h2 className="text-4xl font-bold text-gray-800">
            {dashboardData.pendingChores}
          </h2>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>

            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              Active
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-1">In Progress</p>
          <h2 className="text-4xl font-bold text-gray-800">
            {dashboardData.inProgressChores}
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

          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <h2 className="text-4xl font-bold text-gray-800">
            {dashboardData.completedChores}
          </h2>
        </div>
      </div>

      {/* Chore Lists */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* Assigned Chores */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                My Assigned Chores
              </h2>
              <p className="text-sm text-gray-500">
                Chores currently assigned to you
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <span className="text-xl">🧹</span>
            </div>
          </div>

          {dashboardData.assignedChores.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.assignedChores.map((chore) => (
                <div
                  key={chore._id}
                  className="border border-gray-100 rounded-2xl p-4 bg-gradient-to-r from-indigo-50 to-white hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {chore.title}
                      </p>

                      <p className="text-sm text-gray-500">
                        Category: {chore.category || "-"}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${getStatusBadge(
                        chore.status
                      )}`}
                    >
                      {chore.status?.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Due Date</span>
                    <span className="font-medium text-gray-700">
                      {chore.dueDate
                        ? new Date(chore.dueDate).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📭</span>
              </div>
              <p className="font-medium text-gray-700">
                No assigned chores found
              </p>
              <p className="text-sm text-gray-500">
                Your assigned chores will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Chores */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border border-purple-100 rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Upcoming Chores
              </h2>
              <p className="text-sm text-gray-500">
                Chores sorted by nearest due date
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
          </div>

          {dashboardData.upcomingChores.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.upcomingChores.map((chore) => (
                <div
                  key={chore._id}
                  className="bg-white border border-purple-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {chore.title}
                      </p>

                      <p className="text-sm text-gray-500">
                        Category: {chore.category || "-"}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${getStatusBadge(
                        chore.status
                      )}`}
                    >
                      {chore.status?.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Due Date</span>
                    <span className="font-medium text-purple-700">
                      {chore.dueDate
                        ? new Date(chore.dueDate).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-purple-200 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎉</span>
              </div>
              <p className="font-medium text-gray-700">No upcoming chores</p>
              <p className="text-sm text-gray-500">
                You are all caught up for now.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardView;