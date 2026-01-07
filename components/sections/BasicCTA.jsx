import React from 'react'
import { Heart } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { getAnimationConfig } from '@/data/animationConfig'

const BasicCTA = () => {
  // Configurar animación de scroll
  const animationConfig = getAnimationConfig('cta')
  const { ref: sectionRef, style: animationStyle } = useScrollAnimation(
    animationConfig.options,
    animationConfig.type,
    animationConfig.delay
  )

  return (
    <div ref={sectionRef} style={
      {
        ...animationStyle,
        position: 'relative',
        zIndex: 8000,
      }
      }>
         {/* CTA - Sección de llamada a la acción premium */}
        <div className="mt-8 relative overflow-hidden bg-slate-300 bg-opacity-60 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl">
          
          
          {/* Contenido principal */}
          <div className="relative z-10 text-center text-black">
            {/* Icono principal */}
            <div 
            style={{display:'none'}}
            className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border-2 border-white/30">
                <Heart className="w-8 h-8 text-pink-100" />
              </div>
            </div>
            
            {/* Título principal */}
            <h3 className="font-normal text-xl md:text-xl  mb-4 text-black">
              ¿Tienes un evento en puerta?
            </h3>
            
            {/* Descripción */}
            <p className="font-playfair text-normal mb-8 text-black leading-relaxed max-w-2xl mx-auto">
              Diseña con nosotros una invitación única y personalizada para tu evento especial.
            </p>
            
            {/* Botón CTA principal */}
            <div className="space-y-4">
              <a
                href="https://www.invitacionesweb.lat"
                className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:bg-pink-50"
              >
                <span>te atendemos aqui</span>
                <Heart className="w-5 h-5 group-hover:animate-pulse" />
              </a>
              
              
            </div>
          </div>
          
          {/* Brillo decorativo animado */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
    </div>
  )
}

export default BasicCTA