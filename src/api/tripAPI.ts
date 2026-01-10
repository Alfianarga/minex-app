import client from './client';

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Helper: get start/end of "today" in WIB (UTC+7), expressed as UTC timestamps
function getTodayRangeWIB() {
  const now = new Date();
  // Geser ke WIB
  const local = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth(); // 0-based
  const d = local.getUTCDate();

  // 00:00 WIB hari ini = 17:00 UTC hari sebelumnya (UTC-7)
  const startUTC = new Date(Date.UTC(y, m, d, -7, 0, 0));
  // 00:00 WIB besok
  const endUTC = new Date(Date.UTC(y, m, d + 1, -7, 0, 0));

  return {
    from: startUTC.toISOString(),
    to: endUTC.toISOString(),
  };
}

export interface StartTripRequest {
  vehicleId: number;
  destination: string;
  material: string;
}

export interface CompleteTripRequest {
  tripToken: string;
  weightKg: number;
}

export type TripStatus = 'OPEN' | 'CLOSED_FIELD' | 'COMPLETED_PLANT' | 'ADJUSTED';

export interface Trip {
  id?: number;
  tripToken: string;
  vehicleId: number;
  destination: string;
  material: string;
  departureAt: string;
  arrivalAt?: string;
  weightKg?: number;
  status: TripStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const tripAPI = {
  async startTrip(data: StartTripRequest): Promise<Trip> {
    const response = await client.post<{ status: string; trip: Trip }>('/trip/start', data);
    return response.data.trip;
  },

  async completeTrip(data: CompleteTripRequest): Promise<Trip> {
    const response = await client.post<{ status: string; trip: Trip }>('/trip/complete', data);
    return response.data.trip;
  },

  async closeTripInField(tripToken: string): Promise<Trip> {
    const response = await client.post<{ status: string; trip: Trip }>('/trip/close-field', { tripToken });
    return response.data.trip;
  },

  async getTrips(): Promise<Trip[]> {
    const { from, to } = getTodayRangeWIB();
    const response = await client.get<Trip[]>('/trip', {
      params: { from, to },
    });
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

