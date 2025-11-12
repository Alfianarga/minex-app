import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trip } from '../api/tripAPI';
import { formatDate, getDuration } from '../utils/formatDate';
import { TRIP_STATUS } from '../utils/constants';

interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onPress }) => {
  const isCompleted = trip.status === TRIP_STATUS.COMPLETED;
  const statusColor = trip.status?.toUpperCase() === 'COMPLETED' ? 'bg-minex-green' : 'bg-minex-yellow';
  const statusTextColor = trip.status?.toUpperCase() === 'COMPLETED' ? 'text-white' : 'text-white';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-minex-gray-light rounded-lg p-4 mb-3 border border-minex-gray"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold mb-1">{trip.tripToken}</Text>
          <Text className="text-minex-text-secondary text-sm">Destination: {trip.destination}</Text>
        </View>
        <View className={`${statusColor} px-3 py-1 rounded-full`}>
          <Text className={`${statusTextColor} text-xs font-semibold`}>
            {trip.status}
          </Text>
        </View>
      </View>

      <View className="mt-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-minex-text-secondary text-sm">Departure:</Text>
          <Text className="text-white text-sm font-semibold">
            {formatDate(trip.departureAt)}
          </Text>
        </View>

        {isCompleted && trip.arrivalAt && (
          <>
            <View className="flex-row justify-between mb-2">
              <Text className="text-minex-text-secondary text-sm">Arrival:</Text>
              <Text className="text-white text-sm font-semibold">
                {formatDate(trip.arrivalAt)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-minex-text-secondary text-sm">Duration:</Text>
              <Text className="text-white text-sm font-semibold">
                {getDuration(trip.departureAt, trip.arrivalAt)}
              </Text>
            </View>
            {trip.weightKg && (
              <View className="flex-row justify-between">
                <Text className="text-minex-text-secondary text-sm">Weight:</Text>
                <Text className="text-minex-orange text-sm font-bold">
                  {(trip.weightKg / 1000).toFixed(2)} tons
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

