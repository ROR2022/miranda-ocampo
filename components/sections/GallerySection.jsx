// 📸 GallerySection - Sección de galería de fotos

import React from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { weddingData } from '../../data/weddingData'
import { useWhatsApp } from '../../hooks/useWhatsApp'

export default function GallerySection() {
  const { gallery, agency } = weddingData
  const { contactAgency } = useWhatsApp()

  return (
    <section 
    style={{
      backgroundColor: "#C8BFE780",
    }}
    id="gallery" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-script text-4xl text-secondary">
            Galería de Fotos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="relative w-full h-64 rounded-2xl shadow-lg overflow-hidden">
                <Image
                  src={gallery.images[0]}
                  alt="Galería 1"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="relative w-full h-48 rounded-2xl shadow-lg overflow-hidden">
                <Image
                  src={gallery.images[1]}
                  alt="Galería 2"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className="flex items-center">
              <div className="relative w-full h-80 rounded-2xl shadow-lg overflow-hidden">
                <Image
                  src={gallery.images[2]}
                  alt="Pareja principal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-2xl p-8 mt-12">
            <h3 className="font-script text-3xl text-secondary mb-4">
              {agency.message}
            </h3>
            <p className="text-muted-foreground mb-6">
              Realizada por {agency.name}
            </p>
            <Button 
              onClick={contactAgency}
              className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-8 py-3"
            >
              Contáctanos
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
