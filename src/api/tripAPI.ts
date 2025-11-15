import client from './client';

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface StartTripRequest {
  tripToken: string;
  vehicleId: number;
  destination: string;
  material: string;
}

export interface CompleteTripRequest {
  tripToken: string;
  weightKg: number;
}

export interface Trip {
  id?: number;
  tripToken: string;
  vehicleId: number;
  destination: string;
  material: string;
  departureAt: string;
  arrivalAt?: string;
  weightKg?: number;
  status: 'Pending' | 'Completed';
  createdAt?: string;
  updatedAt?: string;
}

export const tripAPI = {
  async startTrip(data: StartTripRequest): Promise<Trip> {
    const response = await client.post<Trip>('/trip/start', data);
    return response.data;
  },

  async completeTrip(data: CompleteTripRequest): Promise<Trip> {
    const response = await client.post<Trip>('/trip/complete', data);
    return response.data;
  },

  async getTrips(): Promise<Trip[]> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const response = await client.get<Trip[]>('/trip', { params: { date: `${y}-${m}-${d}` } });
    return response.data;
  },

  async getTripByToken(tripToken: string): Promise<Trip> {
    const token = encodeURIComponent(tripToken.trim());
    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await client.get<Trip>(`/trip/${token}`);
        return response.data;
      } catch (err: any) {
        lastError = err;
        // Retry on 404 (eventual consistency) or transient network timeout
        const status = err?.response?.status;
        if (status === 404 || err?.code === 'ECONNABORTED') {
          await sleep(250 * (attempt + 1));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  },
};

