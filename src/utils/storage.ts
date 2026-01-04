import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

export const offlineStorage = {
  async saveTrip(trip: any): Promise<void> {
    try {
      const trips = (await storage.getItem<any[]>(STORAGE_KEYS.OFFLINE_TRIPS)) || [];
      trips.push(trip);
      console.log('[OFFLINE] saveTrip -> total queued:', trips.length, 'newTrip:', {
        vehicleId: trip.vehicleId,
        destination: trip.destination,
        material: trip.material,
        departureAt: trip.departureAt,
        action: trip.action,
      });
      await storage.setItem(STORAGE_KEYS.OFFLINE_TRIPS, trips);
    } catch (error) {
      console.error('Error saving offline trip:', error);
    }
  },

  async getOfflineTrips(): Promise<any[]> {
    try {
      return await storage.getItem<any[]>(STORAGE_KEYS.OFFLINE_TRIPS) || [];
    } catch (error) {
      console.error('Error getting offline trips:', error);
      return [];
    }
  },

  async setOfflineTrips(trips: any[]): Promise<void> {
    try {
      await storage.setItem(STORAGE_KEYS.OFFLINE_TRIPS, trips);
    } catch (error) {
      console.error('Error setting offline trips:', error);
    }
  },

  async clearOfflineTrips(): Promise<void> {
    try {
      await storage.removeItem(STORAGE_KEYS.OFFLINE_TRIPS);
    } catch (error) {
      console.error('Error clearing offline trips:', error);
    }
  },
};

