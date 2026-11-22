import React, { useState, useEffect } from 'react';
import { addPackage } from '../../services/api';
import { TravelPackage } from '../../types';

const PREDEFINED_ATTRACTIONS = ['Mountains', 'Beaches', 'Forts', 'Palaces', 'Temples', 'Wildlife', 'Trekking', 'Water Sports', 'Nightlife', 'Local Cuisine', 'Historical Sites', 'Shopping'];
const CATEGORIES = ['Adventure', 'Beach', 'Cultural', 'Family', 'Historical', 'Honeymoon', 'Nature', 'Relaxation', 'Royal', 'Spiritual', 'Trekking', 'Wildlife', 'Weekend Getaway'];


const AddPackagePage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: 15000,
    imageUrls: [] as string[],
    itineraries: [{ day: 1, description: '' }],
    categories: [] as string[], // Changed from single category to array
    placeTags: '',
    attractionTags: [] as string[],
  });
  const [days, setDays] = useState(2);
  const [nights, setNights] = useState(1);
  const [customAttraction, setCustomAttraction] = useState('');
  const [showCustomAttraction, setShowCustomAttraction] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      duration: `${days} Days / ${nights} Nights`,
    }));
  }, [days, nights]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      try {
        const imagePromises = files.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        });

        const newImages = await Promise.all(imagePromises);
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...newImages],
        }));
      } catch (error) {
        console.error('Error reading images:', error);
      }
      // Reset the input value to allow re-uploading the same file
      e.target.value = '';
    }
  };

  const handleItineraryChange = (index: number, value: string) => {
    const newItineraries = [...formData.itineraries];
    newItineraries[index] = { ...newItineraries[index], description: value };
    setFormData(prev => ({ ...prev, itineraries: newItineraries }));
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itineraries: [
        ...prev.itineraries,
        { day: prev.itineraries.length + 1, description: '' }
      ]
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itineraries: prev.itineraries.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 })),
    }));
  };

  const handleAttractionToggle = (tag: string) => {
    if (tag === 'Other') {
      setShowCustomAttraction(!showCustomAttraction);
      return;
    }
    setFormData(prev => {
      const newTags = prev.attractionTags.includes(tag)
        ? prev.attractionTags.filter(t => t !== tag)
        : [...prev.attractionTags, tag];
      return { ...prev, attractionTags: newTags };
    });
  };

  const handleAddCustomAttraction = () => {
    if (customAttraction && !formData.attractionTags.includes(customAttraction)) {
      setFormData(prev => ({
        ...prev,
        attractionTags: [...prev.attractionTags, customAttraction]
      }));
    }
    setCustomAttraction('');
  };

  const handleRemoveAttraction = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      attractionTags: prev.attractionTags.filter(tag => tag !== tagToRemove)
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
    // If no images are provided, use a default placeholder image
    const finalImageUrls = formData.imageUrls.length > 0 ? formData.imageUrls : ['/images/ChatGPT Image Oct 1, 2025, 07_03_21 PM.png'];

    setIsSubmitting(true);
    setMessage('');
    try {
      const packageData = {
        ...formData,
        imageUrls: finalImageUrls, // Use the final image URLs
        days: days, // Use the state value for days
        category: formData.categories, // Send categories array
        // Convert comma-separated strings to arrays
        placeTags: formData.placeTags.split(',').map(tag => tag.trim()).filter(Boolean),
      };
      await addPackage(packageData as Omit<TravelPackage, 'id'>);
      setMessage('Package added successfully!');
      // Reset form
      setFormData({
        title: '',
        description: '',
        duration: `${days} Days / ${nights} Nights`,
        price: 15000,
        imageUrls: [],
        itineraries: [{ day: 1, description: '' }],
        categories: [], // Reset to empty array
        placeTags: '',
        attractionTags: [],
      });
      setShowCustomAttraction(false);
      setCustomAttraction('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to add package. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Add New Package</h1>
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-8 rounded-lg shadow-lg space-y-6">
        {message && <p className={`text-center p-3 rounded-md ${message.includes('success') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{message}</p>}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Package Title</label>
          <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full py-2.5 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className="w-full py-2.5 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Enter package description..."></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label htmlFor="days" className="block text-sm font-medium text-gray-300 mb-2">Days</label>
            <select name="days" id="days" value={days} onChange={e => setDays(Number(e.target.value))} className="w-full py-2.5 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="nights" className="block text-sm font-medium text-gray-300 mb-2">Nights</label>
            <select name="nights" id="nights" value={nights} onChange={e => setNights(Number(e.target.value))} className="w-full py-2.5 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
              {Array.from({ length: 30 }, (_, i) => i).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
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
          <label htmlFor="placeTags" className="block text-sm font-medium text-gray-300 mb-2">Place Tags (comma-separated)</label>
          <input type="text" name="placeTags" id="placeTags" value={formData.placeTags} onChange={handleChange} placeholder="e.g., Leh, Nubra Valley" className="w-full py-2.5 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Attraction Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.attractionTags.map(tag => (
              <span key={tag} className="bg-teal-500/50 text-teal-200 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2">
                {tag}
                <button type="button" onClick={() => handleRemoveAttraction(tag)} className="text-teal-200 hover:text-white">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[...PREDEFINED_ATTRACTIONS, 'Other'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAttractionToggle(tag)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${(formData.attractionTags.includes(tag) || (tag === 'Other' && showCustomAttraction))
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {showCustomAttraction && (
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                value={customAttraction}
                onChange={e => setCustomAttraction(e.target.value)}
                placeholder="Type custom attraction"
                className="flex-grow py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button type="button" onClick={handleAddCustomAttraction} className="bg-teal-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-600">Add</button>
            </div>
          )}
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Package Images</label>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {formData.imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`Package Preview ${index + 1}`} className="h-20 w-20 rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <label htmlFor="image-upload" className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
              <span>Upload Images</span>
              <input id="image-upload" name="image-upload" type="file" multiple className="sr-only" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">Day-wise Itinerary</h3>
          <div className="space-y-4">
            {formData.itineraries.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-2">
                  <span className="text-teal-400 font-semibold">Day {item.day}</span>
                </div>
                <textarea
                  value={item.description}
                  onChange={(e) => handleItineraryChange(index, e.target.value)}
                  required
                  rows={3}
                  placeholder={`Enter details for Day ${item.day}...`}
                  className="flex-grow py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
                {formData.itineraries.length > 1 && (
                  <button type="button" onClick={() => removeItineraryDay(index)} className="mt-2 text-red-500 hover:text-red-400">&times; Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItineraryDay} className="text-teal-400 font-semibold hover:text-teal-300">+ Add Day</button>
          </div>
        </div>

        <div className="text-right">
          <button type="submit" disabled={isSubmitting} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-500">
            {isSubmitting ? 'Adding...' : 'Add Package'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPackagePage;
