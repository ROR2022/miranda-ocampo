// ================================================================
// 📁 components/AuthPanel.tsx
// ================================================================

import React from 'react';
import { AuthPanelProps } from '../types/invitation.types';
import { UI_MESSAGES, CSS_CLASSES } from '../constants/invitation.constants';

/**
 * Componente para el panel de autenticación de administrador
 */
export const AuthPanel: React.FC<AuthPanelProps> = ({
  authState,
  onUpdateAuth,
  onAuthenticate,
}) => {
  const { isAuthenticated, showAuthPopover, password, showPassword, authError } = authState;

  // Debug log
  //console.log('AuthPanel render - showAuthPopover:', showAuthPopover);

  // Si está autenticado, mostrar badge de admin
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-fuchsia-500 rounded-full shadow-lg">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-white text-xs font-medium">
          {UI_MESSAGES.ADMIN_AUTHENTICATED}
        </span>
      </div>
    );
  }

  return (
    <div
    style={{
      position: 'relative',
    }}
    >
      {/* Botón de configuración - Fijo en esquina superior derecha */}
      <div 
        style={{
          // Fixed position in top-right corner
          //position: '',
        }}
        className=" flex justify-center mb-6"
      >
        <button
          onClick={() => {
            //console.log('Admin button clicked, current showAuthPopover:', showAuthPopover);
            onUpdateAuth({ showAuthPopover: !showAuthPopover });
          }}
          className={`flex justify-center p-2 ${CSS_CLASSES.GRADIENT_SECONDARY} hover:from-fuchsia-600 hover:to-purple-800 rounded-full shadow-lg transition-colors`}
          title="Área de administración"
          aria-label="Abrir panel de administración"
        >
          <span role="img" aria-label="settings" className="text-white text-xl">
            ⚙️</span>
        </button>
      </div>

      {/* Modal de autenticación */}
      {showAuthPopover && (
        <div 
          style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2147483647,
            //backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Overlay de fondo */}
          <div
            style={{ 
              position: 'absolute',
              
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => {
              //console.log('Overlay clicked, closing modal');
              onUpdateAuth({ showAuthPopover: false });
            }}
            aria-hidden="true"
          />

          {/* Contenido del Modal */}
          <div 
            style={{ 
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '2px solid #f0abfc',
              padding: '24px',
              width: '100%',
              maxWidth: '28rem',
              margin: '0 16px',
              zIndex: 2147483647,
            }}
          >
            {/* Header del modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 'bold', color: '#a21caf', fontSize: '18px', margin: 0 }}>Admin Panel</h3>
              <button
                onClick={() => {
                  //console.log('Close button clicked');
                  onUpdateAuth({ showAuthPopover: false });
                }}
                style={{ 
                  padding: '4px', 
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#a21caf',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                aria-label="Cerrar panel"
              >
                <span style={{ fontSize: '20px' }}>✖️</span>
              </button>
            </div>

            {/* Formulario de autenticación */}
            <form onSubmit={onAuthenticate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Campo de contraseña */}
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => onUpdateAuth({ password: e.target.value })}
                  placeholder="Contraseña"
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 12px',
                    border: authError ? '1px solid #fca5a5' : '1px solid #f0abfc',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'black',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = authError ? '#f87171' : '#c084fc';
                    e.target.style.boxShadow = authError ? '0 0 0 2px rgba(248, 113, 113, 0.2)' : '0 0 0 2px rgba(192, 132, 252, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = authError ? '#fca5a5' : '#f0abfc';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                  autoComplete="current-password"
                  autoFocus
                />
                
                {/* Botón para mostrar/ocultar contraseña */}
                <button
                  type="button"
                  onClick={() => onUpdateAuth({ showPassword: !showPassword })}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#6b7280'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Mensaje de error */}
              {authError && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#fef2f2', 
                  border: '1px solid #fecaca', 
                  borderRadius: '8px' 
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#dc2626', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    margin: 0 
                  }}>
                    <span>⚠️</span>
                    {authError}
                  </p>
                </div>
              )}

              {/* Botón de acceso */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(to right, #c026d3, #9333ea)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: password.trim() ? 'pointer' : 'not-allowed',
                  opacity: password.trim() ? 1 : 0.6,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  if (password.trim()) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #a21caf, #7c3aed)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (password.trim()) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #c026d3, #9333ea)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }
                }}
                disabled={!password.trim()}
              >
                Acceder
              </button>
            </form>

            {/* Información adicional */}
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px' 
            }}>
              <p style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                textAlign: 'center',
                margin: 0 
              }}>
                🔒 Panel exclusivo para administradores
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};