// Tipos para el sistema de gestión de invitados

export interface Guest {
  _id: string;
  name: string;
  phone?: string;
  relation: 'familia' | 'amigos' | 'escuela' | 'trabajo' | 'otros';
  
  personalInvitation?: {
    sent: boolean;
    sentAt?: string;
    message: string;
    numberOfGuests: number;
  };
  
  attendance?: {
    confirmed: boolean;
    confirmedAt?: string;
    message?: string;
    numberOfGuestsConfirmed: number;
    source?: 'personal-invitation' | 'direct-confirmation';
    comments?: string; // Nuevo campo para comentarios adicionales
  };
  
  // Nuevos campos para sistema automático multi-campo
  notes?: string; // Para guardar información sobre creación automática
  autoCreated?: boolean; // Flag para identificar registros auto-generados
  searchedName?: string; // Nombre original buscado si fue diferente
  
  status: 'pending' | 'invited' | 'confirmed' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface GuestStats {
  overview: {
    totalGuests: number;
    totalConfirmed: number;
    totalInvited: number;
    totalPending: number;
    totalGuestCount: number;
    confirmationRate: number;
  };
  byRelation: Array<{
    relation: string;
    total: number;
    confirmed: number;
    confirmationRate: number;
  }>;
  dailyConfirmations: Array<{
    date: string;
    confirmations: number;
    totalGuests: number;
  }>;
  recentGuests: Array<{
    id: string;
    name: string;
    relation: string;
    status: string;
    createdAt: string;
    confirmed: boolean;
    confirmedAt?: string;
  }>;
  generatedAt: string;
}

export interface GuestFilters {
  search: string;
  status: 'all' | 'pending' | 'invited' | 'confirmed' | 'declined';
  relation: 'all' | 'familia' | 'amigos' | 'escuela' | 'trabajo' | 'otros';
}

export interface GuestFormData {
  name: string;
  phone: string;
  relation: 'familia' | 'amigos' | 'escuela' | 'trabajo' | 'otros';
}

export interface PaginationInfo {
  current: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalItems: number;
}

export interface GuestsResponse {
  success: boolean;
  data: {
    guests: Guest[];
    pagination: PaginationInfo;
  };
  error?: string;
}

export interface GuestResponse {
  success: boolean;
  data: Guest;
  message?: string;
  error?: string;
}

export interface StatsResponse {
  success: boolean;
  data: GuestStats;
  error?: string;
}

// Opciones para relaciones
export const RELATION_OPTIONS: Array<{ value: Guest['relation']; label: string }> = [
  { value: 'familia', label: 'Familia' },
  { value: 'amigos', label: 'Amigos' },
  { value: 'escuela', label: 'Escuela' },
  { value: 'trabajo', label: 'Trabajo' },
  { value: 'otros', label: 'Otros' }
];

// Opciones para estados
export const STATUS_OPTIONS: Array<{ value: GuestFilters['status']; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'invited', label: 'Invitados' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'declined', label: 'Declinados' }
];

// Colores para estados (Aurora Pastel)
export const STATUS_COLORS = {
  pending: {
    bg: 'rgba(255, 242, 204, 0.3)', // Oro Aurora suave
    border: 'var(--color-aurora-oro)',
    text: 'var(--color-aurora-oro)'
  },
  invited: {
    bg: 'rgba(230, 217, 255, 0.3)', // Lavanda Aurora
    border: 'var(--color-aurora-lavanda)',
    text: 'var(--color-aurora-lavanda)'
  },
  confirmed: {
    bg: 'rgba(232, 245, 232, 0.5)', // Verde Aurora
    border: '#22c55e',
    text: '#16a34a'
  },
  declined: {
    bg: 'rgba(255, 230, 230, 0.5)', // Rosa coral suave
    border: '#ef4444',
    text: '#dc2626'
  }
} as const;
