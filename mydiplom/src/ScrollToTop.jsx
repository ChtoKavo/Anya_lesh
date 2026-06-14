import React, { useState, useEffect } from 'react';
import './ScrollToTop.css';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Показывать кнопку когда страница прокручена на 300px
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Плавный скролл наверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button 
          className="scroll-to-top cloud-btn"
          onClick={scrollToTop}
          aria-label="Наверх"
        >
          <img src="/cloud.png" alt="cloud" className="cloud-icon" />
          <span className="arrow-up">↑</span>
        </button>
      )}
    </>
  );
};

export default ScrollToTop;