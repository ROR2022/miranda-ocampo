"use client"

import { useState, useEffect } from "react"

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("home")

  const sections = [
    { id: "home", label: "Inicio" },
    { id: "parents", label: "Padres" },
    { id: "date", label: "Fecha" },
    { id: "ceremony", label: "Ceremonia" },
    { id: "reception", label: "Recepción" },
    { id: "timeline", label: "Cronograma" },
    { id: "dresscode", label: "Vestimenta" },
    { id: "gifts", label: "Regalos" },
    { id: "gallery", label: "Galería" },
  ]

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]")
      const scrollPosition = window.scrollY + 100

      sections.forEach((section) => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(section.id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center py-4">
          <div className="flex gap-6 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`text-sm font-medium transition-colors whitespace-nowrap px-3 py-2 rounded-full ${
                  activeSection === section.id
                    ? "text-secondary bg-secondary/10"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
