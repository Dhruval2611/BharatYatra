import React, { useEffect, useState, useCallback } from 'react';
import { fetchBookings, fetchPackages, updateBookingStatus } from '../services/api';
import { Booking, TravelPackage, User } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import CancellationConfirmationModal from '../components/CancellationConfirmationModal';

declare global {
    interface Window {
        jspdf: any;
    }
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
    </div>
);

const UserBookingsPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [packagesMap, setPackagesMap] = useState<Map<string, TravelPackage>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

    const getTimeRemaining = (travelDate: string) => {
        const now = new Date();
        const target = new Date(travelDate);
        const diff = target.getTime() - now.getTime();

        if (diff <= 0) return "Travel date has passed";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;

        if (months > 0) {
            return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''} to go`;
        } else {
            return `${days} day${days !== 1 ? 's' : ''} to go`;
        }
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const userJson = sessionStorage.getItem('loggedInUser');
            if (!userJson) {
                throw new Error("User not logged in.");
            }
            const user: User = JSON.parse(userJson);

            const [allBookings, allPackages] = await Promise.all([
                fetchBookings(),
                fetchPackages(),
            ]);

            const userBookings = allBookings
                .filter(b => b.userEmail === user.email && b.status !== 'Cancelled')
                .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

            setBookings(userBookings);

            const pkgMap = new Map(allPackages.map(p => [p.id, p]));
            setPackagesMap(pkgMap);

        } catch (err) {
            console.error("Failed to load bookings:", err);
            setError("Could not load your bookings. Please try again later.");
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



    const handleCancelBookingClick = (booking: Booking) => {
        setBookingToCancel(booking);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancellation = async (reason: string) => {
        if (!bookingToCancel) return;

        try {
            await updateBookingStatus(bookingToCancel.id, 'Cancelled');
            alert("Booking cancelled. Payment will be refunded within 48 hours.");

            // Refresh list directly by filtering out the cancelled booking locally to avoid full reload
            setBookings(prev => prev.filter(b => b.id !== bookingToCancel.id));
            setIsCancelModalOpen(false);
            setBookingToCancel(null);
        } catch (err) {
            console.error("Failed to cancel booking:", err);
            alert("Failed to cancel booking. Please try again.");
        }
    };


    const generatePdf = async (booking: Booking) => {
        const pkg = packagesMap.get(booking.packageId);
        if (!pkg) {
            alert("Could not generate receipt. Package details not found.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Colors
        const tealColor = [20, 184, 166]; // #14b8a6
        const darkBg = [23, 23, 23]; // #171717
        const lightText = [255, 255, 255];
        const darkText = [30, 30, 30];

        // Load Logo
        const logoUrl = '/images/BY logo.png';
        const logoImg = new Image();
        logoImg.src = logoUrl;

        await new Promise((resolve) => {
            logoImg.onload = resolve;
            logoImg.onerror = resolve;
        });

        // Header Background
        doc.setFillColor(...darkBg);
        doc.rect(0, 0, 210, 28, 'F');

        // Logo
        try {
            doc.addImage(logoImg, 'PNG', 10, 4, 30, 20);
        } catch (e) {
            console.error("Could not add logo", e);
        }

        // Header Text
        doc.setTextColor(...lightText);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Bharat Yatra', 43, 14);
        doc.setFontSize(10);
        doc.setFont('times', 'italic');
        doc.text('Explore the Unexplored', 43, 19);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('BOOKING RECEIPT', 200, 16, { align: 'right' });

        // Content Start Y
        let y = 45;

        // Helper for boxes
        const drawSection = (title: string, content: [string, string][], startY: number) => {
            doc.setDrawColor(...tealColor); // Teal border
            doc.setLineWidth(0.5);

            // Title
            doc.setFontSize(12);
            doc.setTextColor(...tealColor);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 15, startY);

            // Box
            const boxTop = startY + 3;
            const boxHeight = content.length * 8 + 6;
            doc.roundedRect(15, boxTop, 180, boxHeight, 2, 2, 'S');

            // Content
            doc.setFontSize(10);
            doc.setTextColor(...darkText);

            content.forEach((item, index) => {
                const rowY = boxTop + 8 + (index * 8);
                doc.setFont('helvetica', 'bold');
                doc.text(item[0], 20, rowY); // Label
                doc.setFont('helvetica', 'normal');
                doc.text(item[1], 80, rowY); // Value
            });

            return boxTop + boxHeight + 10; // Return next Y
        };

        // Booking Details
        y = drawSection('BOOKING DETAILS', [
            ['Booking ID', booking.id],
            ['Date', new Date(booking.bookingDate).toLocaleDateString()],
            ['Status', booking.status]
        ], y);

        // Customer Details
        y = drawSection('CUSTOMER DETAILS', [
            ['Name', booking.userName],
            ['Email', booking.userEmail],
            ['Mobile', booking.userMobile],
            ['Address', `${booking.userAddress.line1}, ${booking.userAddress.city}`],
            ['', `${booking.userAddress.state} - ${booking.userAddress.pincode}`]
        ], y);

        // Package Details
        y = drawSection('PACKAGE DETAILS', [
            ['Package Name', booking.packageName],
            ['Duration', pkg.duration],
            ['Travelers', booking.travelers.toString()],
            ['Travel Date', booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : 'Not specified']
        ], y);

        // Total Amount (Highlighted)
        doc.setFillColor(...tealColor);
        doc.rect(15, y, 180, 15, 'F');
        doc.setTextColor(...lightText);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL AMOUNT PAID', 20, y + 10);
        doc.text(`Rs. ${booking.totalPrice.toLocaleString('en-IN')}`, 190, y + 10, { align: 'right' });

        // Footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFillColor(...darkBg);
        doc.rect(0, pageHeight - 20, 210, 20, 'F');
        doc.setTextColor(...lightText);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Thank you for choosing Bharat Yatra. We wish you a pleasant journey!', 105, pageHeight - 12, { align: 'center' });
        doc.text('www.bharatyatra.com | support@bharatyatra.com', 105, pageHeight - 7, { align: 'center' });

        doc.save(`BharatYatra_Receipt_${booking.id}.pdf`);
    };

    return (
        <div className="relative bg-black py-24">
            <div className={cn("pointer-events-none absolute inset-0 [background-size:40px_40px] select-none", "bg-grid-white/[0.05]")} />
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-white text-center mb-10">Your Bookings</h1>

                {loading && <LoadingSpinner />}
                {error && <p className="text-center text-red-400">{error}</p>}

                {!loading && !error && (
                    bookings.length > 0 ? (
                        <div className="space-y-6">
                            {bookings.map(booking => {
                                const pkg = packagesMap.get(booking.packageId);
                                return (
                                    <div key={booking.id} className="bg-zinc-900/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-6 transition-all duration-300 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10">
                                        {pkg && <img src={pkg.imageUrls?.[0] || pkg.imageUrl} alt={pkg.title} className="w-full md:w-48 h-48 md:h-auto object-cover rounded-xl" />}
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h2 className="text-2xl font-bold text-white font-sans tracking-tight">{booking.packageName}</h2>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-semibold border",
                                                    booking.status === 'Confirmed' && 'bg-green-500/10 text-green-400 border-green-500/20',
                                                    booking.status === 'Pending' && 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                                                    booking.status === 'Cancelled' && 'bg-red-500/10 text-red-400 border-red-500/20'
                                                )}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-6 font-sans">Booked on: {new Date(booking.bookingDate).toLocaleDateString()}</p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-300 mb-6 font-sans">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">Booking ID:</span>
                                                    <span className="font-medium text-white">{booking.id}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">Travelers:</span>
                                                    <span className="font-medium text-white">{booking.travelers}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">Total Price:</span>
                                                    <span className="font-medium text-white">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                                                </div>
                                                {booking.travelDate && (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">Travel Date:</span>
                                                            <span className="font-medium text-white">{new Date(booking.travelDate).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                                                            <span className="text-gray-500">Time Remaining:</span>
                                                            <span className="font-medium text-teal-400">{getTimeRemaining(booking.travelDate)}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-4">
                                                <button
                                                    onClick={() => generatePdf(booking)}
                                                    className="bg-teal-500 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-teal-600 transition-all duration-200 shadow-lg shadow-teal-500/20 flex items-center gap-2 w-fit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download Receipt
                                                </button>

                                                {booking.status !== 'Cancelled' && (
                                                    <button
                                                        onClick={() => handleCancelBookingClick(booking)}
                                                        className="bg-red-500/10 text-red-500 border border-red-500/20 font-semibold py-2.5 px-6 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200"
                                                    >
                                                        Cancel Booking
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
                            <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white font-sans mb-2">No Bookings Yet</h2>
                            <p className="text-gray-400 max-w-md mx-auto mb-8">You haven't booked any trips yet. Start exploring our packages to find your next adventure!</p>
                            <Link to="/packages" className="inline-flex items-center gap-2 bg-teal-500 text-white font-semibold py-3 px-8 rounded-xl hover:bg-teal-600 transition-all duration-200 shadow-lg shadow-teal-500/20">
                                Explore Packages
                            </Link>
                        </div>
                    )
                )}
            </div>

            {/* Cancellation Confirmation Modal */}
            {bookingToCancel && (
                <CancellationConfirmationModal
                    isOpen={isCancelModalOpen}
                    onClose={() => {
                        setIsCancelModalOpen(false);
                        setBookingToCancel(null);
                    }}
                    onConfirm={handleConfirmCancellation}
                    booking={bookingToCancel}
                />
            )}
        </div>
    );
};

export default UserBookingsPage;