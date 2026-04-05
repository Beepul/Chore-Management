import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const ChoreDetails = () => {
  const { id } = useParams();
  const [chore, setChore] = useState(null);
  const [subChores, setSubChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchChoreDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/chore/${id}`);
      setChore(response.data.data.chore);
      setSubChores(response.data.data.subChores || []);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to fetch chore details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (chore) => {
    navigate(`/chores/edit/${chore._id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chore?"
    );

    if (!confirmDelete) return;

    try {
      const response = await axiosInstance.delete(`/api/chore/${id}`);
      alert(response.data.message || "Chore deleted successfully");
      navigate("/chores");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete chore");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axiosInstance.patch(`/api/chore/${id}/status`, {
        status: newStatus,
      });

      alert(response.data.message || "Status updated successfully");

      setChore((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleSubStatusChange = async (subId, newStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/api/chore/${subId}/status`,
        { status: newStatus }
      );

      alert(response.data.message || "Status updated");

      setSubChores((prev) =>
        prev.map((sub) =>
          sub._id === subId ? { ...sub, status: newStatus } : sub
        )
      );
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update status");
    }
  };

  useEffect(() => {
    fetchChoreDetails();
  }, [id, fetchChoreDetails]);

  if (loading) {
    return <div>Loading chore details...</div>;
  }

  if (!chore) {
    return <div>Chore not found</div>;
  }

  const isAssignedToCurrentUser = chore?.assignedTo?.some(
    (member) => member._id === user?.user._id
  );

  return (
    <div className="max-w-4xl mx-auto bg-white border rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-6">Chore Details</h1>

        {user.role === "admin" && (
          <div>
            <button
              onClick={() => handleEdit(chore)}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 mr-4"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-8">
        <div>
          <span className="font-semibold">Title: </span>
          {chore.title}
        </div>

        <div>
          <span className="font-semibold">Description: </span>
          {chore.description || "-"}
        </div>

        <div>
          <span className="font-semibold">Category: </span>
          {chore.category || "-"}
        </div>

        <div>
          <span className="font-semibold">Status: </span>
          {chore.status}

          {isAssignedToCurrentUser && (
            <div className="mt-3 flex gap-3">
              {chore.status === "pending" && (
                <button
                  onClick={() => handleStatusChange("in_progress")}
                  className="px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  Start Task
                </button>
              )}

              {chore.status !== "completed" && (
                <button
                  onClick={() => handleStatusChange("completed")}
                  className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Mark Completed
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <span className="font-semibold">Due Date: </span>
          {chore.dueDate
            ? new Date(chore.dueDate).toLocaleDateString()
            : "-"}
        </div>

        <div>
          <span className="font-semibold">Assigned Members: </span>
          {chore.assignedTo?.length > 0
            ? chore.assignedTo.map((member) => member.fullname).join(", ")
            : "-"}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Sub-Chores</h2>

        {subChores.length > 0 ? (
          <div className="space-y-4">
            {subChores.map((sub) => {
              const isAssigned = sub.assignedTo?.some(
                (member) => member._id === user?._id
              );

              return (
                <div key={sub._id} className="border rounded-md p-4 bg-gray-50">
                  <p className="font-medium">{sub.title}</p>

                  <p className="text-sm text-gray-600">
                    Description: {sub.description || "-"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Category: {sub.category || "-"}
                  </p>

                  <div className="text-sm text-gray-600">
                    <span>Status: {sub.status}</span>

                    {isAssigned && (
                      <div className="mt-2 flex gap-2">
                        {sub.status === "pending" && (
                          <button
                            onClick={() =>
                              handleSubStatusChange(sub._id, "in_progress")
                            }
                            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded"
                          >
                            Start
                          </button>
                        )}

                        {sub.status !== "completed" && (
                          <button
                            onClick={() =>
                              handleSubStatusChange(sub._id, "completed")
                            }
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    Due Date:{" "}
                    {sub.dueDate
                      ? new Date(sub.dueDate).toLocaleDateString()
                      : "-"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Assigned To:{" "}
                    {sub.assignedTo?.length > 0
                      ? sub.assignedTo.map((member) => member.fullname).join(", ")
                      : "-"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No sub-chore found.</p>
        )}
      </div>
    </div>
  );
};

export default ChoreDetails;