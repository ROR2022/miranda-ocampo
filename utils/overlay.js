// Función para generar el estilo del overlay según el tipo
 export const getOverlayStyle = (dataOverlay) => {
    const { overlayType, overlayOpacity, overlayColor, overlayColorSecondary, gradientDirection } = dataOverlay;

    switch (overlayType) {
      case 'solid':
        return {
          backgroundColor: overlayColor.replace('1)', `${overlayOpacity})`)
        }
      case 'gradient-top':
        return {
          background: `linear-gradient(to bottom, ${overlayColor.replace('1)', `${overlayOpacity})`)} 0%, ${overlayColorSecondary} 100%)`
        }
      case 'gradient-bottom':
        return {
          background: `linear-gradient(to top, ${overlayColor.replace('1)', `${overlayOpacity})`)} 0%, ${overlayColorSecondary} 100%)`
        }
      case 'gradient-radial':
        return {
          background: `radial-gradient(${gradientDirection}, ${overlayColorSecondary} 0%, ${overlayColor.replace('1)', `${overlayOpacity})`)} 100%)`
        }
      default:
        return {
          backgroundColor: overlayColor.replace('1)', `${overlayOpacity})`)
        }
    }
  }