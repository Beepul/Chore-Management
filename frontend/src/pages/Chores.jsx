import { useEffect, useState } from "react";
import ChoreTable from "../components/ChoresTable";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const Chores = () => {
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  const {user} = useAuth()

  const fetchChores = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/chore");
      setChores(response.data.data || []);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to fetch chores");
      setChores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChores();
  }, []);

  const handleView = (chore) => {
    navigate(`/chores/${chore._id}`);
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

      setChores((prev) => prev.filter((chore) => chore._id !== id));
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete chore");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-5 mb-5 border-b">
        <h1 className="text-2xl font-bold">Chore List</h1>
        {user.role === "admin" && (
            <Link
            to="/chores/create"
            className="bg-[#227F74] text-white inline-block py-3 px-6 rounded-md"
            >
            Add New Chore
            </Link>
        )}
      </div>

      {loading ? (
        <div>Loading chores...</div>
      ) : (
        <ChoreTable
          chores={chores}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Chores;