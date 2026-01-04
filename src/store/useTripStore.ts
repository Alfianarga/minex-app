import { create } from 'zustand';
import { Trip, CompleteTripRequest, StartTripRequest } from '../api/tripAPI';
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
    const pendingTrips = trips.filter((t) => t.status === 'OPEN');
    set({ trips, pendingTrips });
  },
  addTrip: (trip) => {
    const trips = [...get().trips, trip];
    const pendingTrips = trips.filter((t) => t.status === 'OPEN');
    set({ trips, pendingTrips });
  },
  updateTrip: (tripToken, updates) => {
    const trips = get().trips.map((t) =>
      t.tripToken === tripToken.trim() ? { ...t, ...updates } : t
    );
    const pendingTrips = trips.filter((t) => t.status === 'OPEN');
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
      console.log('[SYNC] queued offline trips:', queued.length);
      const toSync = queued.filter(
        (t) => (t as any).completionPending || (t as any).action === 'START'
      );
      console.log('[SYNC] toSync (START + completionPending):', toSync.length);
      set({ syncingCount: toSync.length });

      const remaining: any[] = [];
      for (const t of queued) {
        // Sync offline START trips (from operator scans)
        if ((t as any).action === 'START') {
          console.log('[SYNC] START trip -> try startTrip:', {
            vehicleId: t.vehicleId,
            destination: t.destination,
            material: t.material,
          });
          const startData: StartTripRequest = {
            vehicleId: t.vehicleId,
            destination: t.destination,
            material: t.material,
          };
          try {
            const created = await tripAPI.startTrip(startData);
            console.log('[SYNC] START trip success, tripToken:', created.tripToken);
            get().addTrip(created);
            // Do not keep in remaining -> successfully synced
            continue;
          } catch (err: any) {
            const status = err?.response?.status as number | undefined;
            console.log('[SYNC] START trip error, status:', status);
            if (status === 409) {
              // Server already has a pending trip for this, treat as synced to avoid duplicates
              // Optionally we could refresh from server here if needed
              continue;
            }
            // Network or other errors: keep in queue to retry later
            remaining.push(t);
            continue;
          }
        }

        // Existing logic: sync completionPending trips
        if ((t as any).completionPending) {
          console.log('[SYNC] COMPLETE trip -> try completeTrip:', t.tripToken);
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
            console.log('[SYNC] COMPLETE trip error, status:', status);
            if (status === 409) {
              get().updateTrip(t.tripToken, { completionPending: false } as any);
            } else {
              remaining.push(t);
            }
          }
          continue;
        }

        // Anything else stays in the queue untouched
        remaining.push(t);
      }

      console.log('[SYNC] remaining offline trips after sync:', remaining.length);
      await offlineStorage.setOfflineTrips(remaining);
      set({ syncingCount: 0 });
    } finally {
      set({ isSyncingOffline: false });
    }
  },
}));

