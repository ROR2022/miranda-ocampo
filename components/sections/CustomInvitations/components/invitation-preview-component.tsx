// ================================================================
// 📁 components/InvitationPreview.tsx
// ================================================================

import React, { forwardRef } from 'react';
import { InvitationPreviewProps } from '../types/invitation.types';
import { EVENT_INFO } from '../constants/invitation.constants';

/**
 * Componente de vista previa de la invitación
 */
export const InvitationPreview = forwardRef<HTMLDivElement, InvitationPreviewProps>(
  ({ formData }, ref) => {
    return (
      <div 
        ref={ref}
        className="mt-8 p-6 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-purple-700 rounded-2xl text-white shadow-2xl relative overflow-hidden"
      >
        {/* Decoraciones aurora */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-4 left-4 text-4xl">✨</div>
          <div className="absolute top-8 right-8 text-3xl">👑</div>
          <div className="absolute bottom-4 left-8 text-2xl">💜</div>
          <div className="absolute bottom-8 right-4 text-3xl">🌟</div>
        </div>
        
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold mb-4 text-yellow-200">✨ {EVENT_INFO.partyTitle} {EVENT_INFO.quinceaneraName}  ✨</h2>
          <div className="space-y-3 text-lg">
            <p><strong>Invitado especial:</strong> {formData.guestName}</p>
            <p className="italic bg-white/20 p-3 rounded-lg">&quot;{formData.personalMessage}&quot;</p>
            <div className="space-y-1 text-sm">
              <p>📅 <strong>Fecha:</strong> {EVENT_INFO.date}</p>
              <p>🕖 <strong>Hora:</strong> {EVENT_INFO.time}</p>
              <p>📍 <strong>Lugar:</strong> {EVENT_INFO.venue}</p>
              <p>👥 <strong>Invitados:</strong> {formData.numberOfGuests} {parseInt(formData.numberOfGuests) === 1 ? 'persona' : 'personas'}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/20 rounded-lg">
            <p className="text-sm">💜 Con cariño, {EVENT_INFO.quinceaneraName}</p>
          </div>
        </div>
      </div>
    );
  }
);

InvitationPreview.displayName = 'InvitationPreview';
