import { create } from 'zustand';
import { Trip } from '../api/tripAPI';
import { UserRole } from '../utils/constants';

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
      t.tripToken === tripToken ? { ...t, ...updates } : t
    );
    const pendingTrips = trips.filter((t) => t.status === 'Pending');
    set({ trips, pendingTrips });
  },
  getTripByToken: (tripToken) => {
    return get().trips.find((t) => t.tripToken === tripToken);
  },

  // Offline state
  offlineTrips: [],
  addOfflineTrip: (trip) => {
    set({ offlineTrips: [...get().offlineTrips, trip] });
  },
  clearOfflineTrips: () => set({ offlineTrips: [] }),
  syncOfflineTrips: async () => {
    // This will be implemented to sync offline trips when online
    const offlineTrips = get().offlineTrips;
    if (offlineTrips.length > 0) {
      // TODO: Implement sync logic
      console.log('Syncing offline trips:', offlineTrips.length);
    }
  },
}));

