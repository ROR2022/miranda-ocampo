"use client"

import React, { forwardRef } from "react"
import type { QRDownloadCardProps } from "@/types/qrDownload.types"
import { useQRGeneration } from "@/hooks/useQRGeneration"
import Image from "next/image"

const QRDownloadCard = forwardRef<HTMLDivElement, QRDownloadCardProps>(
  ({ eventData, className = "", style = {} }, ref) => {
    const { qrDataURL, generateQR } = useQRGeneration(eventData)

    // Generar QR automáticamente al montar
    React.useEffect(() => {
      if (!qrDataURL) {
        generateQR({
          size: 300,
          margin: 1,
          errorCorrectionLevel: "M",
        })
      }
    }, [qrDataURL, generateQR])

    return (
      <div
        ref={ref}
        data-download-card
        className={`qr-download-card ${className}`}
        style={{
          width: "840px",
          height: "1188px",
          fontFamily: '"Playfair Display", serif',
          position: "fixed",
          top: "-3000px",
          left: "0",
          zIndex: -1000,
          opacity: 1,
          pointerEvents: "none",
          background: "linear-gradient(135deg, #ffffff 0%, #fef7f7 100%)",
          boxSizing: "border-box",
          padding: "60px",
          ...style,
        }}
      >
        {/* Decorative Border */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            right: "20px",
            bottom: "20px",
            border: "3px solid #d8b4fe",
            borderRadius: "30px",
            background: "linear-gradient(135deg, rgba(216, 180, 254, 0.1) 0%, rgba(183, 110, 159, 0.1) 100%)",
            boxShadow: "inset 0 0 50px rgba(216, 180, 254, 0.2)",
          }}
        />

        {/* Floral Corner Decorations */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            width: "80px",
            height: "80px",
            background: "radial-gradient(circle, #d8b4fe 0%, transparent 70%)",
            borderRadius: "50%",
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "40px",
            width: "80px",
            height: "80px",
            background: "radial-gradient(circle, #b76e9f 0%, transparent 70%)",
            borderRadius: "50%",
            opacity: 0.3,
          }}
        />

        {/* Header Section */}
        <div
          style={{
            height: "220px",
            background: "linear-gradient(135deg, #d8b4fe 0%, #b76e9f 100%)",
            borderRadius: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "50px",
            color: "white",
            textAlign: "center",
            position: "relative",
            boxShadow: "0 15px 35px rgba(216, 180, 254, 0.4)",
            overflow: "hidden",
          }}
        >
          {/* Decorative Pattern */}
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "-20px",
              right: "-20px",
              bottom: "-20px",
              background:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fillRule="evenodd"%3E%3Cg fill="%23ffffff" fillOpacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3,
            }}
          />

          <h3
            style={{
              fontSize: "28px",
              margin: "0 0 15px 0",
              fontWeight: "400",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: 'var(--font-dancing-script), "Dancing Script", cursive',
            }}
          >
            {eventData.title}
          </h3>
          <h1
            style={{
              fontSize: "52px",
              margin: "0",
              fontWeight: "700",
              textShadow: "2px 2px 8px rgba(0,0,0,0.2)",
              fontFamily: 'var(--font-great-vibes), "Great Vibes", cursive',
              letterSpacing: "1px",
            }}
          >
            {eventData.name}
          </h1>
        </div>

        {/* Main QR Section */}
        <div
          style={{
            height: "480px",
            background: "linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)",
            border: "4px solid #d8b4fe",
            borderRadius: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "50px",
            boxShadow: "0 20px 40px rgba(216, 180, 254, 0.3)",
            position: "relative",
          }}
        >
          {/* Decorative Elements */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              width: "40px",
              height: "40px",
              background: "linear-gradient(45deg, #d8b4fe, #b76e9f)",
              borderRadius: "50%",
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "40px",
              height: "40px",
              background: "linear-gradient(45deg, #b76e9f, #d8b4fe)",
              borderRadius: "50%",
              opacity: 0.6,
            }}
          />

          {/* QR Code Container */}
          <div
            style={{
              padding: "30px",
              background: "white",
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(183, 110, 159, 0.2)",
              marginBottom: "25px",
            }}
          >
            {qrDataURL ? (
              <Image
                src={qrDataURL || "/placeholder.svg"}
                alt="Código QR"
                height={300}
                width={300}
              />
            ) : (
              <div
                style={{
                  width: "300px",
                  height: "300px",
                  background: "linear-gradient(135deg, #fef2f2 0%, #f3e8ff 100%)",
                  border: "2px dashed #d8b4fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#b76e9f",
                  borderRadius: "15px",
                  fontFamily: '"Source Sans Pro", sans-serif',
                }}
              >
                Generando QR...
              </div>
            )}
          </div>

          {/* QR Description */}
          <p
            style={{
              fontSize: "22px",
              color: "#b76e9f",
              margin: "0",
              fontWeight: "600",
              fontFamily: 'var(--font-dancing-script), "Dancing Script", cursive',
              textAlign: "center",
              letterSpacing: "0.5px",
            }}
          >
            Escanea para acceder a mi galería
          </p>
        </div>

        {/* Footer Section */}
        <div
          style={{
            height: "200px",
            background: "linear-gradient(135deg, #fef2f2 0%, #f3e8ff 100%)",
            borderRadius: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "30px",
            border: "2px solid #d8b4fe",
            position: "relative",
          }}
        >
          {/* Decorative Bottom Elements */}
          <div
            style={{
              position: "absolute",
              bottom: "15px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100px",
              height: "3px",
              background: "linear-gradient(90deg, transparent 0%, #d8b4fe 50%, transparent 100%)",
            }}
          />

          {/* Date */}
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#b76e9f",
              marginBottom: "15px",
              fontFamily: 'var(--font-dancing-script), "Dancing Script", cursive',
              letterSpacing: "1px",
            }}
          >
            {eventData.date}
          </div>

          {/* Website */}
          <div
            style={{
              fontSize: "18px",
              color: "#6b7280",
              marginBottom: "20px",
              fontFamily: '"Source Sans Pro", sans-serif',
              fontWeight: "500",
            }}
          >
            https://quince-premium-frida.vercel.app/gallery
          </div>

          {/* Message */}
          <div
            style={{
              fontSize: "18px",
              color: "#b76e9f",
              fontStyle: "italic",
              maxWidth: "600px",
              lineHeight: "1.6",
              fontFamily: 'var(--font-dancing-script), "Dancing Script", cursive',
              fontWeight: "400",
            }}
          >
            {eventData.message}
          </div>
        </div>

        {/* Bottom Decorative Elements */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "40px",
            width: "60px",
            height: "60px",
            background: "radial-gradient(circle, #d8b4fe 0%, transparent 70%)",
            borderRadius: "50%",
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            width: "60px",
            height: "60px",
            background: "radial-gradient(circle, #b76e9f 0%, transparent 70%)",
            borderRadius: "50%",
            opacity: 0.4,
          }}
        />
      </div>
    )
  },
)

QRDownloadCard.displayName = "QRDownloadCard"

export default QRDownloadCard
