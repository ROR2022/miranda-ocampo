// 🏠 HeroSection - Sección principal/portada

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { quinceMainData } from "@/components/sections/data/main-data";
import BackgroundCarrousel from "../../components/sections/BackgroundCarrousel";
//import { getOverlayStyle } from '@/utils/overlay'
//import { useScrollAnimation } from '@/hooks/useScrollAnimation'
//import { getAnimationConfig } from '@/data/animationConfig'

export default function HeroSection() {
  //const { couple, wedding } = weddingData;
  //const { heroSection } = styling
  const { hero } = quinceMainData;
  const { backgroundCarrouselImages } = hero;
  const [scrollPosition, setScrollPosition] = useState(window.scrollY);
  const [isVisible, setIsVisible] = useState(false);
  const [sparklePositions, setSparklePositions] = useState([]);

  const basicClass = "font-script text-4xl text-sky-700 mb-4 italic";
  const completeClass =
    "font-script text-4xl text-sky-700 mb-4 scale-up-center italic";

  useEffect(() => {
    const handleScroll = () => {
      //console.log('Scroll position:', window.scrollY);
      setScrollPosition(window.scrollY);
    };
    setSparklePositions(generateSparkles());

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (scrollPosition >= 0 && scrollPosition < 300) {
      setIsVisible(true);
    }
  }, [scrollPosition]);

  // Generar partículas sparkle
  const generateSparkles = () => {
    const sparkles = [];
    for (let i = 0; i < 40; i++) {
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

  return (
    <section
      //ref={sectionRef}
      style={{
        backgroundImage: `url('/images/marcoFlores2.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        //backgroundColor: "#89ac76",
        position: "relative",
      }}
      //id="home"
      className="min-h-screen flex flex-col justify-center items-center relative"
    >
      {/* <BackgroundCarrousel images={backgroundCarrouselImages}/> */}

      {/* Partículas flotantes de corazones 
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute welcome-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 1000}ms`,
              fontSize: `${12 + Math.random() * 8}px`,
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            💝
          </div>
        ))}
      </div>
      */}

      {/* Partículas sparkle mágicas 
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
        */}

      {/* Contenido principal - Usar solo animación CSS, no scroll-based */}
      <div
        style={
          {
            //backgroundColor:'#C8BFE780'
          }
        }
        className="flex flex-col justify-center items-center text-center px-4 py-20 md:py-32 lg:py-40"
      >
        <h1
          style={{
            textShadow: "4px 4px 8px rgba(0, 0, 0, 0.5)",
            display: "none",
          }}
          className={isVisible ? completeClass : basicClass}
        >
          {hero.subtitle.split(" ").map((word, index) => (
            <span key={index}>
              {index === 1 ? <span className="italic">{word}</span> : word}
              {index < hero.subtitle.split(" ").length - 1 && " "}
            </span>
          ))}
        </h1>

        <div className="space-y-2">
          <div className="spotlight-image relative w-full h-96 rounded-full shadow-2xl overflow-hidden mx-auto">
            <Image
              src="/images/marifer01.jpeg"
              alt="Ceremony Image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* El efecto spotlight se aplica via CSS */}
          </div>
          <div
            style={{
              textShadow: "4px 4px 8px rgba(0, 0, 0, 0.5)",
            }}
            className="text-6xl text-cyan-700 font-main-text"
          >
            {hero.name}
          </div>
        </div>
      </div>
    </section>
  );
}
