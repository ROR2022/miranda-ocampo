// 👨‍👩‍👧‍👦 ParentsSection - Sección de información de padres

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { quinceMainData } from "@/components/sections/data/main-data";

export default function ParentsSection() {
  //const { parents } = weddingData;
  const { parents, godparents } = quinceMainData.event;
  const sectionRef = useRef(null);

  // Estados para animaciones escalonadas
  const [isInView, setIsInView] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [parentsVisible, setParentsVisible] = useState(false);
  const [godparentsVisible, setGodparentsVisible] = useState(false);

  // Hook personalizado para IntersectionObserver
  const useIntersectionObserver = useCallback(() => {
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Secuencia de animaciones escalonadas
            setTimeout(() => setMessageVisible(true), 300);
            setTimeout(() => setParentsVisible(true), 700);
            setTimeout(() => setGodparentsVisible(true), 1100);
          } else {
            // Reset cuando sale de vista
            setIsInView(false);
            setMessageVisible(false);
            setParentsVisible(false);
            setGodparentsVisible(false);
          }
        },
        {
          threshold: 0.3,
          rootMargin: "-50px 0px",
        }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }

      return () => observer.disconnect();
    }, []);
  }, []);

  useIntersectionObserver();

  // Función helper para clases de animación
  const getAnimationClass = (isVisible, animationType, delay = "") => {
    const baseClass = "";
    const animClass = isVisible ? `animate-${animationType} ${delay}` : "";
    return `${baseClass} ${animClass}`.trim();
  };

  const basicClass = "font-main-text text-5xl text-white mb-4";
  const completeClass =
    "font-main-text text-5xl text-white mb-4 scale-up-center";

  return (
    <section
      ref={sectionRef}
      /* style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${parents.backgroundImage}')`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }} */
      style={{
        backgroundImage: `url('/images/marcoFlores2.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        //backgroundColor: "#89ac76",
        position: "relative",
      }}
      id="parents"
      className={`pb-0 relative overflow-hidden`}
    >

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
              🎀
            </div>
          ))}
        </div>
      */}

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="relative p-6 z-10 text-center space-y-2 py-12">
              <div
                style={{
                  width: "200px",
                  display: "none",
                }}
                className="rounded-full mx-auto mb-4"
              >
                <Image
                  src="/images/marcoPaola03.png"
                  alt="Divider Floral"
                  width={200}
                  height={50}
                  className="object-cover rounded-full"
                />
              </div>

              <div style={{ display: "none" }}>
                <Image
                  src="/images/pao16.jpg"
                  alt="Icono de Papás"
                  width={200}
                  height={300}
                  className={
                    isInView
                      ? "scale-up-center mx-auto mb-4 rounded-full"
                      : "mx-auto mb-4"
                  }
                />
              </div>

              <div className="space-y-2">
                {/* Mensaje principal con animación */}
                <div
                  className={getAnimationClass(
                    messageVisible,
                    "fade-in-up",
                    "delay-200"
                  )}
                >
                  <p className="text-lg italic max-w-2xl mx-auto text-cyan-900 flex flex-col space-y-4">
                    <span>
                      Primero agradezco a Dios por la vida, su amor y por
                      permitirme llegar a este día tan especial.
                    </span>
                  </p>
                </div>
                {/* Card de Padres */}
                <div
                  className={`${getAnimationClass(
                    parentsVisible,
                    "slide-in-left",
                    "delay-400"
                  )}`}
                >
                  <div className="rounded-xl ">
                    <div className="flex items-center justify-center">
                      <h3
                        className={parentsVisible ? completeClass : basicClass}
                      >
                        Mis papás
                      </h3>
                    </div>
                    <div className="space-y-3  text-blue-900 font-bold">
                      <div className="flex items-center justify-center space-x-2">
                        <p className="text-xl font-medium">{parents.father}</p>
                      </div>
                      <p>&</p>
                      <div className="flex items-center justify-center space-x-2">
                        <p className="text-xl font-medium text-glow">
                          {parents.mother}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Mensaje principal con animación */}
                <div
                  className={getAnimationClass(
                    messageVisible,
                    "fade-in-up",
                    "delay-200"
                  )}
                >
                  <p className="text-lg italic max-w-2xl mx-auto text-cyan-900 flex flex-col space-y-4">
                    <span>
                      Gracias por su guía, sacrificios y amor incondicional. Hoy
                      celebro mis quince años con alegría, porque Dios y
                      ustedes me enseñaron a soñar. Los amo con todo mi corazón.
                    </span>
                  </p>
                </div>

                <div
                  style={{ display: "none" }}
                  className={getAnimationClass(
                    messageVisible,
                    "fade-in-up",
                    "delay-200"
                  )}
                >
                  <p className="text-lg italic max-w-2xl mx-auto text-blue-900 font-bold">
                    Y la Compañia de
                  </p>
                </div>
                {/* Card de Padrinos */}
                <div
                  style={{ display: "none" }}
                  className={`${getAnimationClass(
                    godparentsVisible,
                    "slide-in-right",
                    "delay-600"
                  )}`}
                >
                  <div className="rounded-xl p-6 ">
                    <div className="flex items-center justify-center mb-4">
                      <h3
                        className={
                          godparentsVisible ? completeClass : basicClass
                        }
                      >
                        Mis Tutores
                      </h3>
                    </div>
                    <div className="space-y-3 text-cyan-900">
                      <div className="flex items-center justify-center space-x-2">
                        <p className="text-xl font-medium text-glow">
                          {godparents.godfather}
                        </p>
                      </div>
                      <p>&</p>
                      <div className="flex items-center justify-center space-x-2">
                        <p className="text-xl font-medium text-glow">
                          {godparents.additionalGodmother}
                        </p>
                      </div>
                      <p>&</p>
                      <div className="flex items-center justify-center space-x-2">
                        <p className="text-xl font-medium text-glow">
                          {godparents.godmother}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
