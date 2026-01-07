// 🎁 GiftsSection - Sección de información de regalos

import React, { useState, useEffect, useRef } from "react";
import { Gift } from "lucide-react";
import { quinceMainData } from "@/components/sections/data/main-data";
import Image from "next/image";


export default function GiftsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { event, gifts } = quinceMainData;
  const { parents } = event;
  const { giftsOptions } = gifts;

  // IntersectionObserver para animaciones escalonadas con reactivación
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
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

  return (
    <section
      ref={sectionRef}
      style={{
        /* backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${parents.backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat', */
        position: 'relative',
      }}
      id="gifts"
      className="py-20"
    >


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
              🎁
            </div>
          ))}
        </div>
      */}
      

      <div className="container text-white mx-auto px-4 p-6 rounded-2xl">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Título con animación escalonada */}
          <div className={`transition-all duration-1000 delay-0 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-12'
          }`}>
            <h2 
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
              className="font-main-text text-5xl text-sky-700"
            >
              Regalo
            </h2>
          </div>

          {/* Tarjeta central con animación escalonada */}
          <div className={`transition-all duration-1000 delay-1000 ${
            isVisible 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-75'
          }`}>
            <div className="bg-muted/50 rounded-2xl p-8 max-w-md mx-auto">
              
              <Image
                src="/images/regalo.jpg"
                alt="Icono de Regalos"
                width={100}
                height={100}
                className="mx-auto mb-4 rounded-full"
              />
              <h3 
                style={{display:'none'}}
                className="font-script text-3xl text-foreground mb-4"
              >
                {gifts.type}
              </h3>
              <p className="text-purple-600 text-xl">{gifts.message}</p>
            </div>
          </div>
          {/* Cards de opciones con animaciones escalonadas */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
            {giftsOptions.map((option, index) => {
              const delays = ['delay-2000', 'delay-3000', 'delay-4000', 'delay-5000', 'delay-6000'];
              const delayClass = delays[index] || 'delay-2000';
              
              return (
                <div 
                  key={option.id} 
                  className={`transition-all duration-1000 ${delayClass} ${
                    isVisible 
                      ? 'opacity-100 translate-x-0' 
                      : `opacity-0 ${index % 2 === 0 ? '-translate-x-12' : 'translate-x-12'}`
                  }`}
                >
                  <div className="bg-white/70 p-6 rounded-2xl w-64 text-black">
                    <h4 className="text-xl font-medium mb-2">{option.name}</h4>
                    <p className="text-4xl">{option.icon}</p>
                    <p className="text-muted">
                      {option.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
