import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";

const ChoreCalendarView = () => {

    const [currentDate, setCurrentDate] = useState(new Date());
    const [chores, setChores] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchMembers = async () => {
        try {
            const response = await axiosInstance.get("/api/members");
            setMembers(response.data.data || []);
            

        } catch (error) {
            
            setMembers([]);
        }
    };


    
    const fetchChores = async () => {

        try {

            const response = await axiosInstance.get("/api/chore/main");

            

            setChores(response.data.data || []);

            

        } catch (error) {

            
        }
    };

    
    useEffect(() => {

        fetchChores();
        fetchMembers();

        const interval = setInterval(() => {

            fetchChores();
            fetchMembers();

        }, 10000);

        return () => clearInterval(interval);

    }, []);

    useEffect(() => {
        members.forEach((member) => {
            
            

        });

        //members.filter((member) => member._id == id).at(0).fullname;
        chores.forEach(chore =>  {
           
        })
    }, [members]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    
    for (let i = 0; i < firstDay; i++) {

        days.push(null);
    }

    
    for (let day = 1; day <= daysInMonth; day++) {

        days.push(day);
    }

    
    const getChoresForDay = (day) => {

        return chores.filter((chore) => {

            const choreDate = new Date(chore.dueDate);

            return (

                choreDate.getDate() === day &&
                choreDate.getMonth() === month &&
                choreDate.getFullYear() === year
            );
        });
    };

    
    const selectedChores = chores.filter((chore) => {

        const choreDate = new Date(chore.dueDate);

        return (

            choreDate.getDate() === selectedDate.getDate() &&
            choreDate.getMonth() === selectedDate.getMonth() &&
            choreDate.getFullYear() === selectedDate.getFullYear()
        );
    });

    return (

        <div className="bg-white rounded-lg shadow p-6 mt-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">

                <button
                    onClick={() =>
                        setCurrentDate(new Date(year, month - 1, 1))
                    }
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Prev
                </button>

                <h2 className="text-2xl font-bold">

                    {currentDate.toLocaleString("default", {
                        month: "long",
                    })}{" "}
                    {year}

                </h2>

                <button
                    onClick={() =>
                        setCurrentDate(new Date(year, month + 1, 1))
                    }
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Next
                </button>

            </div>

            {/* Week Names */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center font-semibold">

                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>

            </div>

            {/* Calendar */}
            <div className="grid grid-cols-7 gap-2">

                {days.map((day, index) => {

                    const dayChores = day
                        ? getChoresForDay(day)
                        : [];

                    return (

                        <div
                            key={index}
                            onClick={() =>
                                day &&
                                setSelectedDate(
                                    new Date(year, month, day)
                                )
                            }
                            className={`

                                min-h-[120px]
                                border
                                rounded
                                p-2
                                cursor-pointer
                                transition

                                ${day
                                    ? "bg-white hover:bg-gray-100"
                                    : "bg-gray-50"
                                }

                            `}
                        >

                            {day && (

                                <>
                                    {/* Day Number */}
                                    <div className="font-semibold mb-2">

                                        {day}

                                    </div>

                                    {/* Chores */}
                                    <div className="space-y-1">

                                        {dayChores.slice(0, 2).map((chore) => (

                                            <div
                                                key={chore._id}
                                                className="text-xs bg-green-100 text-green-700 rounded px-2 py-1 truncate"
                                            >

                                                {chore.title}

                                            </div>
                                        ))}

                                        {dayChores.length > 2 && (

                                            <div className="text-xs text-gray-500">

                                                +{dayChores.length - 2} more

                                            </div>
                                        )}

                                    </div>
                                </>
                            )}

                        </div>
                    );
                })}

            </div>

            {/* Selected Day */}
            <div className="mt-8">

                <h3 className="text-xl font-bold mb-4">

                    Tasks for {selectedDate.toLocaleDateString()}

                </h3>

                {selectedChores.length > 0 ? (

                    <div className="space-y-3">

                        {selectedChores.map((chore) => (

                            <div
                                key={chore._id}
                                className="border rounded p-4 bg-gray-50"
                            >

                                <p className="font-semibold text-lg">

                                    {chore.title}

                                </p>

                                <p className="text-gray-600 text-sm mt-1">

                                    {chore.description}

                                </p>

                                <p className="text-sm text-gray-500 mt-2">

                                    Status: {chore.status}

                                </p>

                                <p className="text-sm text-gray-500">

                                    Due:{" "}
                                    {new Date(chore.dueDate).toLocaleDateString()}

                                </p>

                                <p className="text-sm text-gray-500">

                                    Assigned To: {
                                        chore.assignedTo.length > 0
                                            ?  chore.assignedTo.map(otherId => members.filter((member) => member.user?._id == otherId).at(0).user?.fullname).join(", ")
                                            : "Unassigned"

                                        
                                    }

                                </p>

                            </div>
                        ))}

                    </div>

                ) : (

                    <p className="text-gray-500">

                        No chores for this day.

                    </p>

                )}

            </div>

        </div>
    );
};

export default ChoreCalendarView;