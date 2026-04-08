import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";

const CreateChorePage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    dueDate: "",
    assignedTo: [],
    parentChore: "",
  });

  const [members, setMembers] = useState([]);
  const [mainChores, setMainChores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/members");
      setMembers(response.data.data || []);
    } catch (error) {
      console.log("Failed to fetch members", error);
      setMembers([]);
    }
  },[]);

  const fetchMainChores = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/chore/main");
      setMainChores(response.data.data || []);
    } catch (error) {
      console.log("Failed to fetch chores", error);
      setMainChores([]);
    }
  },[]);

  useEffect(() => {
     const fetchPageData = async () => {
        try {
          setPageLoading(true);
          await Promise.all([fetchMembers(), fetchMainChores()]);
        } finally {
          setPageLoading(false);
        }
      };

      fetchPageData();
  }, [fetchMembers, fetchMainChores]);

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
      setLoading(true);

      const payload = {
        ...formData,
        parentChore: formData.parentChore || null,
      };

      const response = await axiosInstance.post("/api/chore/create", payload);

      alert(response.data.message || "Chore created successfully");

      setFormData({
        title: "",
        description: "",
        category: "",
        dueDate: "",
        assignedTo: [],
        parentChore: "",
      });

      await fetchMainChores();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create chore");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow border">
      <h1 className="text-2xl font-bold mb-6">Create Chore</h1>

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
            placeholder="Enter chore description"
            rows="4"
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
          <p className="text-sm text-gray-500 mt-1">
            Hold Ctrl (Windows) or Command (Mac) to select multiple members.
          </p>
        </div>

        <div>
          <label className="block mb-2 font-medium">Parent Chore (Optional)</label>
          <select
            name="parentChore"
            value={formData.parentChore}
            onChange={handleChange}
            className="w-full border rounded-md p-3 outline-none focus:ring-2 focus:ring-[#227F74]"
          >
            <option value="">None (Main Chore)</option>
            {mainChores.map((chore) => (
              <option key={chore._id} value={chore._id}>
                {chore.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#227F74] text-white px-6 py-3 rounded-md hover:bg-[#1d6c62] disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Chore"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChorePage;