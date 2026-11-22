
import React from 'react';
import { Spotlight } from '../components/ui/spotlight';
import { cn } from '../lib/utils';
import CountUp from '../components/ui/CountUp';

const teamMembers = [
  {
    name: "Dhruval Gondaliya",
    title: "Founder & CEO",
    years: "15+ years in travel industry",
    image: "/images/profile/Dhruval.jpg",
  },
];

const AboutPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-black min-h-screen">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "bg-grid-white/[0.05] [background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />

      {/* Hero & About Section - Creative Overlap Layout */}
      <section className="relative w-full py-24 md:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-20">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight text-center">
                We Craft <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                  Memories
                </span>
              </h1>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl mt-8 lg:mt-0 hover:bg-white/10 transition-colors duration-300">
                <p className="text-gray-200 text-lg leading-relaxed mb-6">
                  Welcome to <span className="text-teal-400 font-bold">Bharat Yatra</span>. We aren't just a travel agency; we are your gateway to the soul of India. Our passion lies in revealing the hidden gems, the vibrant cultures, and the untold stories of this magnificent land.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  From the snow-capped peaks of the Himalayas to the sun-kissed beaches of the south, we curate journeys that are as unique as you are. Experience travel that goes beyond sightseeing—experience travel that touches your heart.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-800 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
              <img
                src="/images/family2.jpeg"
                alt="Traveling Family"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-8 left-8 z-20">
                <p className="text-white text-xl font-bold">Explore the Unexplored</p>
                <p className="text-teal-400 text-sm">With Bharat Yatra</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements - Glassmorphism Cards with Animation */}
      <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: 50, suffix: "K+", label: "Happy Travelers", icon: "Users" },
              { number: 500, suffix: "+", label: "Destinations", icon: "Map" },
              { number: 15, suffix: "+", label: "Years Experience", icon: "Award" },
              { number: 98, suffix: "%", label: "Satisfaction", icon: "Heart" }
            ].map((stat, idx) => (
              <div key={idx} className="group bg-gray-900/40 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl hover:bg-gray-800/60 hover:border-teal-500/30 transition-all duration-300 text-center">
                <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-2 group-hover:text-teal-400 transition-colors">
                  <CountUp end={stat.number} suffix={stat.suffix} duration={2.5} />
                </h3>
                <p className="text-gray-400 font-medium tracking-wide uppercase text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision - Modern Cards */}
      <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-gray-900 to-black p-10 rounded-3xl border border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-teal-500/20"></div>
            <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-8 bg-teal-500 rounded-full mr-4"></span>
              Our Mission
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              To be the compass that guides you to India's most authentic experiences. We strive to create seamless, personalized, and culturally immersive journeys that leave a lasting positive impact on both the traveler and the destinations we cherish.
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black p-10 rounded-3xl border border-gray-800 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 transition-all group-hover:bg-purple-500/20"></div>
            <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-8 bg-purple-500 rounded-full mr-4"></span>
              Our Vision
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              To redefine travel in India by setting the standard for excellence, innovation, and sustainability. We envision a world where every journey with Bharat Yatra fosters understanding, connection, and a deep appreciation for our diverse heritage.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 z-10 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-12">Meet the <span className="text-teal-400">Visionary</span></h2>
          <div className="flex justify-center">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-900/60 backdrop-blur-md p-8 rounded-3xl border border-gray-800 shadow-2xl max-w-sm w-full transform hover:-translate-y-2 transition-transform duration-300">
                <div className="relative w-40 h-40 mx-auto mb-6 rounded-full p-1 bg-gradient-to-tr from-teal-400 to-purple-500">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full border-4 border-black"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-teal-400 font-medium mb-4">{member.title}</p>
                <div className="h-px w-16 bg-gray-700 mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm italic">{member.years}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;