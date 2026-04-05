import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const NewUserDashboardView = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  const fetchInvitations = async () => {
    try {
      const response = await axiosInstance.get("/api/invitation/my");
      setInvitations(response.data.data || []);
    } catch (error) {
      console.log(error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
        try {
            await axiosInstance.post(`/api/invitation/accept/${invitationId}`);

            const profileRes = await axiosInstance.get("/api/auth/profile");

            login(profileRes.data.data);

            navigate("/dashboard");
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to accept invitation");
        }
    };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome</h1>
          <p className="text-gray-600">
            You are not part of any household yet. Create your own household or
            choose an invitation to join.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">
              Create your own household
            </h2>
            <p className="text-gray-600 mb-5">
              Start a new household and become its admin.
            </p>

            <button
              onClick={() => navigate("/setup-household")}
              className="bg-[#227F74] text-white px-5 py-3 rounded-md hover:bg-[#1d6c62]"
            >
              Create Household
            </button>
          </div>

          <div className="bg-white border rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">
              Accept your invitations
            </h2>

            {loading ? (
              <p className="text-gray-500">Loading invitations...</p>
            ) : invitations.length > 0 ? (
              <div className="space-y-4">
                {invitations.map((invite) => (
                  <div
                    key={invite._id}
                    className="border rounded-md p-4 bg-gray-50"
                  >
                    <p className="font-medium text-lg">
                      {invite.household?.name}
                    </p>

                    <p className="text-sm text-gray-600">
                      Invited by: {invite.invitedBy?.fullname}
                    </p>

                    <p className="text-sm text-gray-500 mb-3">
                      Expires:{" "}
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>

                    <button
                        onClick={() => handleAccept(invite._id)}
                        className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      Accept Invitation
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pending invitations found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUserDashboardView;