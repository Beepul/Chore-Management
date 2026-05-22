import { useAuth } from "../context/AuthContext";

import AdminDashboardView from "./AdminDashboardView";
import MemberDashboardView from "./MemberDashboardView";
import NewUserDashboardView from "./NewUserDashboardView";

import ChoreCalendarView from "./ChoreCalendarView";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="h-full">

            {
                user.isNewUser ? (
                    <NewUserDashboardView />
                ) : (
                    <>
                        {user.role === "admin"
                            ? <AdminDashboardView />
                            : <MemberDashboardView />
                        }

                        {/* 日曆 */}
                        <ChoreCalendarView />
                    </>
                )
            }

        </div>
    )
}

export default Dashboard;