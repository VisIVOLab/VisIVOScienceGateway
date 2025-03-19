import React from "react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div className={`fixed inset-y-0 left-0 bg-gray-800 text-white w-64 p-5 transition-transform transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <button onClick={toggleSidebar} className="text-white mb-4 focus:outline-none">
                ✖
            </button>
            <ul>
                <li className="p-2 hover:bg-gray-700 rounded">Home</li>
                <li className="p-2 hover:bg-gray-700 rounded">Settings</li>
                <li className="p-2 hover:bg-gray-700 rounded">Logout</li>
            </ul>
        </div>
    );
};

export default Sidebar;