
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Chores = () => {
  const {user} = useAuth()

 

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
    </div>
  );
};

export default Chores;