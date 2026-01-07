"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, Music } from 'lucide-react'

const SimpleMusicPlayer = () => {
    const music = '/audio/galeria.mp3';
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [showWelcomePrompt, setShowWelcomePrompt] = useState(true);
    const [audioReady, setAudioReady] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // 🎵 Función para iniciar música automáticamente
    const startAutoPlay = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio || hasUserInteracted) return;

        try {
            console.log('🎵 Iniciando autoplay en primera interacción...');
            
            // Configurar audio
            audio.volume = 0.7;
            audio.muted = false;
            
            // Intentar reproducir
            const playPromise = audio.play();
            await playPromise;
            
            setIsPlaying(true);
            setHasUserInteracted(true);
            setShowWelcomePrompt(false);
            console.log('✅ Autoplay exitoso!');
            
        } catch (error) {
            console.log('⚠️ Autoplay bloqueado:', error);
            // Mantener prompt visible si autoplay falla
            setShowWelcomePrompt(true);
        }
    }, [hasUserInteracted]);

    // 👆 Detectar primera interacción del usuario (SOLO eventos válidos para audio)
    useEffect(() => {
        if (hasUserInteracted) return;

        let isHandled = false;

        const handleFirstInteraction = async (event: Event) => {
            if (isHandled) return;
            isHandled = true;
            
            console.log('👆 Primera interacción VÁLIDA detectada:', event.type);
            setHasUserInteracted(true);
            
            // Intentar autoplay inmediatamente
            await startAutoPlay();
            
            // Limpiar listeners
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };

        console.log('🎯 Configurando listeners de autoplay (SOLO eventos válidos para audio)...');
        
        // SOLO eventos que los navegadores consideran válidos para iniciar audio
        document.addEventListener('click', handleFirstInteraction, { passive: true, once: true });
        document.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
        document.addEventListener('keydown', handleFirstInteraction, { passive: true, once: true });

        // Timer de respaldo para mostrar prompt (independiente del autoplay)
        const promptTimer = setTimeout(() => {
            if (!hasUserInteracted) {
                console.log('⏰ Mostrando prompt de música (sin mousemove/scroll)');
                setShowWelcomePrompt(true);
            }
        }, 2000);

        return () => {
            clearTimeout(promptTimer);
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
    }, [hasUserInteracted, startAutoPlay]);

    // 🎵 Toggle manual del audio
    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio) {
            console.log('❌ Audio ref no disponible');
            return;
        }

        try {
            if (isPlaying) {
                console.log('⏸️ Pausando música...');
                audio.pause();
                setIsPlaying(false);
            } else {
                console.log('▶️ Reproduciendo música...');
                audio.volume = 0.7;
                audio.muted = false;
                
                await audio.play();
                setIsPlaying(true);
            }
            
            setHasUserInteracted(true);
            setShowWelcomePrompt(false);
            
        } catch (error) {
            console.log('❌ Error en togglePlay:', error);
            setShowWelcomePrompt(true);
        }
    };

    // 📡 Eventos del audio element
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedData = () => {
            console.log('📀 Audio cargado');
            setAudioReady(true);
        };

        const handleCanPlay = () => {
            console.log('✅ Audio listo para reproducir');
            setAudioReady(true);
        };

        const handlePlay = () => {
            console.log('▶️ Audio iniciado');
            setIsPlaying(true);
        };

        const handlePause = () => {
            console.log('⏸️ Audio pausado');
            setIsPlaying(false);
        };

        const handleEnded = () => {
            console.log('🔄 Audio terminado, reiniciando...');
            if (audio.loop) {
                audio.currentTime = 0;
                audio.play();
            } else {
                setIsPlaying(false);
            }
        };

        const handleError = (e: Event) => {
            console.log('❌ Error de audio:', e);
            setAudioReady(false);
        };

        // Registrar eventos
        audio.addEventListener('loadeddata', handleLoadedData);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('loadeddata', handleLoadedData);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    return (
        <div 
            className="fixed bottom-6 right-6 z-50 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 🎵 Audio element autónomo */}
            <audio 
                ref={audioRef} 
                preload="metadata" 
                loop
                crossOrigin="anonymous"
            >
                <source src={music} type="audio/mpeg" />
                Su navegador no soporta el elemento audio.
            </audio>

            {/* 💬 Prompt de bienvenida para autoplay */}
            {showWelcomePrompt && !hasUserInteracted && (
                <div className="absolute bottom-full right-0 mb-4 animate-bounce z-10">
                    <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg shadow-xl max-w-xs">
                        <div className="flex items-center space-x-2">
                            <Music size={16} className="animate-pulse" />
                            <span className="text-sm font-medium">
                                ¡Haz click para música! 🎵
                            </span>
                        </div>
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-pink-500" />
                    </div>
                </div>
            )}

            {/* 🎵 Botón principal del reproductor */}
            <button
                onClick={togglePlay}
                className={`
                    relative flex items-center justify-center
                    w-14 h-14 rounded-full
                    bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600
                    shadow-lg hover:shadow-xl
                    transition-all duration-300 ease-out
                    hover:scale-110 active:scale-95
                    border-2 border-white/20
                    backdrop-blur-sm
                    ${isPlaying ? 'animate-pulse' : ''}
                    ${showWelcomePrompt && !hasUserInteracted ? 'ring-4 ring-pink-300 ring-opacity-75 animate-pulse' : ''}
                `}
                aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
                title={hasUserInteracted ? (isPlaying ? 'Pausar música' : 'Reproducir música') : '¡Click para activar música automática!'}
            >
                {/* 🌊 Ondas cuando está reproduciendo */}
                {isPlaying && (
                    <>
                        <div className="absolute inset-0 rounded-full border-2 border-pink-300 animate-ping opacity-75" />
                        <div className="absolute inset-0 rounded-full border-2 border-pink-400 animate-ping opacity-50" 
                             style={{ animationDelay: '0.5s' }} />
                    </>
                )}
                
                {/* 🎵 Icono central */}
                <div className="relative z-10 text-white">
                    {isPlaying ? (
                        <Pause size={20} fill="currentColor" />
                    ) : (
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                </div>

                {/* ✨ Brillo al hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            {/* 🔊 Indicador de volumen cuando reproduce */}
            {isPlaying && (
                <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <Volume2 size={16} className="text-pink-500" />
                    <div className="flex space-x-0.5">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-1 bg-pink-500 rounded-full animate-bounce"
                                style={{
                                    height: `${8 + i * 4}px`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '0.6s'
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 💭 Tooltip contextual */}
            {isHovered && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg whitespace-nowrap backdrop-blur-sm z-20">
                    {!hasUserInteracted 
                        ? '🎵 ¡Click para música automática!' 
                        : isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo'
                    }
                    <div className="absolute top-full right-3 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-black/80" />
                </div>
            )}

            {/* ✅ Indicador de estado activo */}
            {hasUserInteracted && audioReady && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm z-10">
                    <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75" />
                </div>
            )}

            {/* 🎵 Nota musical flotante cuando reproduce */}
            {isPlaying && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <Music 
                        size={12} 
                        className="text-pink-400 animate-bounce opacity-70"
                        style={{ animationDuration: '1s' }}
                    />
                </div>
            )}
        </div>
    )
}

export default SimpleMusicPlayer