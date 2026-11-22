import React, { useEffect, useState } from 'react';
import { fetchPackages } from '../services/api';
import { TravelPackage, User } from '../types';
import { cn } from '../lib/utils';
import PackageCard from '../components/PackageCard';
import { Link } from 'react-router-dom';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
    </div>
);

const LikedPackagesPage: React.FC = () => {
    const [likedPackages, setLikedPackages] = useState<TravelPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLikedPackages = async () => {
            setLoading(true);
            setError(null);
            try {
                const userJson = sessionStorage.getItem('loggedInUser');
                if (!userJson) {
                    throw new Error("User not logged in.");
                }
                const user: User = JSON.parse(userJson);
                const likedIds = new Set(user.likedPackages || []);

                if (likedIds.size === 0) {
                    setLikedPackages([]);
                    return;
                }

                const allPackages = await fetchPackages();
                const userLikedPackages = allPackages.filter(p => likedIds.has(p.id));
                setLikedPackages(userLikedPackages);
            } catch (err) {
                console.error("Failed to load liked packages:", err);
                setError("Could not load your liked packages. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        loadLikedPackages();
    }, []);

    // This effect reloads liked packages if the user likes/unlikes on this page.
    useEffect(() => {
        const handleStorageChange = () => {
            const userJson = sessionStorage.getItem('loggedInUser');
            if (userJson) {
                const user: User = JSON.parse(userJson);
                const currentLikedIds = new Set(likedPackages.map(p => p.id));
                const userLikedIds = new Set(user.likedPackages || []);

                if (currentLikedIds.size !== userLikedIds.size) {
                    setLikedPackages(prev => prev.filter(p => userLikedIds.has(p.id)));
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [likedPackages]);

    return (
        <div className="relative bg-black py-24">
            <div className={cn("pointer-events-none absolute inset-0 [background-size:40px_40px] select-none", "bg-grid-white/[0.05]")} />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-white text-center mb-10">Your Liked Packages</h1>

                {loading && <LoadingSpinner />}
                {error && <p className="text-center text-red-400">{error}</p>}

                {!loading && !error && (
                    likedPackages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {likedPackages.map(pkg => (
                                <PackageCard key={pkg.id} pkg={pkg} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
                            <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white font-sans mb-2">No Liked Packages Yet</h2>
                            <p className="text-gray-400 max-w-md mx-auto mb-8">Click the heart icon on any package to save it here for later.</p>
                            <Link to="/packages" className="inline-flex items-center gap-2 bg-teal-500 text-white font-semibold py-3 px-8 rounded-xl hover:bg-teal-600 transition-all duration-200 shadow-lg shadow-teal-500/20">
                                Find Packages
                            </Link>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default LikedPackagesPage;