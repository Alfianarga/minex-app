export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@minex/auth_token',
  USER_DATA: '@minex/user_data',
  PENDING_TRIPS: '@minex/pending_trips',
  OFFLINE_TRIPS: '@minex/offline_trips',
};

export const USER_ROLES = {
  OPERATOR: 'operator',
  CHECKER: 'checker',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const TRIP_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
} as const;

export type TripStatus = typeof TRIP_STATUS[keyof typeof TRIP_STATUS];

export const COLORS = {
  DARK: '#0a0a0a',
  GRAY: '#1a1a1a',
  GRAY_LIGHT: '#2a2a2a',
  ORANGE: '#ff6b35',
  ORANGE_DARK: '#e55a2b',
  GREEN: '#4ade80',
  YELLOW: '#fbbf24',
  WHITE: '#ffffff',
  TEXT_PRIMARY: '#f5f5f5',
  TEXT_SECONDARY: '#a0a0a0',
};

