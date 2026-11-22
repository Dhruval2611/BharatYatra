import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { updateUser } from '../services/api';
import { cn } from '../lib/utils';

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        profileImageUrl: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userJson = sessionStorage.getItem('loggedInUser');
        if (userJson) {
            try {
                const loggedInUser: User = JSON.parse(userJson);
                setUser(loggedInUser);
                setFormData({
                    username: loggedInUser.username,
                    email: loggedInUser.email,
                    phone: loggedInUser.phone || '',
                    profileImageUrl: loggedInUser.profileImageUrl || '/images/profile/profile-pic.jpg',
                });
            } catch (error) {
                console.error("Corrupted user session, redirecting to login.", error);
                sessionStorage.removeItem('loggedInUser');
                navigate('/signin');
            }
        } else {
            navigate('/signin');
        }
    }, [navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profileImageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setMessage('');

        try {
            const updatedUserData: User = {
                ...user,
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                profileImageUrl: formData.profileImageUrl,
            };

            const result = await updateUser(updatedUserData);
            sessionStorage.setItem('loggedInUser', JSON.stringify(result));
            setUser(result); // Update local state to reflect changes immediately
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="relative bg-black py-24">
            <div className={cn("pointer-events-none absolute inset-0 [background-size:40px_40px] select-none", "bg-grid-white/[0.05]")} />
            <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-white text-center mb-8 font-sans tracking-tight">Edit Your Profile</h1>
                <form onSubmit={handleSubmit} className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {message && (
                        <div className={`text-center p-3 rounded-lg border ${message.includes('success') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                            {message}
                        </div>
                    )}

                    <div className="flex justify-center">
                        <label htmlFor="profile-image-upload" className="cursor-pointer group relative">
                            <div className="relative w-32 h-32">
                                <img
                                    src={formData.profileImageUrl}
                                    alt="Profile Preview"
                                    className="w-full h-full rounded-full object-cover border-4 border-white/10 group-hover:border-teal-500/50 transition-all duration-300 shadow-xl"
                                />
                                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-teal-500 rounded-full p-2 border-2 border-black shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <input id="profile-image-upload" name="profile-image" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} required className="appearance-none block w-full px-4 py-3 border border-white/10 bg-white/5 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 sm:text-sm" />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="appearance-none block w-full px-4 py-3 border border-white/10 bg-white/5 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 sm:text-sm" />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Add your phone number"
                                pattern="[0-9]{10}"
                                title="Phone number must be 10 digits."
                                className="appearance-none block w-full px-4 py-3 border border-white/10 bg-white/5 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="bg-teal-500 text-white font-semibold py-3 px-8 rounded-xl hover:bg-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-teal-500/20">
                            {isSubmitting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;