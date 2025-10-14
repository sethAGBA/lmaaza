import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, menuItems }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Carousel logic
  const bannerSlogan = "L'Maaza — Innover au service des communautés";
  const carouselImages = [
    '/images/directeur.jpg',
    '/images/ooz2_23.jpg',
    '/images/ooz2_24.jpg',
    '/images/ooz2_30.jpg',
    '/images/ooz2_31.jpg',
    '/images/ooz2_32.jpg',
    '/images/ooz2_33.jpg'
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayRef = useRef(null);
  const overlayRef = useRef(null);

  const next = useCallback(() => {
    setActiveIndex(i => (i + 1) % carouselImages.length);
  }, [carouselImages.length]);

  const prev = useCallback(() => {
    setActiveIndex(i => (i - 1 + carouselImages.length) % carouselImages.length);
  }, [carouselImages.length]);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) return;
    autoplayRef.current = setInterval(next, 4000);
  }, [next]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);
  
  const restartAutoplay = useCallback(() => {
    stopAutoplay();
    setTimeout(startAutoplay, 2000);
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') {
        prev();
        restartAutoplay();
      } else if (e.key === 'ArrowRight') {
        next();
        restartAutoplay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, restartAutoplay]);

  const showCarousel = true;

  return (
    <div className="min-h-screen bg-white">
      <Header isScrolled={isScrolled} menuItems={menuItems} />
      {showCarousel && (
        <div className="relative">
          <div className="overlay-caption">
            <div className="slogan">{bannerSlogan}</div>
          </div>
          <div className="director-hero-overlay">
            <div className="carousel-track">
              {carouselImages.map((src, i) => (
                <img
                  role="button"
                  tabIndex={0}
                  key={src}
                  src={src}
                  alt={`carousel-${i}`}
                  className={`carousel-image ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => { setActiveIndex((i + 1) % carouselImages.length); restartAutoplay(); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveIndex((i + 1) % carouselImages.length); restartAutoplay(); } }}
                />
              ))}
              <div
                className="carousel-controls"
                onFocus={stopAutoplay}
                onBlur={startAutoplay}
                ref={overlayRef}
              >
                <button aria-label="Précédent" onClick={(e) => { e.stopPropagation(); prev(); restartAutoplay(); }}>&larr;</button>
                <button aria-label="Suivant" onClick={(e) => { e.stopPropagation(); next(); restartAutoplay(); }}>&rarr;</button>
              </div>
              <div className="carousel-indicators">
                {carouselImages.map((_, i) => (
                  <button
                    key={i}
                    className={i === activeIndex ? 'active' : ''}
                    onClick={() => { setActiveIndex(i); restartAutoplay(); }}
                    aria-label={`Aller à l'image ${i + 1}`}
                  />
                ))}
              </div>
              <div className="carousel-thumbnails">
                {carouselImages.map((src, i) => (
                  <button key={src} className={`thumb ${i === activeIndex ? 'active' : ''}`} onClick={() => { setActiveIndex(i); restartAutoplay(); }} aria-label={`Thumbnail ${i+1}`}>
                    <img src={src} alt={`thumb-${i}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <main className={showCarousel ? "content-with-overlay" : ""}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;