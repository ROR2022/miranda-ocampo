import { CreateQR } from '@/components/sections/QRCode';

// 📱 Página para probar el componente CreateQR
export default function CreateQRPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '2rem 1rem'
    }}>
      <CreateQR urlLink={''} />
    </main>
  );
}

// Metadata para la página
export const metadata = {
  title: 'Crear Código QR - Aurora VIP',
  description: 'Generador de códigos QR personalizados con opciones avanzadas',
};
