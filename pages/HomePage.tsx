import React from 'react';
import { Link } from 'react-router-dom';
import TextType from '../components/TextType';
import CardSwap, { Card } from '../components/CardSwap';
import SpotlightCard from '../components/SpotlightCard';
import { cn } from '../lib/utils';
import { Spotlight } from '../components/ui/spotlight';
import Expandable from '../components/animata/carousel/expandable';

const categories = [
  {
    title: "Cultural",
    description: "Explore the rich traditions, festivals, and heritage of India.",
    spotlightColor: "rgba(255, 99, 71, 0.3)" // tomato
  },
  {
    title: "Nature",
    description: "Discover breathtaking landscapes and serene natural beauty.",
    spotlightColor: "rgba(60, 179, 113, 0.3)" // mediumseagreen
  },
  {
    title: "Adventure",
    description: "Experience thrilling activities and adrenaline-pumping adventures.",
    spotlightColor: "rgba(255, 165, 0, 0.3)" // orange
  },
  {
    title: "Beach",
    description: "Relax on pristine beaches and enjoy coastal vibes.",
    spotlightColor: "rgba(70, 130, 180, 0.3)" // steelblue
  },
  {
    title: "Mountain",
    description: "Trek majestic mountains and enjoy panoramic views.",
    spotlightColor: "rgba(123, 104, 238, 0.3)" // mediumslateblue
  },
  {
    title: "Spiritual",
    description: "Embark on spiritual journeys and visit sacred sites.",
    spotlightColor: "rgba(218, 112, 214, 0.3)" // orchid
  }
];

const mostVisitedPlaces = [
  { image: "/images/most visited places/leh-ladakh.webp", title: "Leh-Ladakh" },
  { image: "/images/most visited places/Ooty.webp", title: "Ooty" },
  { image: "/images/most visited places/taj mahel.webp", title: "Taj Mahal" },
  { image: "/images/most visited places/kerala.webp", title: "Kerala" },
  { image: "/images/most visited places/rameshwaram.webp", title: "Rameshwaram" },
  { image: "/images/most visited places/shimla.webp", title: "Shimla" },
];

const HomePage: React.FC = () => {
  return (
    <div className="relative bg-black/[0.96] overflow-x-hidden">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "bg-grid-white/[0.05] [background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />

      <div id="home" className="w-full rounded-md relative z-10 flex flex-col items-center justify-center antialiased px-4 pt-20 min-h-screen">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <TextType
            as="h1"
            text={["Welcome to <span class=\"text-teal-400\">Bharat Yatra</span>", "Embark on an incredible <span class=\"text-teal-400\">journey</span>"]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-4xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 font-sans font-bold"
          />
        </div>
        <div className="flex gap-4 mt-8 justify-center">
          <Link to="/about" className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition">About Us</Link>
          <Link to="/packages" className="bg-teal-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-600 transition">Explore Packages</Link>
        </div>
      </div>

      <div className="relative">
        <section id="categories" className="w-full py-16 px-4 md:px-0 flex flex-col items-center justify-center relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-200 mb-12">Explore Travel Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(({ title, description, spotlightColor }) => (
                <SpotlightCard key={title} spotlightColor={spotlightColor} className="p-8 rounded-2xl shadow-lg bg-white/5 backdrop-blur-sm min-h-[190px] border border-white/10">
                  <div className="h-full flex flex-col justify-center items-center text-center">
                    <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">{description}</p>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        <section id="most-visited-places" className="w-full py-16 px-4 md:px-0 min-h-screen flex flex-col items-center justify-center relative z-10">
          <div className="max-w-6xl mx-auto text-center w-full">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-200 mb-12">Most Visited Places</h2>
            <Expandable list={mostVisitedPlaces} />
          </div>
        </section>

        <section id="popular-destinations" className="w-full py-16 px-4 md:px-0 min-h-screen flex items-center justify-center relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-200 mb-4">Travel Gallery</h2>
              <p className="text-lg text-neutral-400 leading-relaxed mb-2">
                Discover the most breathtaking and iconic destinations across India, each offering unique experiences and unforgettable memories.
              </p>
            </div>
            <div className="flex-1 flex justify-center items-center h-[600px] scale-[0.85] origin-center">
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={3000}
                pauseOnHover={false}
              >
                <Card>
                  <img src="/images/showcase/Showcase 1.webp" alt="Showcase 1" className="w-full h-full object-cover" loading="lazy" />
                </Card>
                <Card>
                  <img src="/images/showcase/Showcase 2.webp" alt="Showcase 2" className="w-full h-full object-cover" loading="lazy" />
                </Card>
                <Card>
                  <img src="/images/showcase/Showcase 3.webp" alt="Showcase 3" className="w-full h-full object-cover" loading="lazy" />
                </Card>
              </CardSwap>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;