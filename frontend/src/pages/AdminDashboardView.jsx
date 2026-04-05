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
  });
  const {user} = useAuth()

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

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">{user.household.name}'s Admin Dashboard</h1>
        <p className="text-gray-600">
          Overview of your household activities and members.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-5">
        <div className="bg-white border rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-2">Total Members</p>
          <h2 className="text-3xl font-bold">{dashboardData.totalMembers}</h2>
        </div>

        <div className="bg-white border rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-2">Total Chores</p>
          <h2 className="text-3xl font-bold">{dashboardData.totalChores}</h2>
        </div>

        <div className="bg-white border rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-2">Pending Chores</p>
          <h2 className="text-3xl font-bold">{dashboardData.pendingChores}</h2>
        </div>

        <div className="bg-white border rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-2">Completed Chores</p>
          <h2 className="text-3xl font-bold">{dashboardData.completedChores}</h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Chores */}
        <div className="bg-white border rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Recently Created Chores</h2>

          {dashboardData.recentChores.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentChores.map((chore) => (
                <div key={chore._id} className="border rounded-md p-4 bg-gray-50">
                  <p className="font-medium">{chore.title}</p>
                  <p className="text-sm text-gray-600">
                    Category: {chore.category || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {chore.status}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(chore.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent chores found.</p>
          )}
        </div>

        {/* Recent Members */}
        <div className="bg-white border rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Recently Added Members</h2>

          {dashboardData.recentMembers.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentMembers.map((member) => (
                <div key={member._id} className="border rounded-md p-4 bg-gray-50">
                  <p className="font-medium">{member.user?.fullname}</p>
                  <p className="text-sm text-gray-600">
                    Email: {member.user?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Role: {member.role}
                  </p>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent members found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;