// 🎛️ BackgroundController - Control de opacidad y estilo de fondo (opcional para desarrollo)

import React, { useState } from 'react'

export default function BackgroundController({ onStyleChange, initialStyle }) {
  const [opacity, setOpacity] = useState(initialStyle?.overlayOpacity || 0.3)
  const [overlayType, setOverlayType] = useState(initialStyle?.overlayType || 'gradient-radial')
  //const [overlayColor, setOverlayColor] = useState('#ffffff')

  const handleOpacityChange = (newOpacity) => {
    setOpacity(newOpacity)
    onStyleChange({ 
      ...initialStyle, 
      overlayOpacity: newOpacity,
      overlayType,
      overlayColor: `rgba(255, 255, 255, 1)` // Mantener color base
    })
  }

  const handleTypeChange = (newType) => {
    setOverlayType(newType)
    onStyleChange({ 
      ...initialStyle, 
      overlayOpacity: opacity,
      overlayType: newType,
      overlayColor: `rgba(255, 255, 255, 1)`
    })
  }

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">🎨 Control de Fondo</h3>
      
      {/* Control de Opacidad */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">
          Opacidad: {(opacity * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Tipo de Overlay */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Tipo:</label>
        <select 
          value={overlayType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full p-1 border rounded text-sm"
        >
          <option value="solid">Sólido</option>
          <option value="gradient-top">Degradado Superior</option>
          <option value="gradient-bottom">Degradado Inferior</option>
          <option value="gradient-radial">Degradado Radial</option>
        </select>
      </div>

      {/* Valores actuales */}
      <div className="text-xs text-gray-600 mt-2">
        <div>Opacidad: {opacity}</div>
        <div>Tipo: {overlayType}</div>
      </div>
    </div>
  )
}
