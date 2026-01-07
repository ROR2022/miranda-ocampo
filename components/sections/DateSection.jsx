// 📅 DateSection - Sección de fecha y countdown

import React, {useState, useEffect, useRef, useCallback} from 'react'
import CountdownTimer from '../countdown-timer'
//import { getOverlayStyle } from '@/utils/overlay'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { getAnimationConfig } from '@/data/animationConfig'
//import Image from 'next/image'
import { quinceMainData } from '@/components/sections/data/main-data'
import BackgroundCarrousel from './BackgroundCarrousel'

export default function DateSection() {
  //const { wedding, messages } = weddingData
  //const { dateSection } = styling
  const { event } = quinceMainData;
  //const { message } = event;
  const { parents, ceremony, date } = event;
  const sectionRef = useRef(null);
  
  // Estados para animaciones escalonadas cósmicas
  const [isInView, setIsInView] = useState(false);
  const [titleVisible, setTitleVisible] = useState(true); // Cambiado a true para visibilidad inmediata
  const [cardVisible, setCardVisible] = useState(true);   // Cambiado a true para visibilidad inmediata
  const [countdownVisible, setCountdownVisible] = useState(false);
  

  // Hook personalizado para IntersectionObserver
  const useIntersectionObserver = useCallback(() => {
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Secuencia cósmica escalonada
            setTimeout(() => setTitleVisible(true), 200);
            setTimeout(() => setCardVisible(true), 600);
            setTimeout(() => setCountdownVisible(true), 1000);
          } else {
            // Reset cuando sale de vista
            setIsInView(false);
            setTitleVisible(false);
            setCardVisible(false);
            setCountdownVisible(false);
          }
        },
        {
          threshold: 0.2,
          rootMargin: '-30px 0px'
        }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }

      return () => observer.disconnect();
    }, []);
  }, []);

  useIntersectionObserver();

  // Función helper para clases de animación cósmica
  const getCosmicAnimationClass = (isVisible, animationType, delay = '') => {
    // Simplificado temporalmente para debugging
    return isVisible ? `animate-${animationType} ${delay} ` : '';
  };
      
  const basicClass="text-8xl font-bold text-indigo-500 mb-2";
  const completeClass="text-8xl font-bold text-indigo-500 mb-2 animate-number-pulse";
    

  // Configurar animación de scroll con fallback de carga inmediata
  const animationConfig = getAnimationConfig('date')
  // Ya no necesitamos el hook useScrollAnimation, usamos nuestro IntersectionObserver

  return (
    <section 
      ref={sectionRef}
      /* style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url('${parents.backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }} */
     style={{
      //background: "url('/images/texturaAzul01.jpeg')",
    }}
      id="date" 
      className={`relative overflow-hidden`}
    >
      {/* <BackgroundCarrousel images={date.backgroundCarrouselImages || []} /> */}

      {/* Partículas flotantes de lazos
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
              📅
            </div>
          ))}
        </div>
        */}

      <div className="container text-white mx-auto px-4 p-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Mensaje inicial con animación cósmica */}
          <div className={getCosmicAnimationClass(titleVisible, 'cosmic-fade-in', 'delay-100')}>
            <p className="text-lg italic text-blue-700 font-bold">
              {date.mensaje1}
            </p>
          </div>

          {/* Título holográfico */}
          <div className={getCosmicAnimationClass(titleVisible, 'cosmic-fade-in', 'delay-200')}>
            <h2 
              style={{
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              }}
              className="italic text-4xl font-bold holographic-text"
            >
              FECHA ESPECIAL
            </h2>
          </div>

          {/* Card principal cósmica/holográfica */}
          <div className={getCosmicAnimationClass(cardVisible, 'calendar-flip', 'delay-300')}>
            <div 
              className="date-card rounded-3xl p-12 max-w-md mx-auto relative overflow-hidden"
              style={{
                minHeight: '300px',
                backgroundColor: 'rgba(99, 102, 241, 0.2)', // Fallback background
                border: '2px solid rgba(99, 102, 241, 0.5)',
                display: 'block'
              }}
            >
              
              {/* Contenido de la card */}
              <div className="relative z-20">
                <div className="text-2xl font-medium text-white mb-2 text-glow">
                  {date.day ? date.day.toUpperCase() : 'SÁBADO'}
                </div>
                
                <div className='flex justify-center gap-3'>
                  <div className={cardVisible ? completeClass : basicClass}>
                    {date.dayNumber || '27'}
                  </div>
                </div>
                
                <div className="text-2xl font-medium text-white mb-2 text-glow">
                  {date.month ? date.month.toUpperCase() : 'DICIEMBRE'}
                </div>
                <div className="text-3xl font-medium text-white holographic-text">
                  {date.year || '2025'}
                </div>
              </div>

              {/* Borde rotativo - Movido después del contenido para que no lo tape */}
              <div className="absolute inset-0 rounded-3xl p-1 animate-rotating-border -z-10">
                <div className="w-full h-full bg-black/20 rounded-3xl"></div>
              </div>

              {/* Elementos decorativos internos de la card */}
              <div className="absolute top-4 left-4 text-lg opacity-70 animate-clock-tick z-10">⏰</div>
              <div className="absolute top-4 right-4 text-lg opacity-70 animate-star-shimmer z-10">✨</div>
              <div className="absolute bottom-4 left-4 text-lg opacity-70 animate-star-shimmer delay-500 z-10">💫</div>
              <div className="absolute bottom-4 right-4 text-lg opacity-70 animate-clock-tick delay-300 z-10">🕐</div>
            </div>
          </div>

          {/* Mensaje final */}
          <div className={getCosmicAnimationClass(cardVisible, 'cosmic-fade-in', 'delay-500')}>
            <h3 className="font-script text-3xl text-blue-700 italic font-bold">
              {date.mensaje2}
            </h3>
          </div>

          {/* Countdown con animación */}
          <div 
          className={getCosmicAnimationClass(countdownVisible, 'cosmic-fade-in', 'delay-700')}
          >
            <CountdownTimer />
          </div>
        </div>
      </div>
    </section>
  )
}
