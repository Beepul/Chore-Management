import { useNavigate } from "react-router-dom";

const NewUserDashboardView = () => {
  const navigate = useNavigate();


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

        </div>
      </div>
    </div>
  );
};

export default NewUserDashboardView;