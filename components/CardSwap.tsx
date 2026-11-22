import React, { useState, useEffect, ReactElement, isValidElement, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-[300px] h-[450px] md:w-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-gray-800">
      {children}
    </div>
  );
};

interface CardSwapProps {
  children: ReactElement[];
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
}

const CardSwap: React.FC<CardSwapProps> = ({
  children,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
}) => {
  const [cards, setCards] = useState(children);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCards(children);
  }, [children]);

  const cycleCards = useCallback(() => {
    setCards((prevCards) => {
      const newCards = [...prevCards];
      const firstCard = newCards.shift();
      if (firstCard) {
        newCards.push(firstCard);
      }
      return newCards;
    });
  }, []);

  useEffect(() => {
    if (!pauseOnHover || !isHovered) {
      intervalRef.current = setInterval(cycleCards, delay);
    }
    
    return () => {
      if(intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delay, pauseOnHover, isHovered, cycleCards]);

  const variants = {
    initial: (index: number) => ({
      y: -index * verticalDistance,
      x: index * cardDistance,
      scale: 1 - index * 0.1,
      zIndex: cards.length - index,
      opacity: index === cards.length -1 ? 0 : 1 - index * 0.2, // hide the last one to be swapped in
    }),
    animate: (index: number) => ({
      y: -index * verticalDistance,
      x: index * cardDistance,
      scale: 1 - index * 0.1,
      zIndex: cards.length - index,
      opacity: 1 - index * 0.2,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 30,
      },
    }),
    exit: {
      y: verticalDistance,
      x: -cardDistance,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div
      className="relative w-[400px] h-[600px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false}>
        {cards.map((card, index) => {
          // The child of <Card> is expected to be an image element for the key.
          // FIX: Cast `card.props` to safely access the `children` property and resolve TypeScript error.
          const cardContent = React.Children.toArray((card.props as { children: React.ReactNode }).children)[0];
          let key: string | number = index;
          // FIX: Safely access props on the child element to derive a stable key for animations.
          // This resolves TypeScript errors about accessing properties on `unknown` or generic element types.
          if (isValidElement(cardContent)) {
            const props = cardContent.props as { src?: string };
            if (props.src) {
              key = props.src;
            }
          }

          return (
            <motion.div
              key={key} // Use image src as key for stable animation
              custom={index}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {card}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default CardSwap;
