import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addBooking } from '../services/api';
import { TravelPackage, Booking, User } from '../types';
import { indianStates } from '../data/locations';

declare global {
  interface Window {
    jspdf: any;
  }
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: TravelPackage;
}

type ModalStep = 'personal' | 'address' | 'payment' | 'success';

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, pkg }) => {
  const [step, setStep] = useState<ModalStep>('personal');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState({ line1: '', city: '', state: '', pincode: '' });
  const [cities, setCities] = useState<string[]>([]);
  const [travelers, setTravelers] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBookingDetails, setNewBookingDetails] = useState<Booking | null>(null);

  useEffect(() => {
    if (isOpen) {
      const userJson = sessionStorage.getItem('loggedInUser');
      if (userJson) {
        const user: User = JSON.parse(userJson);
        setName(user.username);
        setEmail(user.email);
        setMobile(user.phone || '');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (address.state) {
      const selectedState = indianStates.find(s => s.name === address.state);
      setCities(selectedState ? selectedState.cities : []);
    } else {
      setCities([]);
    }
  }, [address.state]);


  const resetForm = () => {
    setName('');
    setEmail('');
    setMobile('');
    setAddress({ line1: '', city: '', state: '', pincode: '' });
    setTravelers(1);
    setTravelDate('');
    setIsSubmitting(false);
    setStep('personal');
    setNewBookingDetails(null);
  };

  const handleClose = () => {
    // Delay reset to allow for exit animation
    setTimeout(resetForm, 300);
    onClose();
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'state') {
      // When state changes, reset city
      setAddress(prev => ({ ...prev, state: value, city: '' }));
    } else {
      setAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const generatePdf = async () => {
    if (!newBookingDetails) return;

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
      ['Booking ID', newBookingDetails.id],
      ['Date', new Date(newBookingDetails.bookingDate).toLocaleDateString()],
      ['Status', 'Confirmed'] // Assuming success step implies confirmed/paid
    ], y);

    // Customer Details
    y = drawSection('CUSTOMER DETAILS', [
      ['Name', newBookingDetails.userName],
      ['Email', newBookingDetails.userEmail],
      ['Mobile', newBookingDetails.userMobile],
      ['Address', `${newBookingDetails.userAddress.line1}, ${newBookingDetails.userAddress.city}`],
      ['', `${newBookingDetails.userAddress.state} - ${newBookingDetails.userAddress.pincode}`]
    ], y);

    // Package Details
    y = drawSection('PACKAGE DETAILS', [
      ['Package Name', newBookingDetails.packageName],
      ['Duration', pkg.duration],
      ['Travelers', newBookingDetails.travelers.toString()],
      ['Travel Date', newBookingDetails.travelDate ? new Date(newBookingDetails.travelDate).toLocaleDateString() : 'Not specified']
    ], y);

    // Total Amount (Highlighted)
    doc.setFillColor(...tealColor);
    doc.rect(15, y, 180, 15, 'F');
    doc.setTextColor(...lightText);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT PAID', 20, y + 10);
    doc.text(`Rs. ${newBookingDetails.totalPrice.toLocaleString('en-IN')}`, 190, y + 10, { align: 'right' });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(...darkBg);
    doc.rect(0, pageHeight - 20, 210, 20, 'F');
    doc.setTextColor(...lightText);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing Bharat Yatra. We wish you a pleasant journey!', 105, pageHeight - 12, { align: 'center' });
    doc.text('www.bharatyatra.com | support@bharatyatra.com', 105, pageHeight - 7, { align: 'center' });

    doc.save(`BharatYatra_Receipt_${newBookingDetails.id}.pdf`);
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('address');
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newBooking = await addBooking({
        userName: name,
        userEmail: email,
        userMobile: mobile,
        travelers: travelers,
        totalPrice: pkg.price * travelers,
        packageName: pkg.title,
        packageId: pkg.id,
        userAddress: address,
        travelDate: travelDate,
      });
      setNewBookingDetails(newBooking);
      setStep('success');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
      setStep('personal'); // Go back to personal form on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'personal':
        return (
          <>
            <h2 className="text-2xl font-bold mb-2">Book Your Trip</h2>
            <p className="text-gray-400 mb-6">You've chosen: <span className="font-semibold text-teal-400">{pkg.title}</span></p>
            <form onSubmit={handlePersonalSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-300 mb-1">Mobile Number</label>
                <input type="tel" id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} required className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <label htmlFor="travelers" className="block text-sm font-medium text-gray-300">Number of Travelers</label>
                <input type="number" id="travelers" value={travelers} min="1" max="20" onChange={(e) => setTravelers(parseInt(e.target.value, 10))} required className="w-24 py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="text-right text-xl font-bold text-white pt-2">
                Total: ₹{(pkg.price * travelers).toLocaleString('en-IN')}
              </div>
              <button type="submit" className="w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition-colors">
                Next
              </button>
            </form>
          </>
        );
      case 'address':
        return (
          <>
            <button onClick={() => setStep('personal')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back
            </button>
            <h2 className="text-2xl font-bold mb-6">Address & Travel Details</h2>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address for Communication</label>
                <div className="space-y-2">
                  <input type="text" name="line1" placeholder="Address Line 1" value={address.line1} onChange={handleAddressChange} required className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select name="state" value={address.state} onChange={handleAddressChange} required className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">Select State</option>
                      {indianStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                    <select name="city" value={address.city} onChange={handleAddressChange} required disabled={!address.state} className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-800 disabled:cursor-not-allowed">
                      <option value="">Select City</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <input type="text" name="pincode" placeholder="Pincode" value={address.pincode} onChange={handleAddressChange} required className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>

              <div>
                <label htmlFor="travelDate" className="block text-sm font-medium text-gray-300 mb-1">Travel Date</label>
                <input type="date" id="travelDate" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <button type="submit" className="w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition-colors">
                Proceed to Payment
              </button>
            </form>
          </>
        );
      case 'payment':
        return (
          <>
            <button onClick={() => setStep('details')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Details
            </button>
            <h2 className="text-2xl font-bold mb-6">Complete Your Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label htmlFor="card-name" className="block text-sm font-medium text-gray-300 mb-1">Name on Card</label>
                <input type="text" id="card-name" required placeholder="John Doe" className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-gray-300 mb-1">Card Number</label>
                <div className="relative">
                  <input type="text" id="card-number" required placeholder="0000 0000 0000 0000" className="w-full py-2 pl-3 pr-10 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
                  <input type="text" id="expiry" required placeholder="MM/YY" className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-300 mb-1">CVV</label>
                  <input type="text" id="cvv" required placeholder="123" className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div className="text-right text-xl font-bold text-white pt-2">
                Total: ₹{(pkg.price * travelers).toLocaleString('en-IN')}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-500 flex items-center justify-center">
                {isSubmitting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {isSubmitting ? 'Processing...' : `Pay Now`}
              </button>
            </form>
          </>
        );
      case 'success':
        return (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">Booking Successful!</h2>
            <p className="text-gray-300 mb-6">Your trip is confirmed. A receipt has been generated for you.</p>
            <button
              onClick={generatePdf}
              className="w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition-colors mb-2"
            >
              Download Receipt
            </button>
            <button
              onClick={handleClose}
              className="w-full bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white rounded-lg shadow-xl w-full max-w-md p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;