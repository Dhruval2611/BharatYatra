import React, { useState, useEffect, useCallback } from 'react';
import { TravelPackage } from '../types';
import { fetchPackages } from '../services/api';
import PackageCard from '../components/PackageCard';
import { cn } from '../lib/utils';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
  </div>
);

const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('relevance');

  const priceRef = React.useRef(price);

  useEffect(() => {
    priceRef.current = price;
  }, [price]);

  const loadPackages = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await fetchPackages();
      setPackages(data);
      if (data.length > 0) {
        const max = Math.max(...data.map(p => p.price));
        setMaxPrice(max);
        if (priceRef.current === 0 || priceRef.current > max) {
          setPrice(max);
        }
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch packages.');
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages(true);

    const handleStorageChange = () => {
      loadPackages(false);
    };

    window.addEventListener('storageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storageUpdated', handleStorageChange);
    };
  }, [loadPackages]);

  const categories: string[] = Array.from(new Set(packages.flatMap(p => p.category)));

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setDuration('All');
    setPrice(maxPrice);
    setSortBy('relevance');
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const filteredPackages = packages.filter(pkg => {
    if (searchTerm && !pkg.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedCategories.length > 0 && !selectedCategories.some(cat => pkg.category.includes(cat))) {
      return false;
    }
    if (pkg.price > price) {
      return false;
    }
    if (duration !== 'All') {
      const [min, max] = duration.split('-').map(Number);
      if (pkg.days < min || (max && pkg.days > max)) {
        return false;
      }
    }
    return true;
  });

  const sortedAndFilteredPackages = [...filteredPackages].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return 0; // 'relevance'
    }
  });


  return (
    <div className="relative bg-black">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "bg-grid-white/[0.05] [background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
              Explore Our <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                Packages
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed">
              Find the perfect getaway from our curated list of destinations. Whether you seek adventure, relaxation, or cultural immersion, we have something for everyone.
            </p>
          </div>

          {/* Search & Filter Section */}
          {!loading && !error && (
            <div className="mb-12 p-5 bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl space-y-5">

              {/* Search Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search for your dream destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 pl-12 pr-4 text-base text-white bg-black/40 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder-gray-500"
                  aria-label="Search for a destination"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Categories */}
                <div className="lg:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Explore by Category</label>
                    {selectedCategories.length > 0 && (
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 transform hover:scale-105 ${selectedCategories.includes(cat)
                          ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25 ring-2 ring-teal-400 ring-offset-2 ring-offset-gray-900'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                          }`}
                        aria-pressed={selectedCategories.includes(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters & Sort */}
                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Duration */}
                  <div className="space-y-2">
                    <label htmlFor="duration-filter" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</label>
                    <div className="relative">
                      <select
                        id="duration-filter"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        className="w-full appearance-none py-2 px-3 text-sm text-white bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer hover:bg-gray-800"
                      >
                        <option value="All">Any Duration</option>
                        <option value="1-3">1-3 Days</option>
                        <option value="4-6">4-6 Days</option>
                        <option value="7-9">7-9 Days</option>
                        <option value="10-999">10+ Days</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label htmlFor="sort-by" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort By</label>
                    <div className="relative">
                      <select
                        id="sort-by"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="w-full appearance-none py-2 px-3 text-sm text-white bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer hover:bg-gray-800"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="price-filter" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max Price</label>
                      <span className="text-teal-400 font-bold text-sm bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">₹{price.toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      type="range"
                      id="price-filter"
                      min="0"
                      max={maxPrice}
                      step="1000"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                      <span>₹0</span>
                      <span>₹{maxPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-800/50">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-sm text-gray-400 font-medium rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200 flex items-center gap-2 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:-rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0114.13-5.22M20 15a9 9 0 01-14.13 5.22" />
                  </svg>
                  Reset All Filters
                </button>
              </div>
            </div>
          )}


          {/* Packages Grid */}
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedAndFilteredPackages.length > 0 ? (
                sortedAndFilteredPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))
              ) : (
                <p className="text-center text-gray-400 col-span-full">No packages found matching your criteria.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;