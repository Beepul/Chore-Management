import React from "react";
import { useAuth } from "../context/AuthContext";

const MembersTable = ({ members, onView, onChangeRole, onRemove }) => {
  const {user} = useAuth()
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border">
      <table className="min-w-full text-left">
        <thead className="bg-gray-100 text-gray-700 text-sm">
          <tr>
            <th className="px-4 py-3">Full Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Joined At</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {members.length > 0 ? (
            members.map((member) => (
              <tr key={member._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {member.user?.fullname || "-"}
                </td>
                <td className="px-4 py-3">{member.user?.email || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {member.joinedAt
                    ? new Date(member.joinedAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                        <button
                        onClick={() => onView(member)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                        View
                        </button>

                        {user.role === "admin" && (
                          <button
                              onClick={() => onRemove(member)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                              Remove
                          </button>
                        )}
                    </div>
                    </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                No members found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MembersTable;