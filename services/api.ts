import { TravelPackage, User, Booking } from '../types';


// PACKAGES API
export const fetchPackages = async (): Promise<TravelPackage[]> => {
    try {
        const response = await fetch('http://localhost:5000/api/packages');
        if (!response.ok) {
            throw new Error('Failed to fetch packages');
        }
        const packages = await response.json();
        return packages;
    } catch (error) {
        console.error('Error fetching packages:', error);
        throw error;
    }
};

export const fetchPackageById = async (id: string): Promise<TravelPackage | undefined> => {
    try {
        const response = await fetch(`http://localhost:5000/api/packages/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                return undefined;
            }
            throw new Error('Failed to fetch package');
        }
        const pkg = await response.json();
        return pkg;
    } catch (error) {
        console.error('Error fetching package by id:', error);
        throw error;
    }
};

export const addPackage = async (pkgData: Omit<TravelPackage, 'id'>): Promise<TravelPackage> => {
    try {
        const response = await fetch('http://localhost:5000/api/packages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pkgData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create package');
        }

        const newPackage = await response.json();

        // Dispatch event to notify UI components to refresh
        window.dispatchEvent(new Event('storageUpdated'));

        return {
            ...newPackage,
            id: newPackage.id.toString(), // Ensure id is string
        };
    } catch (error) {
        console.error('Error adding package:', error);
        throw error;
    }
};

export const updatePackage = async (updatedPackage: TravelPackage): Promise<TravelPackage> => {
    try {
        const response = await fetch(`http://localhost:5000/api/packages/${updatedPackage.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPackage),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update package');
        }

        const updatedPkg = await response.json();

        // Dispatch event to notify UI components to refresh
        window.dispatchEvent(new Event('storageUpdated'));

        return {
            ...updatedPkg,
            id: updatedPkg.id.toString(), // Ensure id is string
        };
    } catch (error) {
        console.error('Error updating package:', error);
        throw error;
    }
};

export const deletePackage = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`http://localhost:5000/api/packages/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete package');
        }

        // Dispatch event to notify UI components to refresh
        window.dispatchEvent(new Event('storageUpdated'));
    } catch (error) {
        console.error('Error deleting package:', error);
        throw error;
    }
};

// USERS API
export const fetchUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch('http://localhost:5000/api/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const users = await response.json();
        return users.map((user: any) => ({
            ...user,
            id: user.id.toString(), // Ensure id is string
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
        const response = await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create user');
        }

        const newUser = await response.json();

        // Dispatch event to notify UI components to refresh
        window.dispatchEvent(new Event('storageUpdated'));

        return {
            ...newUser,
            id: newUser.id.toString(), // Convert id to string to match User interface
        };
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
};

export const updateUser = async (updatedUserData: User): Promise<User> => {
    try {
        const response = await fetch(`http://localhost:5000/api/users/${updatedUserData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUserData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update user');
        }

        const updatedUser = await response.json();

        // Dispatch event to notify UI components to refresh
        window.dispatchEvent(new Event('storageUpdated'));

        return {
            ...updatedUser,
            id: updatedUser.id.toString(), // Ensure id is string
        };
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};


export const deleteUser = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`http://localhost:5000/api/users/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete user');
        }

        // Dispatch event to notify UI components to refresh
        window.dispatchEvent(new Event('storageUpdated'));
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};


// BOOKINGS API
export const fetchBookings = async (): Promise<Booking[]> => {
    try {
        const response = await fetch('http://localhost:5000/api/bookings');
        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }
        const bookings = await response.json();
        return bookings;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

export const addBooking = async (bookingData: Omit<Booking, 'id' | 'bookingDate' | 'status'>): Promise<Booking> => {
    try {
        const response = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create booking');
        }

        const newBooking = await response.json();

        // Dispatch event to notify UI components to refresh
        window.dispatchEvent(new Event('storageUpdated'));

        return newBooking;
    } catch (error) {
        console.error('Error adding booking:', error);
        throw error;
    }
};


export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<Booking | undefined> => {
    try {
        const response = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update booking status');
        }

        // Since the API doesn't return the updated booking, we'll fetch all bookings and find the updated one
        const bookings = await fetchBookings();

        // Dispatch event to notify UI components to refresh
        window.dispatchEvent(new Event('storageUpdated'));

        return bookings.find(b => b.id === id);
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error;
    }
};

export const deleteBooking = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete booking');
        }

        // Dispatch event to notify UI components to refresh
        window.dispatchEvent(new Event('storageUpdated'));
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
    }
};
