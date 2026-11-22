import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { TravelPackage, User } from '../types';
import { fetchPackageById, fetchBookings } from '../services/api';
import BookingModal from '../components/BookingModal';
import ImageCarousel from '../components/ImageCarousel';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen bg-black">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
  </div>
);

const PackageDetailPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckingBooking, setIsCheckingBooking] = useState(false);


  useEffect(() => {
    const getPackage = async () => {
      if (!packageId) {
        setError('Package ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchPackageById(packageId);
        if (data) {
          setPkg(data);
          setError(null);
          // Check for navigation state to auto-open modal
          if (location.state?.openModal) {
            handleOpenModal();
          }
        } else {
          setError('Package not found.');
        }
      } catch (err) {
        setError('Failed to fetch package details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getPackage();
  }, [packageId, location.state]);

  const handleOpenModal = async () => {
    const loggedInUserJson = sessionStorage.getItem('loggedInUser');
    if (!loggedInUserJson) {
      navigate('/signin', { state: { from: location.pathname, openModal: true } });
      return;
    }

    let currentUser: User;
    try {
      currentUser = JSON.parse(loggedInUserJson);
    } catch (error) {
      console.error("Corrupted user session, redirecting to login.", error);
      sessionStorage.removeItem('loggedInUser');
      navigate('/signin', { state: { from: location.pathname, openModal: true } });
      return;
    }

    if (!packageId) return;

    setIsCheckingBooking(true);
    try {
      const allBookings = await fetchBookings();
      const hasAlreadyBooked = allBookings.some(
        (booking) => booking.userEmail === currentUser.email && booking.packageId === packageId
      );

      if (hasAlreadyBooked) {
        const confirmNewBooking = window.confirm(
          "It looks like you've already booked this trip. Would you like to make another booking for someone else?"
        );
        if (confirmNewBooking) {
          setIsModalOpen(true);
        }
      } else {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to check for existing bookings:', error);
      // Fallback: allow user to book even if the check fails.
      setIsModalOpen(true);
    } finally {
      setIsCheckingBooking(false);
    }
  };
  const handleCloseModal = () => setIsModalOpen(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <p className="text-red-500 text-2xl mb-4">{error}</p>
        <Link to="/packages" className="bg-teal-500 text-white font-bold py-2 px-6 rounded-full hover:bg-teal-600 transition-colors">
          Back to Packages
        </Link>
      </div>
    );
  }

  if (!pkg) {
    return <div className="flex items-center justify-center h-screen bg-black text-white text-2xl">Package not found.</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link
            to="/packages"
            className="inline-flex items-center text-teal-400 hover:text-teal-300 mb-6 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Packages
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Hero Section */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <div className="h-[400px] md:h-[500px] relative">
                  <ImageCarousel images={pkg.imageUrls || (pkg.imageUrl ? [pkg.imageUrl] : [])} alt={pkg.title} enableKeyboardNav={true} />
                </div>
              </div>

              {/* Overview Section */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Overview
                </h2>

                {pkg.description && (
                  <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                    {pkg.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {pkg.category && pkg.category.length > 0 && (
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                      <span className="block text-gray-400 text-sm uppercase tracking-wider mb-2">Categories</span>
                      <div className="flex flex-wrap gap-2">
                        {pkg.category.map((cat, idx) => (
                          <span key={idx} className="bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/30">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pkg.attractionTags && pkg.attractionTags.length > 0 && (
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                      <span className="block text-gray-400 text-sm uppercase tracking-wider mb-2">Attractions</span>
                      <div className="flex flex-wrap gap-2">
                        {pkg.attractionTags.map((tag, idx) => (
                          <span key={idx} className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Itinerary Section - Timeline */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7" />
                  </svg>
                  Itinerary
                </h2>
                <div className="relative border-l-2 border-gray-700 ml-3 space-y-8">
                  {pkg.itineraries.map((item, index) => (
                    <div key={item.day} className="mb-8 ml-6 relative">
                      <span className="absolute -left-[35px] flex items-center justify-center w-8 h-8 bg-teal-600 rounded-full ring-4 ring-gray-900 text-white font-bold text-sm">
                        {item.day}
                      </span>
                      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-colors">
                        <h3 className="text-xl font-bold text-white mb-2">Day {item.day}</h3>
                        <p className="text-gray-300">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Booking Card (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-2xl">

                  <h1 className="text-3xl font-extrabold text-white mb-2">{pkg.title}</h1>
                  <div className="flex items-center text-gray-400 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg">{pkg.duration}</span>
                  </div>

                  <div className="mb-8">
                    <span className="text-gray-400 text-sm">Starting from</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-teal-400">₹{pkg.price.toLocaleString('en-IN')}</span>
                      <span className="text-gray-400">/ person</span>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenModal}
                    disabled={isCheckingBooking}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCheckingBooking ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Checking...
                      </>
                    ) : (
                      'Book This Trip Now'
                    )}
                  </button>

                  <p className="text-center text-gray-500 text-xs mt-4">
                    *Prices may vary based on customization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {pkg && <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        pkg={pkg}
      />}
    </>
  );
};

export default PackageDetailPage;