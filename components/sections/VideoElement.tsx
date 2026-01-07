import React, { useState, useEffect } from 'react'
import { X, Play } from 'lucide-react'
import { quinceMainData } from '@/components/sections/data/main-data';

const VideoElement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { hero } = quinceMainData;

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Manejar tecla Escape para cerrar modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4">
        {/* Container con aspect ratio fijo */}
        <div className="relative w-full aspect-video bg-black/5 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]" 
             onClick={openModal}>
          <div className='flex justify-center items-center h-full'>
            <h3 className='text-3xl text-indigo-500 text-center'>
              Click para Ver Video de: {hero.name}
              </h3>
          </div>
          
          {/* Overlay sutil con indicador de click */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Play className="w-8 h-8 text-white" fill="white" />
            </div>
          </div>
          
          {/* Sutil border interno para elegancia */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none"></div>
        </div>
      </div>

      {/* Modal de pantalla completa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          {/* Botón cerrar */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 z-10"
            aria-label="Cerrar video"
          >
            <X size={24} />
          </button>

          {/* Video con controles */}
          <div className="relative w-full max-w-6xl h-[80vh]">
            <video
              className="w-full h-full object-contain rounded-lg"
              src="/video/video.mp4"
              controls
              autoPlay
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  )
}

export default VideoElement