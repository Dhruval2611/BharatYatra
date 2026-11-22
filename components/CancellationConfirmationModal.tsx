import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booking } from '../types';

interface CancellationConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    booking: Booking;
}

const CancellationConfirmationModal: React.FC<CancellationConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    booking
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [cancellationReason, setCancellationReason] = useState('');

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleConfirmCancellation = () => {
        onConfirm(cancellationReason);
        resetModal();
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const resetModal = () => {
        setCurrentStep(1);
        setCancellationReason('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-500/30 p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Cancel Booking</h2>
                            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>Step {currentStep} of 5</span>
                                <span>{Math.round((currentStep / 5) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div
                                    className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                                    initial={{ width: '20%' }}
                                    animate={{ width: `${(currentStep / 5) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {/* Step 1 */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">Are you sure you want to cancel this booking?</h3>
                                                <p className="text-gray-400 text-sm mb-3">Package: <span className="text-white font-medium">{booking.packageName}</span></p>
                                                <p className="text-gray-400 text-sm">Booking ID: <span className="text-white font-medium">{booking.id}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={handleClose}
                                            className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all duration-200"
                                        >
                                            No, Keep Booking
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="flex-1 bg-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-700 transition-all duration-200"
                                        >
                                            Yes, Continue
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2 */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-4">Have you reviewed the cancellation policy?</h3>
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 space-y-2">
                                        <p>• Cancellations are subject to our refund policy</p>
                                        <p>• Refund will be processed within 48 hours</p>
                                        <p>• Original payment method will be credited</p>
                                        <p>• Cancellation is final and cannot be reversed</p>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={handleBack}
                                            className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="flex-1 bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-teal-700 transition-all duration-200"
                                        >
                                            Yes, I Understand
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3 */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-4">What is the reason for cancellation?</h3>
                                    <div className="space-y-3">
                                        {[
                                            { value: 'change_of_plans', label: 'Change of plans' },
                                            { value: 'found_better_option', label: 'Found better option' },
                                            { value: 'emergency', label: 'Emergency situation' },
                                            { value: 'other', label: 'Other' }
                                        ].map((option) => (
                                            <label
                                                key={option.value}
                                                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${cancellationReason === option.value
                                                        ? 'bg-teal-500/20 border-teal-500'
                                                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="reason"
                                                    value={option.value}
                                                    checked={cancellationReason === option.value}
                                                    onChange={(e) => setCancellationReason(e.target.value)}
                                                    className="w-4 h-4 text-teal-500"
                                                />
                                                <span className="text-white font-medium">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={handleBack}
                                            className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={!cancellationReason}
                                            className="flex-1 bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4 */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-4">Do you understand that refund will take 48 hours to process?</h3>
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div className="text-sm text-gray-300">
                                                <p className="mb-2">Your refund of <span className="text-white font-semibold">₹{booking.totalPrice.toLocaleString('en-IN')}</span> will be processed within 48 hours.</p>
                                                <p>The amount will be credited to your original payment method.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={handleBack}
                                            className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="flex-1 bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-teal-700 transition-all duration-200"
                                        >
                                            Yes, I Understand
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5 - Final Confirmation */}
                            {currentStep === 5 && (
                                <motion.div
                                    key="step5"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-3">Final Confirmation</h3>
                                                <p className="text-gray-300 text-sm mb-2">You are about to cancel:</p>
                                                <div className="bg-gray-800/50 rounded-lg p-3 space-y-1 text-sm">
                                                    <p className="text-gray-400">Package: <span className="text-white font-medium">{booking.packageName}</span></p>
                                                    <p className="text-gray-400">Travelers: <span className="text-white font-medium">{booking.travelers}</span></p>
                                                    <p className="text-gray-400">Amount: <span className="text-white font-medium">₹{booking.totalPrice.toLocaleString('en-IN')}</span></p>
                                                </div>
                                                <p className="text-red-400 text-sm mt-3 font-medium">This action cannot be undone!</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={handleBack}
                                            className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleConfirmCancellation}
                                            className="flex-1 bg-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-500/20"
                                        >
                                            Yes, Cancel Booking
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CancellationConfirmationModal;
