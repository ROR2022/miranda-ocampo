// 🎯 Tipos para el componente CreateQR
export interface QROptions {
  size: 150 | 300 | 600;
  darkColor: string;
  lightColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
}

export interface CreateQRState {
  url: string;
  name: string | undefined;
  isValidUrl: boolean;
  qrOptions: QROptions;
  isGenerating: boolean;
  error: string | null;
}

export interface ColorPreset {
  name: string;
  darkColor: string;
  lightColor: string;
  preview: string;
}

export interface SizeOption {
  value: 150 | 300 | 600;
  label: string;
  description: string;
}

export interface ErrorCorrectionOption {
  value: 'L' | 'M' | 'Q' | 'H';
  label: string;
  description: string;
}

// Constantes predefinidas
export const SIZE_OPTIONS: SizeOption[] = [
  { value: 150, label: "Pequeño", description: "150×150px" },
  { value: 300, label: "Mediano", description: "300×300px" },
  { value: 600, label: "Grande", description: "600×600px" }
];

export const COLOR_PRESETS: ColorPreset[] = [
  { name: "Clásico", darkColor: "#000000", lightColor: "#FFFFFF", preview: "⚫⚪" },
  { name: "Aurora", darkColor: "#E91E63", lightColor: "#F8BBD9", preview: "🌸🎀" },
  { name: "Violeta", darkColor: "#9C27B0", lightColor: "#E1BEE7", preview: "💜💙" },
  { name: "Océano", darkColor: "#2196F3", lightColor: "#E3F2FD", preview: "🌊💙" },
  { name: "Bosque", darkColor: "#4CAF50", lightColor: "#E8F5E8", preview: "🌲💚" }
];

export const ERROR_CORRECTION_OPTIONS: ErrorCorrectionOption[] = [
  { value: 'L', label: "Bajo (L)", description: "~7% recuperación" },
  { value: 'M', label: "Medio (M)", description: "~15% recuperación" },
  { value: 'Q', label: "Alto (Q)", description: "~25% recuperación" },
  { value: 'H', label: "Máximo (H)", description: "~30% recuperación" }
];

export const DEFAULT_QR_OPTIONS: QROptions = {
  size: 300,
  darkColor: "#000000",
  lightColor: "#FFFFFF",
  errorCorrectionLevel: 'M',
  margin: 1
};
