// 🎵 AudioPlayer Component - Reproductor visual fijo con animaciones

"use client";

import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useAutoPlayOnInteraction } from "@/hooks/useAutoPlayOnInteraction";
//import { weddingData } from "@/data/weddingData";
import { quinceMainData } from "@/components/sections/data/main-data";
const { audio } = quinceMainData;

function AudioPlayer() {
  const { isPlaying, isLoading, error, toggle, restart, progress } =
    useAudioPlayer(audio);

  // Hook para auto-play en primera interacción
  const { hasInteracted, isWaitingForInteraction, tryAutoPlay } =
    useAutoPlayOnInteraction();

  // Intentar auto-play cuando el usuario interactúe por primera vez
  React.useEffect(() => {
    if (hasInteracted && !isPlaying && !error) {
      // Pequeño delay para mejor UX
      const timer = setTimeout(() => {
        const audioElement = document.querySelector("audio");
        if (audioElement) {
          tryAutoPlay(audioElement).then((success) => {
            if (!success) {
              // Si el auto-play falla, mostrar indicador visual más fuerte
              console.log(
                "🎵 Auto-play falló, usuario debe hacer click manual"
              );
            }
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [hasInteracted, isPlaying, error, tryAutoPlay]);

  React.useEffect(() => {
    if (hasInteracted) {
      console.warn("🎵 Usuario ya interactuó, no es necesario esperar más");
    tryAutoPlay(); // Intentar auto-play al montar
    }
  }, []);

  // Si hay error crítico, no mostrar el reproductor
  if (error && !audio?.src) {
    return null;
  }

  return (
    <>
      {/* Estilos CSS personalizados para efectos */}
      <style jsx>{`
        @keyframes glow {
          0% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6),
              0 0 30px rgba(59, 130, 246, 0.4);
          }
          100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
          }
        }
        @keyframes breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
      `}</style>
      <div
        style={{
          zIndex: 6000,
        }}
        className="flex gap-3 justify-center items-center fixed bottom-10 right-10 group"
      >
        {/* 🎵 Leyenda llamativa "Música" */}
        {!isPlaying && (
          <div
            className={`transition-all duration-500 ${
              isWaitingForInteraction ? "animate-bounce" : ""
            }`}
          >
            <p
              className="text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
              style={{
                background: isWaitingForInteraction
                  ? "linear-gradient(135deg, #1E40AF, #3B82F6, #60A5FA)"
                  : "linear-gradient(135deg, #1E40AF, #3B82F6)",
                boxShadow: isWaitingForInteraction
                  ? "0 0 20px rgba(59, 130, 246, 0.7), 0 0 35px rgba(59, 130, 246, 0.4), 0 4px 15px rgba(0, 0, 0, 0.3)"
                  : "0 4px 12px rgba(0, 0, 0, 0.3)",
                border: isWaitingForInteraction
                  ? "2px solid rgba(147, 197, 253, 0.6)"
                  : "1px solid rgba(147, 197, 253, 0.3)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "0.8px",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              }}
              onClick={toggle}
              title={
                isWaitingForInteraction
                  ? "¡Haz click para escuchar música!"
                  : "Control de música"
              }
            >
              {isWaitingForInteraction ? "🎵 ¡Escucha!" : "🎵 Música"}
            </p>
          </div>
        )}
        {/* Contenedor del reproductor */}
        <div className="bg-slate-500 rounded-xl p-1">
          <div style={{ display: "none" }}>
            <h3
              style={{
                color: "white",
                fontSize: "1rem",
                fontFamily: "cursive",
                fontStyle: "italic",
              }}
            >
              Canción
            </h3>
          </div>

          <div className="relative">
            {/* Anillo de progreso */}
            <div className="absolute inset-0 w-14 h-14">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-white/20"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-amber-500 transition-all duration-300"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 10}`,
                    strokeDashoffset: `${2 * Math.PI * 10 * (1 - progress)}`,
                  }}
                />
              </svg>
            </div>

            {/* Botón principal - Azul vibrante llamativo */}
            <button
              onClick={toggle}
              disabled={isLoading}
              className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 ease-out hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-400/30 hover:border-blue-300/50"
              style={{
                boxShadow: isPlaying
                  ? "0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)"
                  : isWaitingForInteraction
                  ? "0 0 25px rgba(37, 99, 235, 0.6), 0 0 50px rgba(37, 99, 235, 0.3)"
                  : "0 0 15px rgba(37, 99, 235, 0.3)",
              }}
              aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
            >
              <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause
                    size={20}
                    className="transform transition-transform duration-200 group-hover:scale-110"
                  />
                ) : (
                  <Play
                    size={20}
                    className="ml-0.5 transform transition-transform duration-200 group-hover:scale-110"
                  />
                )}
              </div>

              {/* Efectos visuales según estado */}
              {isPlaying ? (
                // Efecto de ondas cuando reproduce
                <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-ping" />
              ) : isWaitingForInteraction ? (
                // Efecto MUY llamativo cuando espera primera interacción
                <>
                  <div
                    className="absolute inset-0 rounded-full border-2 border-blue-300/80 animate-pulse"
                    style={{
                      animation:
                        "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite, glow 2s ease-in-out infinite alternate",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border border-blue-200/60 animate-ping"
                    style={{ animationDelay: "0.5s" }}
                  />
                </>
              ) : (
                // Efecto de pulso normal cuando está pausado
                <div
                  className="absolute inset-0 rounded-full border-2 border-blue-300/60 animate-pulse"
                  style={{
                    animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  }}
                />
              )}
            </button>

            {/* Tooltip informativo */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 ease-out pointer-events-none whitespace-nowrap">
              {isLoading
                ? "Cargando..."
                : error
                ? "Error de audio"
                : isWaitingForInteraction
                ? "🎵 ¡Click para reproducir música!"
                : isPlaying
                ? "Pausar música"
                : "Reproducir música"}

              <div className="absolute top-full right-4 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-black/80" />
            </div>

            {/* Indicador de error con botón de reinicio */}
            {error && (
              <div className="absolute -top-2 -right-2 flex items-center gap-1">
                <button
                  onClick={restart}
                  className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-md hover:shadow-lg"
                  title="Reiniciar audio"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            )}
          </div>
        </div>{" "}
        {/* Cierre del contenedor del reproductor */}
      </div>{" "}
      {/* Cierre del contenedor principal */}
    </>
  );
}

export default AudioPlayer;
