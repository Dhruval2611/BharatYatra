import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TravelPackage, User } from '../types';
import { updateUser } from '../services/api';
import ImageCarousel from './ImageCarousel';

interface PackageCardProps {
  pkg: TravelPackage;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg }) => {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const userJson = sessionStorage.getItem('loggedInUser');
    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);
        setLoggedInUser(user);
        setIsLiked(user.likedPackages?.includes(pkg.id) ?? false);
      } catch (error) {
        console.error("Failed to parse user from sessionStorage in PackageCard", error);
        sessionStorage.removeItem('loggedInUser');
        setLoggedInUser(null);
      }
    }
  }, [pkg.id]);

  const handleCardClick = () => {
    navigate(`/packages/${pkg.id}`);
  };

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/packages/${pkg.id}`);
  };

  // Listen for storage updates to keep local state in sync
  useEffect(() => {
    const handleStorageChange = () => {
      const userJson = sessionStorage.getItem('loggedInUser');
      if (userJson) {
        try {
          const user: User = JSON.parse(userJson);
          setLoggedInUser(user);
          setIsLiked(user.likedPackages?.includes(pkg.id) ?? false);
        } catch (error) {
          console.error("Failed to parse user from sessionStorage in PackageCard", error);
        }
      } else {
        setLoggedInUser(null);
        setIsLiked(false);
      }
    };

    window.addEventListener('storageUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storageUpdated', handleStorageChange);
    };
  }, [pkg.id]);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Get the latest user state from storage to avoid race conditions
    const latestUserJson = sessionStorage.getItem('loggedInUser');
    if (!latestUserJson) {
      navigate('/signin', { state: { from: `/packages/${pkg.id}` } });
      return;
    }

    let currentUser: User;
    try {
      currentUser = JSON.parse(latestUserJson);
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      return;
    }

    const currentLiked = currentUser.likedPackages || [];
    const isCurrentlyLiked = currentLiked.includes(pkg.id);
    const newLikedState = !isCurrentlyLiked;

    setIsLiked(newLikedState); // Optimistic UI update

    const newLikedPackages = newLikedState
      ? [...currentLiked, pkg.id]
      : currentLiked.filter(id => id !== pkg.id);

    const updatedUser = { ...currentUser, likedPackages: newLikedPackages };

    try {
      await updateUser(updatedUser);
      sessionStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      // Dispatch event to notify other components (including this one via the listener)
      window.dispatchEvent(new Event('storageUpdated'));
    } catch (error) {
      console.error("Failed to update liked packages:", error);
      setIsLiked(!newLikedState); // Revert UI on error
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white rounded-2xl shadow-lg hover:shadow-teal-500/20 transform hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative h-56 overflow-hidden group">
        <ImageCarousel images={pkg.imageUrls || (pkg.imageUrl ? [pkg.imageUrl] : [])} alt={pkg.title} />
        <div className="absolute top-4 right-4 bg-black/70 text-white text-sm font-semibold px-3 py-1 rounded-full z-10">
          {pkg.duration}
        </div>
        {loggedInUser && (
          <button
            onClick={handleLikeClick}
            className="absolute top-4 left-4 bg-black/50 p-2 rounded-full text-white hover:text-red-500 transition-colors z-10"
            aria-label={isLiked ? "Unlike package" : "Like package"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow space-y-4">
          <h3 className="text-2xl font-bold text-white line-clamp-2">{pkg.title}</h3>

          <div className="flex flex-wrap gap-2">
            {pkg.placeTags.map(tag => (
              <span key={tag} className="bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {pkg.attractionTags.map(tag => (
              <span key={tag} className="flex items-center bg-teal-900/50 text-teal-300 text-xs font-medium px-3 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <div className="flex justify-between items-center">
            <p className="text-3xl font-bold text-white">
              ₹{pkg.price.toLocaleString('en-IN')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                className="font-semibold text-gray-300 hover:text-white transition-colors"
              >
                View Details
              </button>
              <button
                onClick={handleBookNowClick}
                className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;