"use client";

import React, { useState, useEffect } from "react";
import BackgroundCarrousel from "@/components/sections/BackgroundCarrousel";

const miryImages = () => {
  let images = [];
  const basicPath = "/images/miry";
  const extension = ".jpg";
  const minNumber = 1;
  const maxNumber = 45;

  for (let i = minNumber; i <= maxNumber; i++) {
    const imageNumber = i.toString().padStart(2, "0");
    const imagePath = `${basicPath}${imageNumber}${extension}`;
    images.push(imagePath);
  }
  return images;
};

const page = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadedFondo, setIsLoadedFondo] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    } else {
      setIsMounted(false);
    }
  }, []);

  
  if (!isMounted) {
    return null; // Evita renderizado en el servidor
  }

  const handleError = () => {
    console.error("Error al cargar el video:");
    setIsLoaded(false);
  };

    const handleErrorFondo = () => {
    console.error("Error al cargar el video de fondo:");
    setIsLoadedFondo(false);
  }

  const handleLoad = () => {
    console.log("Video cargado correctamente");
    setIsLoaded(true);
  };

    const handleLoadFondo = () => {
    console.log("Video de fondo cargado correctamente");
    setIsLoadedFondo(true);
  };

    const handleBegin = () => {
    setIsLoaded(true);
  };

  if(!isLoaded){ 
    return (
      <div
      onClick={handleBegin}
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
          color: "#fff",
          fontSize: "1.5rem",
        }}
      >
        Toca para comenzar
      </div>
    );
  }

  return (
    <div>
      <div>
        <div
          style={{
            width: "100%",
            height: "100vh",
            objectFit: "cover",
            backgroundColor: "#000",
            position: "relative"
          }}
        >
            <video
            src="/video/fondo1.mp4"
            autoPlay
            loop
            onError={handleErrorFondo}
            onLoad={handleLoadFondo}
            style={{
              width: "100%",
              height: "100vh",
              objectFit: "cover",
              position: "absolute",
              zIndex: 500
            }}
          />
          <BackgroundCarrousel images={miryImages()} />
        </div>
        <div
          style={{
            width: "100%",
            height: "100vh",
            objectFit: "cover",
          }}
        >
          {/* Renderizar video */}
          <video
            src="/video/miranda.mp4"
            autoPlay
            loop
            onError={handleError}
            onLoad={handleLoad}
            style={{
              width: "100%",
              height: "100vh",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default page;
