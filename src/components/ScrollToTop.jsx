import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Threshold to show button (in pixels)
  const SCROLL_THRESHOLD = 300;

  useEffect(() => {
    const scrollOptions = { top: 0, left: 0, behavior: 'smooth' };

    window.scrollTo(scrollOptions);

    document.querySelectorAll('[data-scroll-container="page"]').forEach((container) => {
      container.scrollTo(scrollOptions);
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      // Calculate scroll progress (0 to 100)
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setScrollProgress(progress);

      // Show button when scrolled past threshold
      setIsVisible(scrollTop > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{scrollToTopStyles}</style>
      
      <button
        onClick={scrollToTop}
        className="scroll-to-top-btn"
        aria-label="Scroll to top"
      >
        {/* Progress indicator ring */}
        <svg className="scroll-progress-ring" viewBox="0 0 36 36">
          <circle
            className="scroll-progress-bg"
            cx="18"
            cy="18"
            r="16"
            fill="none"
            strokeWidth="3"
          />
          <circle
            className="scroll-progress-fill"
            cx="18"
            cy="18"
            r="16"
            fill="none"
            strokeWidth="3"
            strokeDasharray="100"
            strokeDashoffset={100 - scrollProgress}
            transform="rotate(-90 18 18)"
          />
        </svg>
        
        {/* Arrow icon */}
        <ChevronUp className="scroll-arrow-icon" size={20} strokeWidth={2.5} />
      </button>
    </>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const scrollToTopStyles = `
  .scroll-to-top-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
    border: 2px solid rgba(255,255,255,0.15);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 4px 14px rgba(37, 99, 235, 0.35),
      0 2px 6px rgba(0,0,0,0.15);
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    opacity: 0.95;
    animation: scrollBtnFadeIn 0.25s ease-out;
  }

  @keyframes scrollBtnFadeIn {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.92);
    }
    to {
      opacity: 0.95;
      transform: translateY(0) scale(1);
    }
  }

  .scroll-to-top-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 
      0 8px 22px rgba(37, 99, 235, 0.45),
      0 4px 10px rgba(0,0,0,0.2);
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    opacity: 1;
  }

  .scroll-to-top-btn:active {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 
      0 4px 12px rgba(37, 99, 235, 0.35),
      0 2px 6px rgba(0,0,0,0.15);
  }

  .scroll-to-top-btn:focus {
    outline: none;
    box-shadow: 
      0 0 0 3px rgba(37, 99, 235, 0.35),
      0 4px 14px rgba(37, 99, 235, 0.35);
  }

  /* Progress ring */
  .scroll-progress-ring {
    position: absolute;
    top: -2px;
    left: -2px;
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    pointer-events: none;
  }

  .scroll-progress-bg {
    stroke: rgba(255, 255, 255, 0.2);
  }

  .scroll-progress-fill {
    stroke: rgba(255, 255, 255, 0.8);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.15s ease;
  }

  /* Arrow icon */
  .scroll-arrow-icon {
    color: #fff;
    z-index: 1;
    position: relative;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .scroll-to-top-btn {
      bottom: 18px;
      right: 18px;
      width: 44px;
      height: 44px;
    }

    .scroll-arrow-icon {
      size: 18px;
    }
  }

  /* Dark/light mode support */
  @media (prefers-color-scheme: dark) {
    .scroll-to-top-btn {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    }
  }
`;

export default ScrollToTop;
