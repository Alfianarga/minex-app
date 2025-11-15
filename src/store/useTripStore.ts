import { create } from 'zustand';
import { Trip, CompleteTripRequest } from '../api/tripAPI';
import { UserRole } from '../utils/constants';
import { offlineStorage } from '../utils/storage';
import { tripAPI } from '../api/tripAPI';

interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface TripState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Trip state
  trips: Trip[];
  pendingTrips: Trip[];
  setTrips: (trips: Trip[]) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (tripToken: string, updates: Partial<Trip>) => void;
  getTripByToken: (tripToken: string) => Trip | undefined;

  // Offline state
  offlineTrips: Trip[];
  addOfflineTrip: (trip: Trip) => void;
  clearOfflineTrips: () => void;
  isSyncingOffline: boolean;
  syncingCount: number;
  syncOfflineTrips: () => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
  // Auth state
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false, trips: [], pendingTrips: [] }),

  // Trip state
  trips: [],
  pendingTrips: [],
  setTrips: (trips) => {
    const pendingTrips = trips.filter((t) => t.status === 'Pending');
    set({ trips, pendingTrips });
  },
  addTrip: (trip) => {
    const trips = [...get().trips, trip];
    const pendingTrips = trips.filter((t) => t.status === 'Pending');
    set({ trips, pendingTrips });
  },
  updateTrip: (tripToken, updates) => {
    const trips = get().trips.map((t) =>
      t.tripToken === tripToken.trim() ? { ...t, ...updates } : t
    );
    const pendingTrips = trips.filter((t) => t.status === 'Pending');
    set({ trips, pendingTrips });
  },
  getTripByToken: (tripToken) => {
    const token = tripToken.trim();
    return get().trips.find((t) => t.tripToken === token);
  },

  // Offline state
  offlineTrips: [],
  addOfflineTrip: (trip) => {
    set({ offlineTrips: [...get().offlineTrips, trip] });
  },
  clearOfflineTrips: () => set({ offlineTrips: [] }),
  isSyncingOffline: false,
  syncingCount: 0,
  syncOfflineTrips: async () => {
    if (get().isSyncingOffline) return;
    set({ isSyncingOffline: true });
    try {
      const queued = await offlineStorage.getOfflineTrips();
      const toSync = queued.filter((t) => (t as any).completionPending);
      set({ syncingCount: toSync.length });

      const remaining: any[] = [];
      for (const t of queued) {
        if (!(t as any).completionPending) {
          remaining.push(t);
          continue;
        }
        const payload: CompleteTripRequest = {
          tripToken: t.tripToken,
          weightKg: t.weightKg || 0,
        };
        try {
          const completed = await tripAPI.completeTrip(payload);
          const updated = { ...completed } as any;
          updated.completionPending = false;
          updated.offline = false;
          get().updateTrip(t.tripToken, updated);
        } catch (err: any) {
          const status = err?.response?.status as number | undefined;
          if (status === 409) {
            get().updateTrip(t.tripToken, { completionPending: false } as any);
          } else {
            remaining.push(t);
          }
        }
      }
      await offlineStorage.setOfflineTrips(remaining);
      set({ syncingCount: 0 });
    } finally {
      set({ isSyncingOffline: false });
    }
  },
}));

