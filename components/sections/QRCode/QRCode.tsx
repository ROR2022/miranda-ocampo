"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { QrCode as QrCodeIcon, Camera, Heart, Sparkles, Download, Eye } from 'lucide-react'
//import QRDownloadContainer from './QRDownloadContainer'
import { quinceMainData } from '@/components/sections/data/main-data' 

// Paleta Aurora VIP para Quinceañera - Temática consistente


//este componente renderiza la imagen de un código QR
//con los datos principales de la invitación

const QRCode = () => {
  // Estados para manejo de descarga y feedback
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState("");
  const { VIP_COLORS, hero } = quinceMainData;

  // Función principal: Descarga automática del QR
  const handleDownloadQR = async () => {
    setIsDownloading(true);
    setToast("Iniciando descarga...");
    
    try {
      const response = await fetch('/images/qrCodeFoto.jpg');
      if (!response.ok) throw new Error('Error al cargar la imagen');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'QRCode_XV.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setToast("¡QR descargado exitosamente! ✨");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error('Error descargando QR:', error);
      setToast("Error al descargar. Inténtalo nuevamente.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  // Función secundaria: Vista previa del QR
  const handlePreviewQR = () => {
    window.open('/images/qrCodeFoto.jpg', '_blank', 'width=700,height=700,scrollbars=yes,resizable=yes');
  };

    //
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        //background: `url('/images/frida6.jpg') no-repeat center center / cover`
        background: `linear-gradient(135deg, ${VIP_COLORS.blancoSeda} 0%, ${VIP_COLORS.cremaSuave} 50%, ${VIP_COLORS.rosaDelicada} 100%)`
      }}
    >
      {/* Elementos decorativos Aurora */}
       <div 
        className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 animate-pulse"
        style={{ 
          background: `radial-gradient(circle, ${VIP_COLORS.rosaAurora} 0%, transparent 70%)` 
        }}
      />
      <div 
        className="absolute bottom-20 right-20 w-40 h-40 rounded-full opacity-15 animate-pulse"
        style={{ 
          background: `radial-gradient(circle, ${VIP_COLORS.lavandaAurora} 0%, transparent 70%)`,
          animationDelay: '1s'
        }}
      />
      <div 
        className="absolute top-1/3 right-10 w-24 h-24 rounded-full opacity-10 animate-pulse"
        style={{ 
          background: `radial-gradient(circle, ${VIP_COLORS.oroAurora} 0%, transparent 70%)`,
          animationDelay: '2s'
        }}
      /> 

{/* Header con temática quinceañera */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" style={{ color: VIP_COLORS.oroAurora }} />
            <h3 
              className="text-lg font-medium tracking-wider uppercase"
              style={{ color: VIP_COLORS.lavandaIntensa }}
            >
              {hero.subtitle}
            </h3>
            <Sparkles className="w-6 h-6" style={{ color: VIP_COLORS.oroAurora }} />
          </div>
          
          <h1 
            className="text-5xl font-bold mb-4 tracking-wide text-center"
            style={{ 
              color: VIP_COLORS.rosaAurora,
              textShadow: `2px 2px 4px rgba(233, 30, 99, 0.3)`,
              fontFamily: 'serif'
            }}
          >
            {hero.name}
          </h1>
        </div>

      {/* Contenedor principal */}
      <div className="text-center z-10 flex flex-col md:flex-row gap-8 justify-center items-center mx-auto ">
        

        <div>
          <div className='mb-6'>
            <Image
              src={hero.backgroundImage}
              alt={`Foto principal de ${hero.name}`}
              width={300}
              height={400}
              className="mx-auto rounded-lg"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
            />
          </div>
          
          <div className="flex items-center justify-center gap-1">
            <Heart className="w-4 h-4" style={{ color: VIP_COLORS.rosaIntensa }} />
            <Heart className="w-4 h-4" style={{ color: VIP_COLORS.rosaIntensa }} />
            <Heart className="w-4 h-4" style={{ color: VIP_COLORS.rosaIntensa }} />
          </div>
        </div>

        {/* QR Code con marco elegante */}
        <div 
          className="bg-white p-8 rounded-2xl shadow-2xl mb-6 relative overflow-hidden"
          style={{ 
            border: `3px solid ${VIP_COLORS.oroAurora}`,
            boxShadow: `0 20px 40px rgba(233, 30, 99, 0.2)`
          }}
        >
          {/* Decoración en las esquinas */}
          <div 
            className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 rounded-tl-lg"
            style={{ borderColor: VIP_COLORS.lavandaAurora }}
          />
          <div 
            className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 rounded-tr-lg"
            style={{ borderColor: VIP_COLORS.lavandaAurora }}
          />
          <div 
            className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 rounded-bl-lg"
            style={{ borderColor: VIP_COLORS.lavandaAurora }}
          />
          <div 
            className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 rounded-br-lg"
            style={{ borderColor: VIP_COLORS.lavandaAurora }}
          />

          <div className="relative z-10">
            <QrCodeIcon 
              className="w-8 h-8 mx-auto mb-4" 
              style={{ color: VIP_COLORS.rosaAurora }} 
            />
            <Image
              src="/images/qrcode.png"
              alt="Código QR - Galería Dinámica Frida"
              width={200}
              height={200}
              className="mx-auto rounded-lg"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
            />
          </div>
        </div>

        {/* Descripción con estilo */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Camera className="w-5 h-5" style={{ color: VIP_COLORS.oroAurora }} />
            <h5 
              className="text-lg font-medium text-center leading-relaxed"
              style={{ color: VIP_COLORS.lavandaIntensa }}
            >
              Escanea el código QR para unirte a la
            </h5>
          </div>
          <p 
            className="text-xl font-bold"
            style={{ 
              color: VIP_COLORS.rosaIntensa,
              background: `linear-gradient(45deg, ${VIP_COLORS.rosaAurora}, ${VIP_COLORS.lavandaAurora})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            ✨ Galería Dinámica ✨
          </p>

           {/* Footer elegante */}
        <p 
          className="mt-6 text-sm italic"
          style={{ color: VIP_COLORS.lavandaIntensa, opacity: 0.8 }}
        >
          &quot;Comparte momentos únicos en mi día especial&quot;
        </p>
        </div>

<div
//style={{ display:'none'}}
>
        {/* Sección de descarga de QR */}
        <div className="mb-8">
          {/* <QRDownloadContainer 
            eventData={{
              name: "FRIDA",
              title: "Mis XV Años",
              date: "27 de Septiembre 2025",
              venue: "Salón de Eventos Aurora",
              qrCodeUrl: "https://quince-premium-frida.vercel.app/gallery",
              photoUrl: "/images/frida6.jpg",
              websiteUrl: "https://quince-premium-frida.vercel.app/gallery",
              message: "Comparte momentos únicos en mi día especial"
            }}
          /> */}

          {/* Contenedor de botones de QR */}
          <div className="flex flex-col gap-4 justify-center items-center">
            {/* Botón principal - Descargar QR */}
            <button 
              onClick={handleDownloadQR}
              disabled={isDownloading}
              className={`group relative px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden ${
                isDownloading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{
                background: `linear-gradient(45deg, ${VIP_COLORS.rosaAurora} 0%, ${VIP_COLORS.lavandaAurora} 50%, ${VIP_COLORS.oroAurora} 100%)`,
                boxShadow: `0 8px 20px rgba(233, 30, 99, 0.4)`
              }}
            >
              {/* Efecto shimmer */}
              <div 
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  isDownloading ? 'animate-pulse' : ''
                }`}
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  animation: isDownloading ? 'shimmer 1.5s infinite' : 'shimmer 2s infinite'
                }}
              />
              
              <span className="relative z-10 flex items-center gap-2">
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Descargar QR
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </span>
            </button>

            {/* Botón secundario - Ver QR */}
            <button 
              onClick={handlePreviewQR}
              className="group relative px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden border-2"
              style={{
                background: `linear-gradient(45deg, ${VIP_COLORS.blancoSeda} 0%, ${VIP_COLORS.cremaSuave} 100%)`,
                color: VIP_COLORS.lavandaIntensa,
                borderColor: VIP_COLORS.lavandaAurora,
                boxShadow: `0 4px 12px rgba(156, 39, 176, 0.2)`
              }}
            >
              {/* Efecto shimmer sutil */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(156, 39, 176, 0.1) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  animation: 'shimmer 2s infinite'
                }}
              />
              
              <span className="relative z-10 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Ver QR
                <Heart className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>

            {/**Sección de Links */}
        <div className='flex flex-col gap-2'>
            {/* Botón de invitación premium */}
        <Link href="/">
          <button 
            className="group relative px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
            style={{
              background: `linear-gradient(45deg, ${VIP_COLORS.rosaAurora} 0%, ${VIP_COLORS.lavandaAurora} 50%, ${VIP_COLORS.oroAurora} 100%)`,
              boxShadow: `0 8px 20px rgba(233, 30, 99, 0.4)`
            }}
          >
            {/* Efecto shimmer */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 2s infinite'
              }}
            />
            
            <span className="relative z-10 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Ver Invitación
              <Sparkles className="w-5 h-5" />
            </span>
          </button>
        </Link>

        {/* Botón de subir fotos */}
        <Link href="/fotos">
          <button 
            className="group relative px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
            style={{
              background: `linear-gradient(45deg, ${VIP_COLORS.lavandaAurora} 0%, ${VIP_COLORS.oroAurora} 50%, ${VIP_COLORS.rosaAurora} 100%)`,
              boxShadow: `0 8px 20px rgba(156, 39, 176, 0.4)`
            }}
          >
            {/* Efecto shimmer */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 2s infinite'
              }}
            />
            
            <span className="relative z-10 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Subir Fotos
              <Sparkles className="w-5 h-5" />
            </span>
          </button>
        </Link>

        {/* Botón de galería */}
        <Link href="/gallery">
          <button 
            className="group relative px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden border-2"
            style={{
              background: `linear-gradient(45deg, ${VIP_COLORS.oroAurora} 0%, ${VIP_COLORS.oroIntensio} 100%)`,
              color: VIP_COLORS.blancoSeda,
              borderColor: VIP_COLORS.oroIntensio,
              boxShadow: `0 8px 20px rgba(255, 152, 0, 0.4)`
            }}
          >
            {/* Efecto shimmer */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 2s infinite'
              }}
            />
            
            <span className="relative z-10 flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5" />
              Ir a Galería
              <Heart className="w-5 h-5" />
            </span>
          </button>
        </Link>
        </div>
</div>
       
      </div>

      {/* Sistema de notificaciones Toast */}
      {toast && (
        <div 
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 animate-bounce"
          style={{
            background: `linear-gradient(45deg, ${VIP_COLORS.blancoSeda} 0%, ${VIP_COLORS.cremaSuave} 100%)`,
            border: `2px solid ${VIP_COLORS.oroAurora}`,
            color: VIP_COLORS.lavandaIntensa,
            boxShadow: `0 10px 30px rgba(233, 30, 99, 0.3)`
          }}
        >
          <div className="flex items-center gap-2">
            {toast.includes('exitosamente') ? (
              <Heart className="w-5 h-5" style={{ color: VIP_COLORS.rosaAurora }} />
            ) : toast.includes('Error') ? (
              <QrCodeIcon className="w-5 h-5" style={{ color: VIP_COLORS.rosaIntensa }} />
            ) : (
              <Sparkles className="w-5 h-5" style={{ color: VIP_COLORS.oroAurora }} />
            )}
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}

      {/* Animación shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  )
}

export default QRCode