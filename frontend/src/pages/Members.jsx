import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const Members = () => {
    const {user} = useAuth();

 

  return (
    <div>
        <div className="flex items-center justify-between pb-5 mb-5 border-b">
            <h1 className="text-2xl font-bold">Member List</h1>
            {user.role === "admin" && (
                <Link to={"/members/invite"} className="bg-[#227F74] text-white inline-block py-3 px-6 rounded-md">Invite Member</Link>
            )}
        </div>
    </div>
  );
};

export default Members;