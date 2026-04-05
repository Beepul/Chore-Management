import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import MembersTable from "../components/MembersTable";
import { useAuth } from "../context/AuthContext";


const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/members");
            setMembers(response.data.data || []);
        } catch (error) {
            console.log(error);
        }finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleView = (member) => {
        alert(
        `Name: ${member.user?.fullname}\nEmail: ${member.user?.email}\nRole: ${member.role}`
        );
    };

  const handleRemove = async (member) => {
    const confirmRemove = window.confirm(
      `Remove ${member.user?.fullname} from household?`
    );

    if (!confirmRemove) return;

    try {
      const response = await axiosInstance.delete(`/api/members/${member._id}`);
      alert(response.data.message || "Member removed");
      fetchMembers();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to remove member");
    }
  };
 

  return (
    <div>
        <div className="flex items-center justify-between pb-5 mb-5 border-b">
            <h1 className="text-2xl font-bold">Member List</h1>
            {user.role === "admin" && (
                <Link to={"/members/invite"} className="bg-[#227F74] text-white inline-block py-3 px-6 rounded-md">Invite Member</Link>
            )}
        </div>
        {loading ? <div><p>Loading members...</p></div> : (
            <MembersTable
                members={members}
                onView={handleView}
                onRemove={handleRemove}
            />
        )}
    </div>
  );
};

export default Members;