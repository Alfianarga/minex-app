import client from './client';

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
    const response = await client.get<Trip[]>('/trip');
    return response.data;
  },

  async getTripByToken(tripToken: string): Promise<Trip> {
    const response = await client.get<Trip>(`/trip/${tripToken}`);
    return response.data;
  },
};

