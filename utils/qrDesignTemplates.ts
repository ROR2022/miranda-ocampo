import { QRDesignStyles, DownloadFormat } from '@/types/qrDownload.types';
import { VIP_COLORS } from './qrDownloadHelpers';

// Templates de diseño específicos por formato
export const createDesignStyles = (format: DownloadFormat): QRDesignStyles => {
  const baseStyles: QRDesignStyles = {
    header: {
      height: '200px',
      background: `linear-gradient(135deg, ${VIP_COLORS.rosaAurora} 0%, ${VIP_COLORS.lavandaAurora} 50%, ${VIP_COLORS.oroAurora} 100%)`,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    
    main: {
      height: '500px',
      background: VIP_COLORS.blancoSeda,
      padding: '50px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    
    footer: {
      height: '300px',
      background: `linear-gradient(135deg, ${VIP_COLORS.cremaSuave} 0%, ${VIP_COLORS.rosaDelicada} 100%)`,
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-around',
      textAlign: 'center' as const
    },
    
    qrFrame: {
      border: `4px solid ${VIP_COLORS.oroAurora}`,
      borderRadius: '16px',
      padding: '20px',
      background: VIP_COLORS.blancoSeda,
      boxShadow: `0 20px 40px rgba(233, 30, 99, 0.2)`,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px'
    },
    
    nameTitle: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: VIP_COLORS.blancoSeda,
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      fontFamily: 'serif',
      letterSpacing: '2px',
      margin: '10px 0'
    },
    
    subtitle: {
      fontSize: '18px',
      color: VIP_COLORS.blancoSeda,
      fontWeight: '500',
      letterSpacing: '3px',
      textTransform: 'uppercase' as const,
      fontFamily: 'sans-serif'
    },
    
    description: {
      fontSize: '16px',
      color: VIP_COLORS.lavandaIntensa,
      fontWeight: '600',
      textAlign: 'center' as const,
      marginTop: '15px',
      fontFamily: 'sans-serif'
    },
    
    photoFrame: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      border: `4px solid ${VIP_COLORS.rosaAurora}`,
      objectFit: 'cover' as const,
      boxShadow: `0 8px 20px rgba(233, 30, 99, 0.3)`
    },
    
    decorativeElement: {
      position: 'absolute',
      borderRadius: '50%',
      opacity: 0.1
    }
  };

  // Ajustes específicos por formato
  switch (format) {
    case 'pdf':
      return {
        ...baseStyles,
        nameTitle: {
          ...baseStyles.nameTitle,
          fontSize: '52px', // Ligeramente más grande para PDF
          letterSpacing: '3px'
        },
        description: {
          ...baseStyles.description,
          fontSize: '18px'
        }
      };
      
    case 'png':
      return {
        ...baseStyles,
        main: {
          ...baseStyles.main,
          background: 'transparent' // Fondo transparente para PNG
        }
      };
      
    case 'jpg':
      return {
        ...baseStyles,
        footer: {
          ...baseStyles.footer,
          background: `linear-gradient(135deg, ${VIP_COLORS.cremaSuave} 0%, ${VIP_COLORS.rosaDelicada} 80%, ${VIP_COLORS.blancoSeda} 100%)`
        }
      };
      
    default:
      return baseStyles;
  }
};

// Elementos decorativos para el header
export const createHeaderDecorations = () => [
  {
    id: 'sparkle-1',
    style: {
      position: 'absolute' as const,
      top: '15px',
      left: '20px',
      width: '24px',
      height: '24px',
      color: VIP_COLORS.oroAurora,
      fontSize: '24px'
    },
    content: '✨'
  },
  {
    id: 'sparkle-2',
    style: {
      position: 'absolute' as const,
      top: '15px',
      right: '20px',
      width: '24px',
      height: '24px',
      color: VIP_COLORS.oroAurora,
      fontSize: '24px'
    },
    content: '✨'
  },
  {
    id: 'heart-1',
    style: {
      position: 'absolute' as const,
      bottom: '20px',
      left: '30px',
      color: VIP_COLORS.rosaDelicada,
      fontSize: '16px',
      opacity: 0.7
    },
    content: '💖'
  },
  {
    id: 'heart-2',
    style: {
      position: 'absolute' as const,
      bottom: '20px',
      right: '30px',
      color: VIP_COLORS.rosaDelicada,
      fontSize: '16px',
      opacity: 0.7
    },
    content: '💖'
  }
];

// Elementos decorativos para el marco QR
export const createQRFrameDecorations = () => [
  {
    id: 'corner-tl',
    style: {
      position: 'absolute' as const,
      top: '8px',
      left: '8px',
      width: '24px',
      height: '24px',
      borderLeft: `3px solid ${VIP_COLORS.lavandaAurora}`,
      borderTop: `3px solid ${VIP_COLORS.lavandaAurora}`,
      borderRadius: '8px 0 0 0'
    }
  },
  {
    id: 'corner-tr',
    style: {
      position: 'absolute' as const,
      top: '8px',
      right: '8px',
      width: '24px',
      height: '24px',
      borderRight: `3px solid ${VIP_COLORS.lavandaAurora}`,
      borderTop: `3px solid ${VIP_COLORS.lavandaAurora}`,
      borderRadius: '0 8px 0 0'
    }
  },
  {
    id: 'corner-bl',
    style: {
      position: 'absolute' as const,
      bottom: '8px',
      left: '8px',
      width: '24px',
      height: '24px',
      borderLeft: `3px solid ${VIP_COLORS.lavandaAurora}`,
      borderBottom: `3px solid ${VIP_COLORS.lavandaAurora}`,
      borderRadius: '0 0 0 8px'
    }
  },
  {
    id: 'corner-br',
    style: {
      position: 'absolute' as const,
      bottom: '8px',
      right: '8px',
      width: '24px',
      height: '24px',
      borderRight: `3px solid ${VIP_COLORS.lavandaAurora}`,
      borderBottom: `3px solid ${VIP_COLORS.lavandaAurora}`,
      borderRadius: '0 0 8px 0'
    }
  }
];

// Estilos para elementos de texto en el footer
export const createFooterTextStyles = () => ({
  dateText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: VIP_COLORS.rosaIntensa,
    fontFamily: 'serif',
    marginBottom: '10px'
  },
  websiteText: {
    fontSize: '14px',
    color: VIP_COLORS.lavandaIntensa,
    fontFamily: 'monospace',
    letterSpacing: '1px',
    marginBottom: '15px'
  },
  messageText: {
    fontSize: '16px',
    color: VIP_COLORS.lavandaAurora,
    fontStyle: 'italic',
    fontFamily: 'serif',
    lineHeight: '1.4',
    maxWidth: '80%',
    textAlign: 'center' as const
  },
  venueText: {
    fontSize: '14px',
    color: VIP_COLORS.oroIntensio,
    fontWeight: '600',
    marginTop: '5px'
  }
});

// Configuraciones de gradientes avanzados
export const getAdvancedGradients = (format: DownloadFormat) => ({
  header: format === 'pdf' 
    ? `linear-gradient(135deg, ${VIP_COLORS.rosaAurora} 0%, ${VIP_COLORS.lavandaAurora} 40%, ${VIP_COLORS.oroAurora} 100%)`
    : `linear-gradient(135deg, ${VIP_COLORS.rosaAurora} 0%, ${VIP_COLORS.lavandaAurora} 50%, ${VIP_COLORS.oroAurora} 100%)`,
    
  footer: format === 'png'
    ? `linear-gradient(135deg, rgba(245,245,245,0.9) 0%, rgba(248,187,217,0.9) 100%)`
    : `linear-gradient(135deg, ${VIP_COLORS.cremaSuave} 0%, ${VIP_COLORS.rosaDelicada} 100%)`,
    
  qrShadow: format === 'jpg'
    ? 'rgba(233, 30, 99, 0.25)'
    : 'rgba(233, 30, 99, 0.2)'
});
