export interface Itinerary {
  day: number;
  description: string;
}

export interface TravelPackage {
  id: string;
  title: string;
  description?: string;
  duration: string;
  days: number;
  price: number;
  imageUrls: string[];
  itineraries: Itinerary[];
  category: string[]; // Array of categories, max 3
  placeTags: string[];
  attractionTags: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profileImageUrl?: string;
  phone?: string;
  likedPackages?: string[];
}

export interface Booking {
  id: string;
  packageId: string;
  packageName: string;
  userName: string;
  userEmail: string;
  userMobile: string;
  travelers: number;
  totalPrice: number;
  bookingDate: string; // ISO string
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  userAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  travelDate?: string;
}
