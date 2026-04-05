import React from "react";
import { useAuth } from "../context/AuthContext";

const ChoreTable = ({ chores, onView, onEdit, onDelete }) => {
  const {user} = useAuth()
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border">
      <table className="min-w-full text-left">
        <thead className="bg-gray-100 text-gray-700 text-sm">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Parent Chore</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Assigned To</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {chores.length > 0 ? (
            chores.map((chore) => (
              <tr key={chore._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{chore.title}</td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      chore.parentChore
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {chore.parentChore ? "Sub-Chore" : "Main Chore"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {chore.parentChore?.title || "-"}
                </td>

                <td className="px-4 py-3">{chore.category || "-"}</td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      chore.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : chore.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : chore.status === "overdue"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {chore.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {chore.dueDate
                    ? new Date(chore.dueDate).toLocaleDateString()
                    : "-"}
                </td>

                <td className="px-4 py-3">
                  {chore.assignedTo?.length > 0
                    ? chore.assignedTo.map((member) => member.fullname).join(", ")
                    : "-"}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onView(chore)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View
                    </button>

                    {user.role === "admin" && (
                      <>
                        <button
                          onClick={() => onEdit(chore)}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(chore._id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-6 text-gray-500">
                No chores found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChoreTable;