"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

//import Navigation from "../components/navigation"
import HeroSection from "../components/sections/HeroSection"
import ParentsSection from "../components/sections/ParentsSection"
import DateSection from "../components/sections/DateSection"
import CeremonySection from "../components/sections/CeremonySection"
//import ReceptionSection from "../components/sections/ReceptionSection"
import TimelineSection from "../components/sections/TimelineSection"
import DressCodeSection from "../components/sections/DressCodeSection"
import GiftsSection from "../components/sections/GiftsSection"
//import GallerySection from "../components/sections/GallerySection"
import AudioPlayer from "../components/AudioPlayer"
import BasicCTA from "../components/sections/BasicCTA"
import InvitationEnvelope from "../components/sections/InvitationEnvelope"
import WelcomeMessage from "../components/sections/InvitationWelcome"
//import DecorationElement from "../components/DecorationElement"
import { PremiumGallery } from "@/components/sections/PremiumGallery"
import CustomInvitations from "@/components/sections/CustomInvitations/components/CustomInvitations"
import AttendanceConfirmation from "@/components/sections/AttendanceConfirmation"
import { QRCode } from "@/components/sections/QRCode"
import VideoElement from "@/components/sections/VideoElement"

export default function WeddingInvitation() {
  const [isOpenInvitation, setIsOpenInvitation] = useState(false);
  const [isWelcomeMessageVisible, setIsWelcomeMessageVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if(typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);

  const handleOpenInvitation = () => {
    setIsOpenInvitation(true);
    setIsWelcomeMessageVisible(true);
  };

   const handleContinue = () => {
    setIsWelcomeMessageVisible(false);
  }; 

  if (!isMounted) {
    return null; // Evita el renderizado en el servidor
  }

  if(!isOpenInvitation) {
    return (
      <InvitationEnvelope onOpen={handleOpenInvitation} />
    )
  }

   if (isWelcomeMessageVisible) {
    return <WelcomeMessage onContinue={handleContinue} />
  } 



  return (
    <div 
    style={{
      //background: "url('/images/texturaAzul01.jpeg')",
      //linear gradient background from top to bottom en tonos azul pastel pero que sea muy suave y que se repita 
      //que tambien simule un papel texturizado como si fueran nubes o formas irregulares muy suaves
      //background: "linear-gradient(to bottom, #d0e7f9, #f0f4f8)",
     
    }}
    className="min-h-screen relative overflow-hidden">

      {/* Fondo base con degradado */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-blue-200 to-indigo-300" />

      {/* Capa de nubes con CSS */}
            <div className="cloud-layer absolute inset-0" />
      
            {/* Textura sutil */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-noise" />
      {/* <Navigation /> */}
      {/* <DecorationElement /> */}
      <HeroSection />
       <ParentsSection />
      <DateSection />
      <CeremonySection />
      {/* <ReceptionSection /> */}
      {/*<TimelineSection /> 
      <DressCodeSection />*/}
       <AttendanceConfirmation />
      <GiftsSection />
      {/* <GallerySection /> */}
      <PremiumGallery />
      {/* <VideoElement /> */}
      {/* <QRCode /> */}
      {/* <CustomInvitations /> */}
      <Link 
      style={{display: 'none'}}
      href="/custom-invite" target="_blank" className="flex justify-center my-8">
        <button className="px-6 py-3 bg-pink-800 text-white rounded-full shadow-lg hover:bg-pink-400 transition">
          Personaliza tu invitación
        </button>
      </Link>
      <BasicCTA />
      
      {/* 🎵 Reproductor de audio fijo */}
      <AudioPlayer />
    </div>
  )
}
