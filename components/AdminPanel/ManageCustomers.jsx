import React, { useState } from "react";
import { Search, Filter, Mail, Phone, User } from "lucide-react";

const customersData = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "9876543210", status: "Active" },
    { id: 2, name: "Alice Smith", email: "alice@example.com", phone: "8765432109", status: "Inactive" },
    { id: 3, name: "Michael Johnson", email: "michael@example.com", phone: "7654321098", status: "Active" },
    { id: 4, name: "Emma Brown", email: "emma@example.com", phone: "6543210987", status: "Inactive" }
];

const ManageCustomer = () => {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const filteredCustomers = customersData.filter((customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) &&
        (filterStatus === "All" || customer.status === filterStatus)
    );

    return (
        <div className="bg-gray-100 p-6 min-h-screen">
            <h1 className="mb-6 font-bold text-gray-800 text-3xl">Customer List</h1>

            {/* Search & Filter Bar */}
            <div className="flex justify-between mb-4">
                <div className="relative w-2/3">
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="shadow-sm px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="top-2.5 left-3 absolute text-gray-400" />
                </div>

                <select
                    className="shadow-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Customer Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Phone</th>
                            <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-100 border-b">
                                <td className="flex items-center px-4 py-3">
                                    <User className="mr-2 text-gray-500" />
                                    {customer.name}
                                </td>
                                <td className="flex items-center px-4 py-3">
                                    <Mail className="mr-2 text-gray-500" />
                                    {customer.email}
                                </td>
                                <td className="flex items-center px-4 py-3">
                                    <Phone className="mr-2 text-gray-500" />
                                    {customer.phone}
                                </td>
                                <td className={`py-3 px-4 font-bold ${customer.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                                    {customer.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageCustomer;
