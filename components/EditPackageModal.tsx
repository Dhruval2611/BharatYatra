import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updatePackage } from '../services/api';
import { TravelPackage, Itinerary } from '../types';

interface EditPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    pkg: TravelPackage;
}

const CATEGORIES = ['Adventure', 'Beach', 'Cultural', 'Family', 'Historical', 'Honeymoon', 'Nature', 'Relaxation', 'Royal', 'Spiritual', 'Trekking', 'Wildlife', 'Weekend Getaway'];

const EditPackageModal: React.FC<EditPackageModalProps> = ({ isOpen, onClose, onSave, pkg }) => {
    const [formData, setFormData] = useState({
        duration: '',
        price: 0,
        imageUrls: [] as string[],
        itineraries: [] as Itinerary[],
        categories: [] as string[], // Changed from single category to array
        placeTags: '',
        attractionTags: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [message, setMessage] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [showCustomCategory, setShowCustomCategory] = useState(false);

    useEffect(() => {
        if (pkg) {
            setFormData({
                duration: pkg.duration,
                price: pkg.price,
                imageUrls: pkg.imageUrls || (pkg.imageUrl ? [pkg.imageUrl] : []), // Backward compatibility
                itineraries: JSON.parse(JSON.stringify(pkg.itineraries)), // Deep copy
                categories: Array.isArray(pkg.category) ? pkg.category : [pkg.category], // Handle both array and string
                placeTags: pkg.placeTags.join(', '),
                attractionTags: pkg.attractionTags.join(', '),
            });
        }
    }, [pkg]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploadingImages(true);
            const files = Array.from(e.target.files);
            const imagePromises = files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(file as Blob);
                });
            });
            Promise.all(imagePromises).then(newImageUrls => {
                setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...newImageUrls] }));
                setIsUploadingImages(false);
            }).catch(error => {
                console.error('Error reading images:', error);
                setIsUploadingImages(false);
            });
            // Reset the input value to allow re-uploading the same file
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index)
        }));
    };

    const handleItineraryChange = (index: number, value: string) => {
        const newItineraries = [...formData.itineraries];
        newItineraries[index] = { ...newItineraries[index], description: value };
        setFormData(prev => ({ ...prev, itineraries: newItineraries }));
    };

    const addItineraryDay = () => {
        setFormData(prev => ({
            ...prev,
            itineraries: [...prev.itineraries, { day: prev.itineraries.length + 1, description: '' }]
        }));
    };

    const removeItineraryDay = (index: number) => {
        setFormData(prev => ({
            ...prev,
            itineraries: prev.itineraries.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 })),
        }));
    };

    const handleCategoryToggle = (cat: string) => {
        if (cat === 'Other') {
            setShowCustomCategory(!showCustomCategory);
            return;
        }
        setFormData(prev => {
            const isSelected = prev.categories.includes(cat);
            if (isSelected) {
                // Remove category
                return { ...prev, categories: prev.categories.filter(c => c !== cat) };
            } else {
                // Add category only if less than 3 are selected
                if (prev.categories.length < 3) {
                    return { ...prev, categories: [...prev.categories, cat] };
                }
                return prev; // Don't add if already 3 selected
            }
        });
    };

    const handleAddCustomCategory = () => {
        if (customCategory && !formData.categories.includes(customCategory) && formData.categories.length < 3) {
            setFormData(prev => ({
                ...prev,
                categories: [...prev.categories, customCategory]
            }));
        }
        setCustomCategory('');
    };

    const handleRemoveCategory = (catToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.filter(cat => cat !== catToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        try {
            const updatedData: TravelPackage = {
                ...pkg,
                ...formData,
                imageUrls: formData.imageUrls,
                days: formData.itineraries.length,
                category: formData.categories, // Send categories array
                placeTags: formData.placeTags.split(',').map(tag => tag.trim()).filter(Boolean),
                attractionTags: formData.attractionTags.split(',').map(tag => tag.trim()).filter(Boolean),
            };
            await updatePackage(updatedData);
            setMessage('Package updated successfully!');
            setTimeout(() => {
                onSave();
            }, 1000);
        } catch (error) {
            setMessage('Failed to update package. Please try again.');
        } finally {
            setIsSubmitting(false);
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
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Edit Package</h2>
                            <p className="text-gray-400 -mt-6 mb-6">
                                Title: <span className="font-semibold text-teal-400">{pkg.title}</span> (non-editable)
                            </p>

                            {message && <p className={`text-center p-3 rounded-md ${message.includes('success') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{message}</p>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                                    <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} required className="w-full py-2.5 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">Price (₹)</label>
                                    <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" className="w-full py-2.5 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Categories (Select up to 3)
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.categories.map(cat => (
                                        <span key={cat} className="bg-teal-500/50 text-teal-200 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2">
                                            {cat}
                                            <button type="button" onClick={() => handleRemoveCategory(cat)} className="text-teal-200 hover:text-white">&times;</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[...CATEGORIES, 'Other'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => handleCategoryToggle(cat)}
                                            disabled={cat !== 'Other' && !formData.categories.includes(cat) && formData.categories.length >= 3}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${(formData.categories.includes(cat) || (cat === 'Other' && showCustomCategory))
                                                ? 'bg-teal-500 text-white'
                                                : formData.categories.length >= 3 && cat !== 'Other'
                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                {showCustomCategory && (
                                    <div className="flex items-center gap-2 mt-3">
                                        <input
                                            type="text"
                                            value={customCategory}
                                            onChange={e => setCustomCategory(e.target.value)}
                                            placeholder="Type custom category"
                                            className="flex-grow py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        <button type="button" onClick={handleAddCustomCategory} className="bg-teal-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-600">Add</button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Package Images</label>
                                <div className="mt-2 space-y-4">
                                    {formData.imageUrls.length > 0 && (
                                        <div className="flex flex-wrap gap-4">
                                            {formData.imageUrls.map((url, index) => (
                                                <div key={index} className="relative">
                                                    <img src={url} alt={`Package Preview ${index + 1}`} className="h-20 w-20 rounded-md object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <label htmlFor="image-upload" className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors inline-block disabled:bg-gray-500">
                                        <span>{isUploadingImages ? 'Uploading...' : formData.imageUrls.length > 0 ? 'Add More Images' : 'Upload Images'}</span>
                                        <input id="image-upload" name="image-upload" type="file" multiple className="sr-only" accept="image/*" onChange={handleImageChange} disabled={isUploadingImages} />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-200 mb-2">Day-wise Itinerary</h3>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {formData.itineraries.map((item, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className="flex-shrink-0 pt-2"><span className="text-teal-400 font-semibold">Day {item.day}</span></div>
                                            <textarea value={item.description} onChange={(e) => handleItineraryChange(index, e.target.value)} required rows={2} className="flex-grow py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
                                            {formData.itineraries.length > 1 && (<button type="button" onClick={() => removeItineraryDay(index)} className="mt-2 text-red-500 hover:text-red-400">&times; Remove</button>)}
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addItineraryDay} className="text-teal-400 font-semibold hover:text-teal-300 mt-2">+ Add Day</button>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-500">
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditPackageModal;