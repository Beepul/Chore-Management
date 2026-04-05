import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const SettingsPage = () => {
  const { user, login } = useAuth();

  const [profileData, setProfileData] = useState({
    fullname: "",
  });

  const [householdData, setHouseholdData] = useState({
    name: user?.household?.name || "",
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.put("/api/settings/profile", profileData);
      alert(response.data.message || "Profile updated");

      const profileRes = await axiosInstance.get("/api/auth/profile");
      login(profileRes.data.data);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update profile");
    }
  };


  const handleHouseholdSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.put(
        "/api/settings/household-name",
        householdData
      );
      alert(response.data.message || "Household name updated");

      const profileRes = await axiosInstance.get("/api/auth/profile");
      login(profileRes.data.data);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update household name");
    }
  };

  useEffect(() => {
    if (user?.user?.fullname) {
      setProfileData({
        fullname: user.user.fullname,
      });
    }
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <div className="bg-white border rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Update Full Name</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <input
            type="text"
            value={profileData.fullname}
            onChange={(e) =>
              setProfileData({ ...profileData, fullname: e.target.value })
            }
            className="w-full border rounded-md p-3"
            placeholder="Enter full name"
          />
          <button
            type="submit"
            className="bg-[#227F74] text-white px-5 py-3 rounded-md"
          >
            Update Profile
          </button>
        </form>
      </div>


      {user.role === "admin" && (
        <div className="bg-white border rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Update Household Name</h2>
            <form onSubmit={handleHouseholdSubmit} className="space-y-4">
            <input
                type="text"
                value={householdData.name}
                onChange={(e) =>
                setHouseholdData({ ...householdData, name: e.target.value })
                }
                className="w-full border rounded-md p-3"
                placeholder="Enter household name"
            />
            <button
                type="submit"
                className="bg-[#227F74] text-white px-5 py-3 rounded-md"
            >
                Update Household Name
            </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;