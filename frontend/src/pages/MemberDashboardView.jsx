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
  const {user} = useAuth()

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

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Hi, {user?.user.fullname} 👋</h1>
        <p className="text-gray-600">
          Overview of your assigned chores and progress.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-5">
        <div className="bg-white border rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-2">Assigned Chores</p>
          <h2 className="text-3xl font-bold">{dashboardData.totalAssignedChores}</h2>
        </div>

        <div className="bg-white border rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-2">Pending</p>
          <h2 className="text-3xl font-bold">{dashboardData.pendingChores}</h2>
        </div>

        <div className="bg-white border rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-2">In Progress</p>
          <h2 className="text-3xl font-bold">{dashboardData.inProgressChores}</h2>
        </div>

        <div className="bg-white border rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-2">Completed</p>
          <h2 className="text-3xl font-bold">{dashboardData.completedChores}</h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold mb-4">My Assigned Chores</h2>

          {dashboardData.assignedChores.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.assignedChores.map((chore) => (
                <div key={chore._id} className="border rounded-md p-4 bg-gray-50">
                  <p className="font-medium">{chore.title}</p>
                  <p className="text-sm text-gray-600">
                    Category: {chore.category || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {chore.status}
                  </p>
                  <p className="text-sm text-gray-500">
                    Due Date:{" "}
                    {chore.dueDate
                      ? new Date(chore.dueDate).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No assigned chores found.</p>
          )}
        </div>

        <div className="bg-white border rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Upcoming Chores</h2>

          {dashboardData.upcomingChores.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.upcomingChores.map((chore) => (
                <div key={chore._id} className="border rounded-md p-4 bg-gray-50">
                  <p className="font-medium">{chore.title}</p>
                  <p className="text-sm text-gray-600">
                    Status: {chore.status}
                  </p>
                  <p className="text-sm text-gray-500">
                    Due Date:{" "}
                    {chore.dueDate
                      ? new Date(chore.dueDate).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming chores found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardView;