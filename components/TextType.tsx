import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextTypeProps {
  // Fix: Use React.ElementType for polymorphic 'as' prop to resolve JSX namespace errors.
  as?: React.ElementType;
  text: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  className?: string;
}

const TextType: React.FC<TextTypeProps> = ({
  as: Tag = 'h1',
  text,
  typingSpeed = 75,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = '|',
  className,
}) => {
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  // Fix: Replace NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleTyping = () => {
      const currentText = text[textIndex];

      // Stop condition: Finished typing the current string. Wait, then start deleting.
      if (!isDeleting && displayedText === currentText) {
        timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseDuration);
        return;
      }

      // Stop condition: Finished deleting. Move to the next string.
      if (isDeleting && displayedText === '') {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % text.length);
        return;
      }

      const updateText = () => {
        let nextText;
        if (isDeleting) {
          // If the end of the string is an HTML tag, remove the whole tag.
          if (displayedText.endsWith('>')) {
            const lastOpeningBracket = displayedText.lastIndexOf('<');
            if (lastOpeningBracket !== -1) {
              nextText = displayedText.substring(0, lastOpeningBracket);
            } else {
              // Fallback for malformed string.
              nextText = displayedText.substring(0, displayedText.length - 1);
            }
          } else {
            // Otherwise, remove one character.
            nextText = displayedText.substring(0, displayedText.length - 1);
          }
        } else { // is typing
          const currentLength = displayedText.length;
          // If the next character is the start of an HTML tag, add the whole tag.
          if (currentText[currentLength] === '<') {
            const closingBracketIndex = currentText.indexOf('>', currentLength);
            if (closingBracketIndex !== -1) {
              nextText = currentText.substring(0, closingBracketIndex + 1);
            } else {
              // Fallback for malformed string.
              nextText = currentText.substring(0, currentLength + 1);
            }
          } else {
            // Otherwise, add one character.
            nextText = currentText.substring(0, currentLength + 1);
          }
        }
        setDisplayedText(nextText);
      };
      
      const delay = isDeleting ? typingSpeed / 2 : typingSpeed;
      timeoutRef.current = setTimeout(updateText, delay);
    };

    handleTyping();

    return () => {
      if(timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [displayedText, isDeleting, text, textIndex, typingSpeed, pauseDuration]);

  return (
    <Tag className={className}>
      <span dangerouslySetInnerHTML={{ __html: displayedText }} />
      <AnimatePresence>
        {showCursor && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            className="ml-1"
          >
            {cursorCharacter}
          </motion.span>
        )}
      </AnimatePresence>
    </Tag>
  );
};

export default TextType;
