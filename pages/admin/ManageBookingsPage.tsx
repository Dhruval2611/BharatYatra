import React, { useEffect, useState, useCallback } from 'react';
import { fetchBookings, updateBookingStatus, deleteBooking } from '../../services/api';
import { Booking } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const ManageBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedBookings = await fetchBookings();
      setBookings(fetchedBookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()));
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();

    const handleStorageChange = () => {
      loadBookings();
    };

    window.addEventListener('storageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storageUpdated', handleStorageChange);
    };
  }, [loadBookings]);

  const handleStatusChange = async (bookingId: string, status: Booking['status']) => {
    if (window.confirm(`Are you sure you want to set this booking to "${status}"?`)) {
      try {
        await updateBookingStatus(bookingId, status);
        loadBookings();
      } catch (error) {
        console.error('Failed to update booking status:', error);
        alert('Failed to update status.');
      }
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) {
      try {
        await deleteBooking(bookingId);
        loadBookings();
      } catch (error) {
        console.error('Failed to delete booking:', error);
        alert('Failed to delete booking.');
      }
    }
  };

  const openDetailsModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white hidden lg:block">Manage Bookings</h1>
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300 min-w-[800px]">
              <thead className="bg-gray-700/50 text-xs uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3">User</th>
                  <th scope="col" className="px-6 py-3">Package Name</th>
                  <th scope="col" className="px-6 py-3 text-center">More Details</th>
                  <th scope="col" className="px-6 py-3 text-center">Status</th>
                  <th scope="col" className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                        <span className="ml-4">Loading bookings...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">No bookings found.</td>
                  </tr>
                ) : (
                  bookings.map(booking => (
                    <tr key={booking.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{booking.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.packageName}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openDetailsModal(booking)}
                          className="text-teal-400 hover:text-teal-300 font-medium transition-colors text-sm underline"
                        >
                          Click Here
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-900/50 text-green-200 border border-green-700/50' :
                          booking.status === 'Cancelled' ? 'bg-red-900/50 text-red-200 border border-red-700/50' :
                            'bg-yellow-900/50 text-yellow-200 border border-yellow-700/50'
                          }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          className="bg-gray-700 text-white text-sm rounded-md px-2 py-1 border border-gray-600 focus:outline-none focus:border-teal-500"
                          onChange={(e) => {
                            const action = e.target.value;
                            if (action === 'confirm') handleStatusChange(booking.id, 'Confirmed');
                            else if (action === 'cancel') handleStatusChange(booking.id, 'Cancelled');
                            else if (action === 'pending') handleStatusChange(booking.id, 'Pending');
                            else if (action === 'delete') handleDelete(booking.id);
                            e.target.value = ''; // Reset select
                          }}
                          value=""
                        >
                          <option value="" disabled>Select Action</option>
                          {booking.status === 'Pending' && (
                            <>
                              <option value="confirm">Confirm</option>
                              <option value="cancel">Cancel</option>
                              <option value="delete" className="text-red-400">Delete</option>
                            </>
                          )}
                          {booking.status === 'Confirmed' && (
                            <>
                              <option value="pending">Set Pending</option>
                              <option value="cancel">Cancel</option>
                              <option value="delete" className="text-red-400">Delete</option>
                            </>
                          )}
                          {booking.status === 'Cancelled' && (
                            <>
                              <option value="pending">Set Pending</option>
                              <option value="confirm">Confirm</option>
                              <option value="delete" className="text-red-400">Delete</option>
                            </>
                          )}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Booking Details</h2>
                  <button onClick={closeDetailsModal} className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">User Information</h3>
                    <p className="text-white font-medium">{selectedBooking.userName}</p>
                    <p className="text-gray-300 text-sm">{selectedBooking.userEmail}</p>
                    <p className="text-gray-300 text-sm">{selectedBooking.userMobile}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 p-3 rounded-lg">
                      <h3 className="text-xs font-medium text-gray-400 mb-1">Travelers</h3>
                      <p className="text-white font-medium">{selectedBooking.travelers}</p>
                    </div>
                    <div className="bg-gray-700/30 p-3 rounded-lg">
                      <h3 className="text-xs font-medium text-gray-400 mb-1">Total Price</h3>
                      <p className="text-teal-400 font-bold">₹{selectedBooking.totalPrice.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Dates</h3>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="block text-gray-500 text-xs">Booked On</span>
                        <span className="text-white">{new Date(selectedBooking.bookingDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-gray-500 text-xs">Travel Date</span>
                        <span className="text-white">{selectedBooking.travelDate ? new Date(selectedBooking.travelDate).toLocaleDateString() : 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Address</h3>
                    <p className="text-gray-300 text-sm">
                      {selectedBooking.userAddress?.line1}<br />
                      {selectedBooking.userAddress?.city}, {selectedBooking.userAddress?.state} - {selectedBooking.userAddress?.pincode}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={closeDetailsModal}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ManageBookingsPage;