import React from 'react';

const popularDestinations = [
  "Goa",
  "Kerala",
  "Rajasthan",
  "Himachal Pradesh",
  "Uttarakhand",
];

const travelServices = [
  "Holiday Packages",
  "Hotel Booking",
  "Flight Booking",
  "Transportation",
  "Tour Guides",
];

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-black text-white py-12 px-6 mt-auto bg-grid-white/[0.05]">
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Section 1: Logo and Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img src="/images/BY logo.png" alt="Bharat Yatra Logo" className="h-24 w-auto mb-2" />
            <img src="/images/text-logo.png" alt="Bharat Yatra Text Logo" className="h-20 w-auto mb-3 translate-x-2" />
            <p className="text-gray-400 text-sm">
                Crafting unforgettable journeys across the vibrant landscapes of India.
            </p>
          </div>

          {/* Section 2: Popular Destinations */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popular Destinations</h3>
            <ul className="space-y-2 text-gray-300">
              {popularDestinations.map((place) => (
                <li key={place} className="hover:text-teal-300 cursor-pointer transition-colors">
                  {place}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Travel Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Travel Services</h3>
            <ul className="space-y-2 text-gray-300">
              {travelServices.map((service) => (
                <li key={service} className="hover:text-teal-300 cursor-pointer transition-colors">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <address className="not-italic text-gray-300 space-y-2 text-sm">
              <div>123 Travel Street, Mumbai, India</div>
              <div>Phone: +91 98765 43210</div>
              <div>Email: <a href="mailto:info@bharatyatra.com" className="underline hover:text-teal-300 transition-colors">info@bharatyatra.com</a></div>
              <div>Hours: Mon-Sat: 9AM-7PM</div>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
             <p>© {new Date().getFullYear()} Bharat Yatra. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;