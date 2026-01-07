// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================

"use client";

import { useRef } from "react";
import { useInvitationForm } from "../hooks/use-invitation-form-hook";
import { DownloadService } from "../services/download.service";
import { AuthPanel } from "./auth-panel-component";
import { InvitationForm } from "./invitation-form-component";
import { ActionButtons } from "./action-buttons-component";
import { InvitationPreview } from "./invitation-preview-component";
import { EVENT_INFO } from "../constants/invitation.constants";

const CustomInvitations: React.FC = () => {
  const invitationRef = useRef<HTMLDivElement>(null);

  const {
    formData,
    authState,
    uiState,
    updateFormData,
    updateAuthState,
    updateUIState,
    handleAuthentication,
  } = useInvitationForm();

  const handleDownload = async () => {
    if (
      !formData.guestName ||
      !formData.personalMessage ||
      !formData.numberOfGuests
    ) {
      alert(
        "Por favor completa todos los campos obligatorios antes de descargar"
      );
      return;
    }

    if (!uiState.showPreview) {
      updateUIState({ showPreview: true });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!invitationRef.current) return;

    await DownloadService.downloadInvitation(invitationRef.current, formData, {
      onStart: () => updateUIState({ isDownloading: true, downloadError: "" }),
      onSuccess: () => updateUIState({ isDownloading: false }),
      onError: (error: string) =>
        updateUIState({ isDownloading: false, downloadError: error }),
    });
  };

  if (!authState.isAuthenticated) {
    return (
      <div
        style={{
          position: "relative",
          minHeight: "80px",
        }}
        className="my-4"
      >
        <div
          style={{
            zIndex: 8000,
          }}
          className=""
        >
          {/* Panel de autenticación */}
          <h3 className="text-center p-6 text-purple-600 text-2xl">
            Invitaciones Personalizadas
          </h3>
          <AuthPanel
            authState={authState}
            onUpdateAuth={updateAuthState}
            onAuthenticate={handleAuthentication}
          />
        </div>
      </div>
    );
  }

  return (
    <section className="py-8 px-4 relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-100 via-fuchsia-100 to-white">
      <div className="max-w-4xl mx-auto mt-32 text-center relative z-10">
        {authState.isAuthenticated && (
          <div className="max-w-4xl mx-auto mt-12 space-y-8">
            {/* Formulario principal */}
            <div className="bg-white/90 rounded-2xl p-8 border-2 border-fuchsia-200 shadow-lg relative z-20">
              <h2 className="text-2xl font-bold text-fuchsia-700 mb-6">
                📝 Crear Invitación Personalizada
              </h2>

              <InvitationForm
                formData={formData}
                onUpdateFormData={updateFormData}
              />

              {/* Mensaje de error de descarga */}
              {uiState.downloadError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    ❌ Error: {uiState.downloadError}
                  </p>
                </div>
              )}

              <ActionButtons
                formData={formData}
                uiState={uiState}
                onTogglePreview={() =>
                  updateUIState({ showPreview: !uiState.showPreview })
                }
                onDownload={handleDownload}
              />

              {/* Instrucciones de descarga */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  💡 Consejos para la descarga:
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>
                    • La imagen se descargará en formato PNG de alta calidad
                  </li>
                  <li>
                    • Asegúrate de completar todos los campos obligatorios
                  </li>
                  <li>
                    • La descarga puede tardar unos segundos en procesarse
                  </li>
                  <li>• El archivo se guardará con el nombre del invitado</li>
                </ul>
              </div>
            </div>

            {/* Vista previa */}
            {uiState.showPreview &&
              formData.guestName &&
              formData.personalMessage && (
                <InvitationPreview ref={invitationRef} formData={formData} />
              )}

            {/* Información adicional */}
            <div className="bg-white/80 rounded-2xl p-6 border border-fuchsia-200 relative z-20">
              <h3 className="text-lg font-bold text-fuchsia-700 mb-4">
                ℹ️ Información del Evento
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p>
                    <strong>📅 Fecha:</strong> {EVENT_INFO.date}
                  </p>
                  <p>
                    <strong>🕖 Hora:</strong> {EVENT_INFO.time}
                  </p>
                </div>
                <div
                style={{display:'none'}}
                >
                  <p>
                    <strong>📍 Lugar:</strong> {EVENT_INFO.venue}
                  </p>
                  <p>
                    <strong>👗 Código de vestimenta:</strong>{" "}
                    {EVENT_INFO.dressCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomInvitations;
