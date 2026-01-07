// 🪄 TimelineSection - Cronograma mágico del evento

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { quinceMainData } from "./data/main-data";
import BackgroundCarrousel from "./BackgroundCarrousel";

export default function TimelineSection() {
  const { timeline, event } = quinceMainData;
  const { parents } = event;
  const { events } = timeline;

  const [isVisible, setIsVisible] = useState(false);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [sparklePositions, setSparklePositions] = useState([]);
  const [windowWidth, setWindowWidth] = useState(0);
  const sectionRef = useRef(null);


  const timelineImages = {
    vals: "/images/vals.jpg",
    pastel: "/images/pastel.jpg",
    ceremonia: "/images/ceremonia.jpg",
    fiesta: "/images/fiestaPao1.jpg",
    copas: "/images/copas.jpeg",
    cena: "/images/cena.jpeg",
  };
  const timelineNames = ['vals', 'pastel', 'ceremonia', 'fiesta', 'copas', 'cena'];

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generar partículas sparkle
  const generateSparkles = () => {
    const sparkles = [];
    for (let i = 0; i < 12; i++) {
      sparkles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 4,
        size: Math.random() * 6 + 4,
      });
    }
    return sparkles;
  };

  // Simple IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Generar sparkles cuando la sección se hace visible
            setTimeout(() => {
              setSparklePositions(generateSparkles());
            }, 1500);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Log para debugging
  //console.log('TimelineSection render:', { isVisible, timeline, events });

  return (
    <section
      ref={sectionRef}
      /* style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.6)), url('${parents.backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }} */
      id="timeline"
      className="py-20 min-h-screen relative overflow-hidden"
    >
      {/* <BackgroundCarrousel images={timeline.images}/> */}

      {/* Partículas flotantes de confeti
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute welcome-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 1000}ms`,
                fontSize: `${12 + Math.random() * 8}px`,
                color: 'rgba(255, 255, 255, 0.6)'
              }}
            >
              ✨
            </div>
          ))}
        </div>
      */}
      
      {/* Partículas sparkle mágicas */}
      {sparklePositions.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle-particle animate-sparkle-trail absolute z-10 pointer-events-none"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}s`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
          }}
        />
      ))}

      {/* Elementos decorativos mágicos flotantes */}
      {isVisible && (
        <>
          {/* Varitas mágicas */}
          <div className="magical-element animate-magic-wand absolute top-20 left-10 text-4xl wand-icon pointer-events-none z-10">
            🪄
          </div>
          <div className="magical-element animate-magic-wand absolute top-40 right-16 text-3xl wand-icon pointer-events-none z-10" 
               style={{ animationDelay: '1.5s' }}>
            🪄
          </div>
          
          {/* Cristales flotantes */}
          <div className="magical-element animate-crystal-pulse absolute top-32 left-1/4 text-3xl crystal-icon pointer-events-none z-10">
            💎
          </div>
          <div className="magical-element animate-crystal-pulse absolute bottom-40 right-1/4 text-4xl crystal-icon pointer-events-none z-10"
               style={{ animationDelay: '2s' }}>
            💎
          </div>
          
          {/* Estrellas mágicas */}
          <div className="magical-element animate-magical-float absolute top-16 right-1/3 text-2xl magic-star pointer-events-none z-10">
            ⭐
          </div>
          <div className="magical-element animate-magical-float absolute bottom-32 left-1/3 text-3xl magic-star pointer-events-none z-10"
               style={{ animationDelay: '1s' }}>
            ✨
          </div>
          <div className="magical-element animate-magical-float absolute top-1/2 left-16 text-2xl magic-star pointer-events-none z-10"
               style={{ animationDelay: '3s' }}>
            🌟
          </div>
        </>
      )}
      
      {/* Contenido principal */}
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          
          {/* 
          style={{
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              }}
              className="font-main-text text-4xl font-bold holographic-text"
          Título principal con animación básica */}
          <div className="text-center mb-16">
            <h2 
            style={{
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            className={`flex flex-col gap-3 text-5xl md:text-6xl font-bold mb-6 holographic-text transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <span>✨</span>
              <span>Cronograma</span>
              <span>Mágico</span>
            </h2>
            <div className={`w-32 h-1 mx-auto bg-gradient-to-r from-purple-600 to-pink-400 rounded-full transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`} />
          </div>

          <div className="flex flex-col gap-16 items-center justify-center">
            
            {/* Portal con imagen animado */}
            <div className={`relative transition-all duration-1000 delay-700 ${
              isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-12'
            }`}>
              <div className="w-80 h-80 mx-auto relative rounded-full overflow-hidden border-4 border-purple-400 shadow-2xl">
                {/* Anillo mágico giratorio */}
                <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 via-pink-500 to-violet-600 rounded-full opacity-75 animate-spin" style={{ animationDuration: '8s' }}></div>
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src='/images/pao22.jpg'
                    alt="Portal del tiempo"
                    fill
                    className="object-cover scale-110"
                    sizes="(max-width: 768px) 80vw, 40vw"
                  />
                  {/* Overlay mágico */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-pink-400/20 rounded-full" />
                </div>
              </div>
            </div>

            {/* Timeline con animaciones secuenciales y línea SVG */}
            <div className="relative">
              
              {/* Línea temporal SVG */}
              <svg 
              style={{display:'none'}}
                className="absolute left-8 top-0 w-1 h-full z-10"
                viewBox="0 0 4 100" 
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="magicalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <path
                  className={`transition-all duration-2000 ${isVisible ? 'animate-timeline-flow' : ''}`}
                  d="M2,0 L2,100"
                  stroke="url(#magicalGradient)"
                  strokeWidth="4"
                  strokeDasharray="10,5"
                  fill="none"
                  style={{ 
                    animationDelay: '1.2s',
                    strokeDashoffset: isVisible ? '0' : '100'
                  }}
                />
              </svg>

              <div className="space-y-8">
                {events.map((item, index) => (
                  <div
                    key={item.id}
                    className={`timeline-card p-6 rounded-2xl border border-purple-400/30 text-white transition-all duration-700 relative ${
                      isVisible 
                        ? 'opacity-100 translate-x-0 translate-y-0' 
                        : 'opacity-0 translate-x-8 translate-y-4'
                    }`}
                    style={{
                      transitionDelay: `${1000 + (index * 200)}ms`
                    }}
                  >
                    {/* Conector mágico al timeline */}
                    <div 
                    className={` w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-400 rounded-full border-4 border-white/30 transition-all duration-500 ${
                      isVisible ? 'animate-crystal-pulse scale-100' : 'scale-0'
                    }`}
                    style={{ 
                      transitionDelay: `${1200 + (index * 200)}ms`,
                      display: 'none'  
                      }} />
                    
                    <div className="flex items-center gap-6">
                      <div className={`w-20 h-20 ${
                        isVisible 
                          ? "" 
                          : ""
                      } flex items-center justify-center relative overflow-hidden`}
                      style={{ animationDelay: `${index * 0.3 + 2}s` }}>
                        
                        {/* Efecto de brillo interno  animate-magical-float */}
                        {/* <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent rounded-2xl" /> */}
                        
                       
                        {timelineNames.includes(item.icon) ? (
                          <Image
                            src={timelineImages[item.icon]}
                            alt={item.title}
                            fill
                            className="object-cover absolute inset-0 z-0 rounded-full"
                          />
                        )
                        : <span className="text-3xl relative z-10 filter " role="img" aria-label={item.id}>
                          {item.icon}
                        </span>
                      }
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2">
                          {item.title}
                        </h3>
                        <div className={`text-3xl font-bold text-sky-700`}>
                          {item.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mensaje final con animación */}
          <div className={`text-center mt-20 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${1000 + (events.length * 200) + 500}ms` }}>
            <div className="bg-slate-300 bg-opacity-50 max-w-2xl mx-auto p-8 rounded-2xl border border-purple-400/30">
              
              <p className="text-xl italic text-blue-500 font-bold">
                &ldquo;{timeline.mensaje}&rdquo;
              </p>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
