import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DashboardLayout = ({children}) => {
    const {user} = useAuth()
    if(!user.hasHousehold){
        return (
            <div className='flex h-dvh'>
                <div className='border-r p-5'>
                    <ul>
                        <li>
                            <NavLink
                            to="/dashboard"
                            end
                            className={({ isActive }) =>
                                isActive
                                ? 'bg-[#227F74] text-white p-3 inline-block rounded-md pr-20 w-full'
                                : 'p-3 inline-block rounded-md pr-20 hover:text-green-700 w-full'
                            }
                            >
                            Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                            to="/profile-settings"
                            end
                            className={({ isActive }) =>
                                isActive
                                ? 'bg-[#227F74] text-white p-3 inline-block rounded-md pr-20 w-full'
                                : 'p-3 inline-block rounded-md pr-20 hover:text-green-700 w-full'
                            }
                            >
                            Profile Settings
                            </NavLink>
                        </li>
                    </ul>
                </div>
                <div className='flex-1 p-5'>{children}</div>
            </div>
        )
    }
  return (
    <div className='flex h-dvh'>
        <div className='border-r p-5'>
            <ul>
                <li>
                    <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                        isActive
                        ? 'bg-[#227F74] text-white p-3 inline-block rounded-md pr-20 w-full'
                        : 'p-3 inline-block rounded-md pr-20 hover:text-green-700 w-full'
                    }
                    >
                    Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink
                    to="/chores"
                    end
                    className={({ isActive }) =>
                        isActive
                        ? 'bg-[#227F74] text-white p-3 inline-block rounded-md pr-20 w-full'
                        : 'p-3 inline-block rounded-md pr-20 hover:text-green-700 w-full'
                    }
                    >
                    Chores
                    </NavLink>
                </li>
                <li>
                    <NavLink
                    to="/members"
                    end
                    className={({ isActive }) =>
                        isActive
                        ? 'bg-[#227F74] text-white p-3 inline-block rounded-md pr-20 w-full'
                        : 'p-3 inline-block rounded-md pr-20 hover:text-green-700 w-full'
                    }
                    >
                    Members
                    </NavLink>
                </li>
                <li>
                    <NavLink
                    to="/settings"
                    end
                    className={({ isActive }) =>
                        isActive
                        ? 'bg-[#227F74] text-white p-3 inline-block rounded-md pr-20 w-full'
                        : 'p-3 inline-block rounded-md pr-20 hover:text-green-700 w-full'
                    }
                    >
                    Settings
                    </NavLink>
                </li>
            </ul>
        </div>
        <div className='flex-1 p-5'>{children}</div>
    </div>
  )
}

export default DashboardLayout