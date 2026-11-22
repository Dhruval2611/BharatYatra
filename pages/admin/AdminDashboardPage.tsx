import React, { useEffect, useState, useCallback } from 'react';
import { fetchPackages, fetchUsers, fetchBookings } from '../../services/api';
import { Booking } from '../../types';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="bg-teal-500/20 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState({ packages: 0, users: 0, bookings: 0 });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [packagesData, usersData, bookingsData] = await Promise.all([
                fetchPackages(),
                fetchUsers(),
                fetchBookings()
            ]);
            setStats({
                packages: packagesData.length,
                users: usersData.length,
                bookings: bookingsData.length,
            });
            setRecentBookings(bookingsData.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()).slice(0, 5));
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();

        const handleStorageChange = () => {
            loadDashboardData();
        };

        window.addEventListener('storageUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storageUpdated', handleStorageChange);
        };
    }, [loadDashboardData]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white hidden lg:block">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Packages" value={stats.packages} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
                <StatCard title="Registered Users" value={stats.users} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 01-3 5.197M15 21a9 9 0 00-9-5.197" /></svg>} />
                <StatCard title="Total Bookings" value={stats.bookings} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/admin/add-package" className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-gray-700 transition-colors h-32 group">
                        <div className="p-3 bg-teal-500/10 rounded-full group-hover:bg-teal-500/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="font-medium text-white">Add Package</span>
                    </Link>
                    <Link to="/admin/manage-packages" className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-gray-700 transition-colors h-32 group">
                        <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <span className="font-medium text-white">Manage Packages</span>
                    </Link>
                    <Link to="/admin/manage-users" className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-gray-700 transition-colors h-32 group">
                        <div className="p-3 bg-purple-500/10 rounded-full group-hover:bg-purple-500/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <span className="font-medium text-white">Manage Users</span>
                    </Link>
                    <Link to="/admin/manage-bookings" className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-gray-700 transition-colors h-32 group">
                        <div className="p-3 bg-yellow-500/10 rounded-full group-hover:bg-yellow-500/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        </div>
                        <span className="font-medium text-white">Manage Bookings</span>
                    </Link>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Recent Bookings</h2>
                <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="bg-gray-700/50 text-xs uppercase">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Package Name</th>
                                    <th scope="col" className="px-6 py-3">User</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.length > 0 ? recentBookings.map(booking => (
                                    <tr key={booking.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{booking.packageName}</td>
                                        <td className="px-6 py-4">{booking.userName}</td>
                                        <td className="px-6 py-4">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="text-center py-6 text-gray-400">No recent bookings.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;