"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { quinceMainData } from "@/components/sections/data/main-data";

// Componente interno que usa useSearchParams
function EnvelopeContent({ onOpen }) {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [inviteData, setInviteData] = useState(null); // Datos de la invitación
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [hasGuestParam, setHasGuestParam] = useState(false); // Si hay parámetro guest

  // Estados para la animación temporal - Opción C (12 segundos)
  const [contentState, setContentState] = useState("hidden");
  const [isPaused, setIsPaused] = useState(false);
  const [animationTimer, setAnimationTimer] = useState(null);

  const searchParams = useSearchParams();
  const { event } = quinceMainData;

  // Recuperar el query parameter "guest" al montar el componente
  useEffect(() => {
    const guestParam = searchParams.get("guest");
    if (guestParam) {
      setHasGuestParam(true);
      getDataGuest(guestParam);
    } else {
      setHasGuestParam(false);
      // Si no hay parámetro guest, usar datos por defecto
      setInviteData({
        name: "Invitado Especial",
        message: "Te esperamos para celebrar este día tan especial",
      });
    }
  }, [searchParams]);

  const getDataGuest = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/guests/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.data) {
          const dataGuest = data.data;
          const { personalInvitation } = dataGuest;
          setInviteData({
            name: dataGuest.name,
            message:
              personalInvitation?.message ||
              "Te esperamos para celebrar este día tan especial",
            guestCount: dataGuest.guestCount || 1,
          });
        } else {
          // Si no hay datos, usar fallback
          setInviteData({
            name: "Invitado Especial",
            message: "Te esperamos para celebrar este día tan especial",
          });
        }
      } else {
        console.error("Guest not found");
        // En caso de error, usar datos por defecto
        setInviteData({
          name: "Invitado Especial",
          message: "Te esperamos para celebrar este día tan especial",
        });
      }
    } catch (error) {
      console.error("Error fetching guest data:", error);
      // En caso de error, usar datos por defecto
      setInviteData({
        name: "Invitado Especial",
        message: "Te esperamos para celebrar este día tan especial",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica de animación temporal - Opción C (12 segundos)
  const startAnimationCycle = () => {
    if (isPaused) return;

    // Timeline de 12 segundos:
    // 0-4s: hidden (solo video)
    // 4-5s: appearing (aparece)
    // 5-9s: visible (4 segundos visible)
    // 9-10s: disappearing (desaparece)
    // 10-12s: hidden (solo video)

    setContentState("hidden");

    const timer1 = setTimeout(() => {
      if (!isPaused) setContentState("appearing");
    }, 4000); // 4 segundos

    const timer2 = setTimeout(() => {
      if (!isPaused) setContentState("visible");
    }, 5000); // 5 segundos

    const timer3 = setTimeout(() => {
      if (!isPaused) setContentState("disappearing");
    }, 9000); // 9 segundos

    const timer4 = setTimeout(() => {
      if (!isPaused) {
        setContentState("hidden");
        // Reiniciar ciclo
        startAnimationCycle();
      }
    }, 10000); // 10 segundos (ciclo completo en 12s con 2s de pausa)

    // Guardar referencia para limpiar si es necesario
    setAnimationTimer([timer1, timer2, timer3, timer4]);
  };

  // Iniciar animación al montar el componente
  useEffect(() => {
    // Delay inicial para que cargue todo
    const initialDelay = setTimeout(() => {
      startAnimationCycle();
    }, 1000);

    return () => {
      clearTimeout(initialDelay);
      if (animationTimer) {
        animationTimer.forEach((timer) => clearTimeout(timer));
      }
    };
  }, []);

  // Limpiar timers cuando se pausa
  useEffect(() => {
    if (isPaused && animationTimer) {
      animationTimer.forEach((timer) => clearTimeout(timer));
      setAnimationTimer(null);
    }
  }, [isPaused]);

  // Manejar hover/interacción
  const handleMouseEnter = () => {
    setIsPaused(true);
    setContentState("visible");
  };

  const handleMouseLeave = () => {
    // Reanudar después de 2 segundos
    setTimeout(() => {
      setIsPaused(false);
      startAnimationCycle();
    }, 2000);
  };

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsOpened(true);
      setTimeout(() => {
        onOpen();
      }, 100);
    }, 200);
  };

  /**
   *
   *
   */

  return (
    <div
      className="fixed inset-0 flex items-center justify-center cursor-pointer group transition-all duration-300 hover:scale-105"
      onClick={handleOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video de fondo */}
      <div className="fixed inset-0 z-[-1]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/video/videoSobreAzul2.mp4" type="video/mp4" />
        </video>
        {/* Overlay azul pastel más sutil */}
        <div className="absolute inset-0 bg-blue-900/20"></div>
      </div>

      {/* Contenedor principal centrado con animación */}
      <div
        className={`relative z-10 max-w-lg mx-auto px-6 envelope-float content-${contentState}`}
      >
        {/* Tarjeta principal */}
        <div className="bg-gradient-to-br from-blue-50/60 via-sky-50/65 to-blue-100/60 backdrop-blur-sm backdrop-saturate-150 rounded-2xl shadow-xl shadow-blue-500/20 border border-blue-300/70 p-8 text-center transition-all duration-500 group-hover:shadow-blue-400/40 envelope-glow relative overflow-hidden">
          {/* Efecto shimmer */}
          <div className="absolute inset-0 envelope-shimmer rounded-2xl"></div>

          {/* Icono de sobre decorativo */}
          <div className="flex justify-center mb-6 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>

          {/* Contenido de la invitación */}
          <div className="space-y-4 relative z-10">
            {(inviteData || isLoading) && (
              <h5 className="text-blue-800 font-medium text-lg tracking-wide drop-shadow-sm">
                Invitación Para:
              </h5>
            )}

            <div className="text-3xl font-bold text-blue-900 leading-tight drop-shadow-md">
              {isLoading ? (
                <div className="animate-pulse bg-gradient-to-r from-blue-200/70 via-sky-200/70 to-blue-200/70 h-10 w-64 rounded-lg mx-auto"></div>
              ) : (
                inviteData?.name || "Invitado Especial"
              )}
            </div>
            {inviteData && inviteData.guestCount && (
              <div>{inviteData ? `${inviteData.guestCount} Personas` : ""}</div>
            )}

            <div className="text-xl text-blue-700 font-semibold drop-shadow-sm">
              {event.date.full}
            </div>

            {inviteData?.message && !isLoading && (
              <div className="text-blue-600 italic text-base leading-relaxed px-2 drop-shadow-sm">
                "{inviteData.message}"
              </div>
            )}

            {isLoading && (
              <div className="text-blue-600 italic text-base px-2 drop-shadow-sm animate-pulse">
                Cargando tu invitación personalizada...
              </div>
            )}
          </div>

          {/* Indicador de interacción */}
          <div className="mt-8 pt-6 border-t border-blue-300/60 relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2 text-blue-600 drop-shadow-sm">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">
                  Cargando invitación...
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-blue-600 animate-bounce drop-shadow-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Toca en cualquier lugar para abrir
                </span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Efectos decorativos */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-300/30 rounded-full blur-sm"></div>
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-sky-300/20 rounded-full blur-md"></div>
        <div className="absolute top-1/2 -left-8 w-6 h-6 bg-blue-400/25 rounded-full blur-sm"></div>
      </div>

      {/* Indicador sutil de estado de animación */}
      <div className="absolute top-6 right-6 z-20">
        {isPaused ? (
          <div className="bg-blue-600/20 backdrop-blur-sm rounded-full p-2">
            <svg
              className="w-4 h-4 text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        ) : (
          <div
            className={`bg-blue-600/20 backdrop-blur-sm rounded-full w-3 h-3 transition-all duration-1000 ${
              contentState === "visible" ? "bg-blue-400/40" : "bg-blue-600/20"
            }`}
          ></div>
        )}
      </div>
    </div>
  );
}

// Componente de loading/fallback
function EnvelopeLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-sky-100 to-blue-200 z-[60]">
      {/* Contenedor principal centrado */}
      <div className="relative z-10 max-w-lg mx-auto px-6 envelope-float">
        {/* Tarjeta principal */}
        <div className="bg-gradient-to-br from-blue-50/60 via-sky-50/65 to-blue-100/60 backdrop-blur-sm backdrop-saturate-150 rounded-2xl shadow-xl shadow-blue-500/20 border border-blue-300/70 p-8 text-center envelope-glow relative overflow-hidden">
          {/* Efecto shimmer */}
          <div className="absolute inset-0 envelope-shimmer rounded-2xl"></div>

          {/* Icono de sobre decorativo con animación */}
          <div className="flex justify-center mb-6 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>

          {/* Contenido de loading */}
          <div className="space-y-4 relative z-10">
            <h5 className="text-blue-800 font-medium text-lg tracking-wide drop-shadow-sm">
              Invitación Para:
            </h5>

            <div className="animate-pulse bg-gradient-to-r from-blue-200/70 via-sky-200/70 to-blue-200/70 h-8 w-64 rounded-lg mx-auto shadow-md"></div>

            <div className="text-xl text-blue-700 font-semibold animate-pulse drop-shadow-sm">
              Cargando fecha...
            </div>

            <div className="text-blue-600 italic text-base px-2 drop-shadow-sm">
              Preparando tu invitación personalizada...
            </div>
          </div>

          {/* Indicador de carga */}
          <div className="mt-8 pt-6 border-t border-blue-300/60 relative z-10">
            <div className="flex items-center justify-center space-x-2 text-blue-600 drop-shadow-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">
                Cargando invitación...
              </span>
            </div>
          </div>
        </div>

        {/* Efectos decorativos animados */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-300/30 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-sky-300/20 rounded-full blur-md animate-pulse delay-300"></div>
        <div className="absolute top-1/2 -left-8 w-6 h-6 bg-blue-400/25 rounded-full blur-sm animate-pulse delay-150"></div>
      </div>

      {/* Efectos de luz ambiental */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-300/10 rounded-full blur-3xl animate-pulse delay-700" />
    </div>
  );
}

// Componente principal exportado con Suspense
export default function EnvelopeOpening({ onOpen = () => {} }) {
  return (
    <Suspense fallback={<EnvelopeLoading />}>
      <EnvelopeContent onOpen={onOpen} />
    </Suspense>
  );
}
