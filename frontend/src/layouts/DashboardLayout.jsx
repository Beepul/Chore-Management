import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "block w-full rounded-md bg-[#227F74] px-4 py-3 text-sm font-medium text-white"
      : "block w-full rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#E6F3F1] hover:text-[#227F74]";

  const menuItems = user?.hasHousehold
    ? [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Chores", path: "/chores" },
        { name: "Members", path: "/members" },
        { name: "Settings", path: "/settings" },
      ]
    : [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Profile Settings", path: "/profile-settings" },
      ];

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Sidebar */}
      <aside className="w-full border-b bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="p-5">
          <nav>
            <ul className="flex gap-2 overflow-x-auto md:block md:space-y-2">
              {menuItems.map((item) => (
                <li key={item.path} className="min-w-max md:min-w-0">
                  <NavLink to={item.path} end className={navLinkClass}>
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 hidden rounded-lg border bg-gray-50 p-4 md:block">
            <p className="text-xs text-gray-500">Logged in as</p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              {user?.user?.fullname || user?.fullname || "User"}
            </p>

            {user?.role && (
              <p className="mt-1 text-xs capitalize text-[#227F74]">
                {user.role}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;