// 🎉 ReceptionSection - Sección de información de la recepción

import React from 'react'
import { MapPin, Clock } from 'lucide-react'
import { Button } from '../ui/button'
import { weddingData } from '../../data/weddingData'
//import { useMapNavigation } from '../../hooks/useMapNavigation'
import { getOverlayStyle } from '@/utils/overlay'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { getAnimationConfig } from '@/data/animationConfig'

export default function ReceptionSection() {
  const { reception, couple, styling } = weddingData
  //const { goToReception } = useMapNavigation()
  const { receptionSection } = styling

  // Configurar animación de scroll
  const animationConfig = getAnimationConfig('reception')
  const { ref: sectionRef, style: animationStyle } = useScrollAnimation(
    animationConfig.options,
    animationConfig.type,
    animationConfig.delay
  )

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundImage: `url('/images/marco3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        zIndex: 5000, // Asegurar que la sección esté por encima de otros elementos
        ...animationStyle
      }}
     id="reception" className="py-20">

      {/* Overlay configurable */}
      <div
        style={getOverlayStyle(receptionSection)}
        className="absolute inset-0 z-0"
      ></div>

      <div 
      style={{
        animation: 'bounce1 2s ease 0s 1 normal forwards'
      }}
      className="container mx-auto px-4 bg-slate-300 bg-opacity-60 p-6 rounded-2xl">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="text-8xl text-secondary font-script mb-4">
            {couple.initials}
          </div>

          <h2 className="font-script text-4xl text-foreground">Recepción</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              <span className="text-2xl font-medium">{reception.time}</span>
            </div>

            <h3 className="text-2xl font-bold text-foreground">
              {reception.name}
            </h3>

            <p className="text-muted-foreground max-w-md mx-auto">
              {reception.address}
            </p>

            <Button
              onClick={()=>window.open(reception.ubiLink, '_blank')}
              className="bg-slate-800 hover:text-black hover:bg-slate-400 text-white rounded-full px-8 py-3"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Ir al mapa
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
