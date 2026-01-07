"use client"

import { useState, useEffect, useRef } from "react"
import { Heart } from "lucide-react"
import Image from "next/image"
import { quinceMainData } from "@/components/sections/data/main-data";

export default function WelcomeMessage({ onContinue }) {
  const [isVisible, setIsVisible] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const sectionRef = useRef(null)

  // IntersectionObserver para activar animaciones
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            // Activar partículas después de que aparezcan los elementos principales
            setTimeout(() => setShowParticles(true), 3000)
          }
        });
      },
      {
        threshold: 0.3,
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

  const handleContinue = () => {
    setIsVisible(false)
    setTimeout(onContinue, 500)
  }

  return (
    <div 
      ref={sectionRef}
      style={{
        background: `url('${quinceMainData.welcomeSection.backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat', 
      }}
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    >
      

      {/* Main content card con animación especial */}
      <div
        className={`relative bg-slate-400 bg-opacity-50 rounded-2xl py-6 z-10 max-w-3xl mx-auto transition-all duration-1000 delay-0 ${
          isVisible 
            ? 'opacity-100 welcome-card-entrance' 
            : 'opacity-0 scale-50'
        }`}
      >
        <div className="p-12 text-center text-black">
          {/* Heart icon con latido */}
          <div className={`mb-8 transition-all duration-1000 delay-1000 ${
            isVisible 
              ? 'opacity-100 translate-y-0 welcome-heartbeat' 
              : 'opacity-0 -translate-y-12'
          }`}>
            <Heart className="w-16 h-16 mx-auto text-white" />
          </div>

          {/* Decorative line con efecto de dibujo */}
          <div className={`mb-8 transition-all duration-1000 delay-2000 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <svg className="w-32 h-4 mx-auto text-white" viewBox="0 0 128 16" fill="none">
              <path
                d="M2 8C20 2 40 14 64 8C88 2 108 14 126 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={isVisible ? "welcome-draw-line" : ""}
                style={{
                  strokeDasharray: isVisible ? "200" : "0",
                  strokeDashoffset: isVisible ? "0" : "200"
                }}
              />
            </svg>
          </div>

          {/* Main message con animación */}
          <div className={`space-y-6 mb-8 transition-all duration-1000 delay-3000 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-12'
          }`}>
            <p 
              style={{ 
                textShadow: '4px 4px 8px rgba(0, 0, 0, 0.5)',
              }}
              className="text-2xl font-bold text-white font-main-text"
            >
              {quinceMainData.welcomeSection.message}
            </p>
          </div>

          {/* Continue button con glow effect */}
          <div className={`transition-all duration-1000 delay-4000 ${
            isVisible 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-75'
          }`}>
            <button
              onClick={handleContinue}
              className={`bg-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:scale-105 ${
                isVisible ? 'welcome-button-glow' : ''
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>

      {/* Bottom decorative image con animación */}
      <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-32 opacity-20 transition-all duration-1000 delay-5000 ${
        isVisible 
          ? 'opacity-20 translate-y-0' 
          : 'opacity-0 translate-y-12'
      }`}>
        <Image
          src="/placeholder.svg?height=128&width=400"
          alt="Manos románticas"
          width={400}
          height={128}
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Floating particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
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
              💕
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
