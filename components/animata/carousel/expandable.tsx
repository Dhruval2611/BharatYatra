import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ExpandableItem {
  image: string;
  title: string;
}

interface ExpandableProps {
  list: ExpandableItem[];
}

const Expandable: React.FC<ExpandableProps> = ({ list }) => {
  const [active, setActive] = useState(0);

  return (
    <div className="flex w-full h-[400px] md:h-[600px] gap-2 md:gap-4 p-4 bg-neutral-900/50 rounded-2xl">
      {list.map((item, index) => (
        <motion.div
          key={item.title}
          className="relative h-full rounded-2xl shadow-lg cursor-pointer overflow-hidden"
          animate={{ width: active === index ? '40%' : '15%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onMouseEnter={() => setActive(index)}
        >
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          <motion.div
            className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: active === index ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white text-lg md:text-2xl font-bold capitalize">{item.title}</h3>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default Expandable;