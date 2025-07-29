// src/components/AnimatedText/AnimatedText.tsx
import React from 'react';
import './AnimatedText.css';

interface AnimatedTextProps {
  text: string;
  // Optionally, you could pass which words/letters to animate or custom class names
  className?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = '' }) => {
  // Split the text into letters.
  // If you prefer word-level animations, you could split on spaces instead.
  return (
    <span className={`animated-text ${className}`}>
      {text.split('').map((char, index) => (
        <span key={index} className="animated-letter">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default AnimatedText;
