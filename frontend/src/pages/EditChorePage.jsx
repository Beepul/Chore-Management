import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axiosConfig";

const EditChorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    dueDate: "",
    assignedTo: [],
  });

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/members");
      setMembers(response.data.data || []);
    } catch (error) {
      setMembers([]);
    }
  },[]);

  const fetchChore = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/chore/${id}`);
      const chore = response.data.data.chore;

      setFormData({
        title: chore.title || "",
        description: chore.description || "",
        category: chore.category || "",
        dueDate: chore.dueDate ? chore.dueDate.split("T")[0] : "",
        assignedTo: chore.assignedTo?.map((member) => member._id) || [],
      });
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to fetch chore");
    }
  },[id]);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchMembers(), fetchChore()]);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [fetchMembers, fetchChore]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignedMembers = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );

    setFormData((prev) => ({
      ...prev,
      assignedTo: selectedOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      const response = await axiosInstance.put(`/api/chore/${id}`, formData);

      alert(response.data.message || "Chore updated successfully");
      navigate("/chores");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update chore");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div>Loading chore...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow border">
      <h1 className="text-2xl font-bold mb-6">Edit Chore</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter chore title"
            className="w-full border rounded-md p-3 outline-none focus:ring-2 focus:ring-[#227F74]"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter chore description"
            className="w-full border rounded-md p-3 outline-none focus:ring-2 focus:ring-[#227F74]"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Cleaning, Cooking"
            className="w-full border rounded-md p-3 outline-none focus:ring-2 focus:ring-[#227F74]"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full border rounded-md p-3 outline-none focus:ring-2 focus:ring-[#227F74]"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Assign Members</label>
          <select
            multiple
            value={formData.assignedTo}
            onChange={handleAssignedMembers}
            className="w-full border rounded-md p-3 outline-none focus:ring-2 focus:ring-[#227F74] h-32"
          >
            {members.length > 0 ? (
              members.map((member) => (
                <option key={member._id} value={member.user?._id}>
                  {member.user?.fullname} ({member.role})
                </option>
              ))
            ) : (
              <option disabled>No members found</option>
            )}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitLoading}
            className="bg-[#227F74] text-white px-6 py-3 rounded-md hover:bg-[#1d6c62] disabled:opacity-60"
          >
            {submitLoading ? "Updating..." : "Update Chore"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/chores")}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditChorePage;