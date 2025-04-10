"use client";

import { useEffect, useState, useRef } from "react";

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);
  const previousScrollY = useRef(0);
  const targetProgress = useRef(0);

  useEffect(() => {
    // Subtle delay before showing the progress bar
    const timer = setTimeout(() => setIsVisible(true), 300);

    // Check for dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Smooth animation function
    const animate = () => {
      // Smooth lerp (linear interpolation) for organic movement
      setProgress(prev => {
        const delta = (targetProgress.current - prev) * 0.08;
        return Math.abs(delta) < 0.1 ? targetProgress.current : prev + delta;
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    requestRef.current = requestAnimationFrame(animate);

    // Update progress bar on scroll with debouncing
    const updateProgressBar = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      
      // Only update on significant scroll changes
      if (Math.abs(winScroll - previousScrollY.current) > 5) {
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        targetProgress.current = (winScroll / height) * 100;
        previousScrollY.current = winScroll;
      }
    };
    
    // Add event listeners
    window.addEventListener("scroll", updateProgressBar);
    updateProgressBar(); // Initial call
    
    // Add listener for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    checkDarkMode(); // Initial check
    
    // Clean up
    return () => {
      window.removeEventListener("scroll", updateProgressBar);
      observer.disconnect();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 h-2">
      <div className="relative w-full h-full bg-border/30">
        <div 
          className={`absolute top-0 left-0 h-full transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
          style={{ width: '100%' }}
        >
          <div
            className={`h-full w-full ${isDarkMode ? 'bg-gradient-to-r from-white/80 to-white' : 'bg-gradient-to-r from-black/80 to-black'}`}
            style={{ 
              width: `${progress}%`,
              transition: 'width 50ms cubic-bezier(0.23, 1, 0.32, 1)',
              boxShadow: isDarkMode ? '0 0 8px rgba(255, 255, 255, 0.5)' : '0 0 8px rgba(0, 0, 0, 0.3)'
            }}
          />
        </div>
      </div>
    </div>
  );
} 