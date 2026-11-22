import React, { useEffect, useState, useCallback } from 'react';
import { fetchUsers, deleteUser, fetchBookings } from '../../services/api';
import { User, Booking } from '../../types';

// Helper to get the first initial from a username
const getInitials = (name: string): string => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
};

// Helper to generate a consistent, vibrant color from a string for avatars
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 50%, 40%)`; // Use HSL for good contrast with white text
};


const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAddressMap, setUserAddressMap] = useState(new Map<string, string>());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedBookings] = await Promise.all([
        fetchUsers(),
        fetchBookings()
      ]);
      setUsers(fetchedUsers);
      setBookings(fetchedBookings);

      const addressMap = new Map<string, string>();
      fetchedUsers.forEach(user => {
        const userBookings = fetchedBookings
          .filter(b => b.userEmail === user.email)
          .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

        if (userBookings.length > 0) {
          const latestAddress = userBookings[0].userAddress;
          addressMap.set(user.id, `${latestAddress.line1}, ${latestAddress.city}, ${latestAddress.state} - ${latestAddress.pincode}`);
        }
      });
      setUserAddressMap(addressMap);
    } catch (error) {
      console.error("Failed to fetch user data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storageUpdated', handleStorageChange);
    };
  }, [loadData]);

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This will also remove their bookings.')) {
      try {
        await deleteUser(userId);
        // Dispatch event to refresh the user list
        window.dispatchEvent(new Event('storageUpdated'));
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Could not delete user. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Manage Users</h1>
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300 min-w-[900px]">
            <thead className="bg-gray-700 text-xs uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">Image</th>
                <th scope="col" className="px-6 py-3">Username</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Phone</th>
                <th scope="col" className="px-6 py-3">Last Known Address</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                      <span className="ml-4">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      {user.profileImageUrl && user.profileImageUrl.startsWith('data:') ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: stringToColor(user.username) }}
                          title={user.username}
                        >
                          {getInitials(user.username)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{user.username}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{userAddressMap.get(user.id) || 'No bookings yet'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="font-medium text-red-500 hover:text-red-400 transition-colors"
                        aria-label={`Delete user ${user.username}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;